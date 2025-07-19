import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import VirtualVideoPlayer from "./VirtualVideoPlayer";
import { VideoItem, useEventVideos } from "@/contexts/EventVideosContext";
import { videoCacheService } from "@/services/videoCacheService";
import log from "@/utils/logger";

interface VideoCarouselProps {
  videos: VideoItem[];
  initialIndex: number;
  onIndexChange: (_index: number) => void;
}

export default function VideoCarousel({
  videos,
  initialIndex,
  onIndexChange,
}: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [containerHeight, setContainerHeight] = useState(0);

  // Get load more functions and state from context
  const {
    loadMoreAllVideos,
    loadMoreUserVideos,
    activeTab,
    allVideosLoadingMore,
    userVideosLoadingMore,
    allVideosHasMore,
    userVideosHasMore,
  } = useEventVideos();

  // Start with the current video centered (translateY = 0 shows the middle slot)
  const translateY = useSharedValue(0);

  // Video component pool - keep track of active video components for instant playback
  const [activeVideoComponents, setActiveVideoComponents] = useState<{
    [videoId: string]: {
      video: VideoItem;
      index: number;
      isVisible: boolean;
      isPlaying: boolean;
    };
  }>({});

  // Range of videos to keep loaded (currentIndex ± PRELOAD_RANGE)
  const PRELOAD_RANGE = 2;

  // Calculate which videos should be active (in memory) around current index
  const activeVideoIndices = useMemo(() => {
    const indices = [];
    for (
      let i = Math.max(0, currentIndex - PRELOAD_RANGE);
      i <= Math.min(videos.length - 1, currentIndex + PRELOAD_RANGE);
      i++
    ) {
      indices.push(i);
    }
    return indices;
  }, [currentIndex, videos.length, PRELOAD_RANGE]);

  // Update video component pool when active indices change
  useEffect(() => {
    const updateVideoPool = () => {
      // Use functional update to avoid dependency on activeVideoComponents
      setActiveVideoComponents((prevComponents) => {
        const newActiveComponents: typeof prevComponents = {};

        // Keep existing components that are still in range (no re-render!)
        Object.keys(prevComponents).forEach((videoId) => {
          const component = prevComponents[videoId];
          if (activeVideoIndices.includes(component.index)) {
            newActiveComponents[videoId] = {
              ...component,
              isVisible: component.index === currentIndex,
              isPlaying: component.index === currentIndex,
            };
          }
        });

        // Add new components for videos entering the range
        activeVideoIndices.forEach((index) => {
          const video = videos[index];
          if (video && !newActiveComponents[video.id]) {
            newActiveComponents[video.id] = {
              video,
              index,
              isVisible: index === currentIndex,
              isPlaying: index === currentIndex,
            };
          }
        });

        // Log video pool changes for debugging
        const addedVideos = Object.keys(newActiveComponents).filter(
          (id) => !prevComponents[id]
        );
        const removedVideos = Object.keys(prevComponents).filter(
          (id) => !newActiveComponents[id]
        );
        const currentVideo = Object.values(newActiveComponents).find(
          (comp) => comp.isVisible
        );

        if (addedVideos.length > 0) {
          log.info(
            `[VideoCarousel] Added videos to pool: ${addedVideos.join(", ")}`
          );
        }
        if (removedVideos.length > 0) {
          log.info(
            `[VideoCarousel] Removed videos from pool: ${removedVideos.join(
              ", "
            )}`
          );
        }
        if (currentVideo) {
          log.info(
            `[VideoCarousel] Current video: ${currentVideo.video.id} (index ${currentVideo.index})`
          );
        }

        // Create a compact summary of all videos in pool
        const poolSummary = Object.values(newActiveComponents)
          .sort((a, b) => a.index - b.index)
          .map((comp) => {
            const status = comp.isPlaying
              ? "PLAYING"
              : comp.isVisible
              ? "VISIBLE"
              : "LOADED";
            return `${comp.video.id}(idx:${comp.index},${status})`;
          })
          .join(" | ");

        log.info(
          `[VideoCarousel] Video pool state: ${
            Object.keys(newActiveComponents).length
          } videos - currentIndex=${currentIndex} - [${poolSummary}]`
        );

        // Log detailed state of each video for debugging
        Object.values(newActiveComponents)
          .sort((a, b) => a.index - b.index)
          .forEach((comp) => {
            const offset = (comp.index - currentIndex) * containerHeight;
            log.info(
              `  Video ${comp.video.id}: index=${comp.index}, offset=${offset}px, ` +
                `playing=${comp.isPlaying}, visible=${comp.isVisible}`
            );
          });

        return newActiveComponents;
      });

      // Preload videos around current index
      videoCacheService.preloadVideosAround(videos, currentIndex);

      // Load more videos when approaching the end
      const shouldLoadMore = currentIndex >= videos.length - 3;

      if (shouldLoadMore) {
        const isCurrentlyLoadingMore =
          activeTab === "all" ? allVideosLoadingMore : userVideosLoadingMore;
        const hasMoreVideos =
          activeTab === "all" ? allVideosHasMore : userVideosHasMore;

        if (!isCurrentlyLoadingMore && hasMoreVideos) {
          if (activeTab === "all") {
            loadMoreAllVideos();
          } else {
            loadMoreUserVideos();
          }
        }
      }
    };

    updateVideoPool();
  }, [
    currentIndex,
    videos,
    activeVideoIndices,
    // Note: activeVideoComponents removed to prevent infinite loop
    activeTab,
    allVideosLoadingMore,
    userVideosLoadingMore,
    allVideosHasMore,
    userVideosHasMore,
    loadMoreAllVideos,
    loadMoreUserVideos,
  ]);

  // Initialize position
  useEffect(() => {
    setCurrentIndex(initialIndex);
    // Start at center position (0 = videos in correct slots)
    translateY.value = 0;
  }, [initialIndex]);

  const changeIndex = (newIndex: number) => {
    if (
      newIndex >= 0 &&
      newIndex < videos.length &&
      newIndex !== currentIndex
    ) {
      setCurrentIndex(newIndex);
      onIndexChange(newIndex);
    }
  };

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (_, context) => {
        context.startY = translateY.value;
      },
      onActive: (event, context) => {
        translateY.value = (context.startY as number) + event.translationY;
      },
      onEnd: (event) => {
        const { velocityY, translationY } = event;
        const threshold = containerHeight * 0.25;

        let targetIndex = currentIndex;

        // Improved target index calculation
        if (Math.abs(translationY) > threshold) {
          // Calculate how many videos to skip based on translation distance
          const videosToSkip = Math.floor(
            Math.abs(translationY) / containerHeight
          );
          const direction = translationY < 0 ? 1 : -1; // Up swipe = next (+1), Down swipe = previous (-1)

          targetIndex = currentIndex + direction * (1 + videosToSkip);

          // Clamp to valid range
          targetIndex = Math.max(0, Math.min(videos.length - 1, targetIndex));
        } else if (Math.abs(velocityY) > 800) {
          // Fast swipe - move by 1
          if (velocityY < 0 && currentIndex < videos.length - 1) {
            targetIndex = currentIndex + 1;
          } else if (velocityY > 0 && currentIndex > 0) {
            targetIndex = currentIndex - 1;
          }
        }

        if (targetIndex !== currentIndex) {
          // Update index immediately for instant video switching
          runOnJS(changeIndex)(targetIndex);

          // Animate back to center for smooth visual transition
          translateY.value = withSpring(0, {
            damping: 100,
            stiffness: 300,
          });
        } else {
          // No index change - just spring back to center
          translateY.value = withSpring(0, {
            damping: 100,
            stiffness: 300,
          });
        }
      },
    });

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  };

  // Create animated style for the entire carousel that moves during gestures
  const carouselAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[styles.carouselContainer, carouselAnimatedStyle]}
        >
          {/* Render all active video components with clean absolute positioning */}
          {Object.values(activeVideoComponents).map((component) => {
            const baseOffset =
              (component.index - currentIndex) * containerHeight;

            log.info(
              `[VideoCarousel] Positioning video ${component.video.id}: ` +
                `baseOffset=${baseOffset}px, currentIndex=${currentIndex}, ` +
                `videoIndex=${component.index}, containerHeight=${containerHeight}`
            );

            return (
              <View
                key={component.video.id}
                style={[
                  styles.videoContainer,
                  {
                    height: containerHeight,
                    transform: [{ translateY: baseOffset }],
                    opacity: 1,
                    zIndex: component.isVisible ? 10 : 5,
                  },
                ]}
              >
                <VirtualVideoPlayer
                  video={component.video}
                  isActive={component.isPlaying}
                  style={styles.video}
                />

                {/* Debug overlay */}
                <View style={styles.debugOverlay}>
                  <Text style={styles.debugText}>
                    {component.video.id.substring(0, 8)}...
                  </Text>
                  <Text style={styles.debugText}>Index: {component.index}</Text>
                  <Text style={styles.debugText}>Base: {baseOffset}px</Text>
                  <Text style={styles.debugText}>
                    {component.isPlaying ? "PLAYING" : "PAUSED"}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
    width: "100%",
  },
  videoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
  video: {
    flex: 1,
  },
  debugOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    color: "white",
    fontSize: 12,
  },
});
