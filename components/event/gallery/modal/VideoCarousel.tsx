import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import VirtualVideoPlayer from "./VirtualVideoPlayer";
import { VideoItem, useEventVideos } from "@/contexts/event/EventVideosContext";
import { videoCacheService } from "@/services/videoCacheService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoCarouselProps {
  videos: VideoItem[];
  initialIndex: number;
  onIndexChange: (_index: number) => void;
  onClose?: () => void;
}

export default function VideoCarousel({
  videos,
  initialIndex,
  onIndexChange,
  onClose,
}: VideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(
    new Set([initialIndex])
  );
  const [isMuted, setIsMuted] = useState(false);
  const translateY = useSharedValue(-initialIndex * SCREEN_HEIGHT);
  const isAnimating = useRef(false);
  const pendingIndex = useRef<number | null>(null);

  const { loadMoreVideos, loadingMore, hasMore } = useEventVideos();

  // Load videos with priority
  const loadVideosWithPriority = useCallback(
    (targetIndex: number) => {
      if (isAnimating.current) {
        // Store for later if we're still animating
        pendingIndex.current = targetIndex;
        return;
      }

      // Clear pending index
      pendingIndex.current = null;

      // Update loaded videos set
      setLoadedVideos((prev) => {
        const newSet = new Set(prev);

        // Priority order: target index first, then adjacent
        newSet.add(targetIndex);

        // Add adjacent videos after a small delay to prioritize current
        setTimeout(() => {
          if (!isAnimating.current) {
            setLoadedVideos((prevSet) => {
              const updated = new Set(prevSet);
              // Add adjacent videos
              if (targetIndex > 0) updated.add(targetIndex - 1);
              if (targetIndex < videos.length - 1) updated.add(targetIndex + 1);

              // Extended preload when idle
              setTimeout(() => {
                if (!isAnimating.current) {
                  setLoadedVideos((prevSet2) => {
                    const extended = new Set(prevSet2);
                    if (targetIndex > 1) extended.add(targetIndex - 2);
                    if (targetIndex < videos.length - 2)
                      extended.add(targetIndex + 2);
                    return extended;
                  });
                }
              }, 200);

              return updated;
            });
          }
        }, 100);

        return newSet;
      });

      // Preload video cache
      videoCacheService.preloadVideosAround(videos, targetIndex);

      // Check if we need to load more videos
      if (targetIndex >= videos.length - 3) {
        if (!loadingMore && hasMore) {
          loadMoreVideos();
        }
      }
    },
    [videos, loadingMore, hasMore, loadMoreVideos]
  );

  // Initial load
  useEffect(() => {
    loadVideosWithPriority(initialIndex);
  }, [initialIndex]);

  // Handle pending loads after animation
  useEffect(() => {
    if (!isAnimating.current && pendingIndex.current !== null) {
      loadVideosWithPriority(pendingIndex.current);
    }
  }, [loadVideosWithPriority]);

  // Update current index and notify parent
  const updateIndex = useCallback(
    (newIndex: number) => {
      if (
        newIndex >= 0 &&
        newIndex < videos.length &&
        newIndex !== currentIndex
      ) {
        setCurrentIndex(newIndex);
        onIndexChange(newIndex);
      }
    },
    [currentIndex, videos.length, onIndexChange]
  );

  // Pause loading during animation
  const startAnimation = useCallback(() => {
    isAnimating.current = true;
  }, []);

  // Resume loading after animation
  const endAnimation = useCallback(
    (targetIndex: number) => {
      isAnimating.current = false;
      updateIndex(targetIndex);
      loadVideosWithPriority(targetIndex);
    },
    [updateIndex, loadVideosWithPriority]
  );

  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (_, context) => {
        context.startY = translateY.value;
        runOnJS(startAnimation)();
      },
      onActive: (event, context) => {
        translateY.value = (context.startY as number) + event.translationY;
      },
      onEnd: (event) => {
        const currentOffset = translateY.value;
        const currentIndexFromOffset = Math.round(
          -currentOffset / SCREEN_HEIGHT
        );

        // Calculate target index based on gesture
        let targetIndex = currentIndexFromOffset;

        // Check for significant swipe
        if (Math.abs(event.velocityY) > 500) {
          if (event.velocityY < 0) {
            targetIndex = Math.min(
              videos.length - 1,
              currentIndexFromOffset + 1
            );
          } else {
            targetIndex = Math.max(0, currentIndexFromOffset - 1);
          }
        }

        // Clamp to valid range
        targetIndex = Math.max(0, Math.min(videos.length - 1, targetIndex));

        // Animate to target position
        translateY.value = withTiming(
          -targetIndex * SCREEN_HEIGHT,
          {
            duration: 200,
          },
          (finished) => {
            if (finished) {
              runOnJS(endAnimation)(targetIndex);
            }
          }
        );
      },
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Render only loaded videos for performance
  const renderRange = 3; // Slightly larger than load range for smooth appearance

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.scrollContainer, animatedStyle]}>
          {videos.map((video, index) => {
            // Skip rendering if too far from current index
            if (Math.abs(index - currentIndex) > renderRange) {
              return <View key={video.id} style={styles.videoSlot} />;
            }

            // Only mount video player if loaded
            const isLoaded = loadedVideos.has(index);
            const isActive = index === currentIndex && !isAnimating.current;

            return (
              <View key={video.id} style={styles.videoSlot}>
                {isLoaded ? (
                  <VirtualVideoPlayer
                    video={video}
                    isActive={isActive}
                    isMuted={isMuted}
                    onMuteToggle={handleMuteToggle}
                    style={styles.video}
                    onClose={onClose}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>Loading...</Text>
                  </View>
                )}
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
    backgroundColor: "black",
  },
  scrollContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  videoSlot: {
    height: SCREEN_HEIGHT,
    width: "100%",
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },
});
