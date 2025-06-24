import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
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
import { VideoItem } from "@/contexts/EventVideosContext";
import { videoCacheService } from "@/services/videoCacheService";

const { height } = Dimensions.get("window");
const SCREEN_HEIGHT = height - 60; // Account for header

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

  // Start with the current video centered (translateY = 0 shows the middle slot)
  const translateY = useSharedValue(0);

  // Three video slots: previous, current, next
  const [videoSlots, setVideoSlots] = useState<{
    previous: VideoItem | null;
    current: VideoItem | null;
    next: VideoItem | null;
  }>({
    previous: null,
    current: null,
    next: null,
  });

  // Update video slots when index changes
  useEffect(() => {
    const updateSlots = () => {
      const previous = currentIndex > 0 ? videos[currentIndex - 1] : null;
      const current = videos[currentIndex] || null;
      const next =
        currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

      setVideoSlots({
        previous,
        current,
        next,
      });

      // Preload videos around current index
      videoCacheService.preloadVideosAround(videos, currentIndex);
    };

    updateSlots();
  }, [currentIndex, videos]);

  // Initialize position - center the current video
  useEffect(() => {
    setCurrentIndex(initialIndex);
    // Position to show the middle slot (current video) - offset by one screen height
    translateY.value = -SCREEN_HEIGHT;
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
        const threshold = SCREEN_HEIGHT * 0.25; // Reduced threshold for easier swiping

        let targetIndex = currentIndex;

        if (Math.abs(translationY) > threshold || Math.abs(velocityY) > 800) {
          if (translationY < 0 && currentIndex < videos.length - 1) {
            // Swipe up - next video (going down in the list)
            targetIndex = currentIndex + 1;
          } else if (translationY > 0 && currentIndex > 0) {
            // Swipe down - previous video (going up in the list)
            targetIndex = currentIndex - 1;
          }
        }

        // Always return to center position (-SCREEN_HEIGHT = current video visible)
        translateY.value = withSpring(-SCREEN_HEIGHT, {
          damping: 20,
          stiffness: 300,
        });

        if (targetIndex !== currentIndex) {
          runOnJS(changeIndex)(targetIndex);
        }
      },
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Previous video slot - positioned above */}
        <View style={styles.videoSlot}>
          <VirtualVideoPlayer
            key={`previous-${videoSlots.previous?.id || "empty"}`}
            video={videoSlots.previous}
            isActive={false} // Only current video should be active
            style={styles.video}
          />
        </View>

        {/* Current video slot - this should be visible by default */}
        <View style={styles.videoSlot}>
          <VirtualVideoPlayer
            key={`current-${videoSlots.current?.id || "empty"}`}
            video={videoSlots.current}
            isActive={true}
            style={styles.video}
          />
        </View>

        {/* Next video slot - positioned below */}
        <View style={styles.videoSlot}>
          <VirtualVideoPlayer
            key={`next-${videoSlots.next?.id || "empty"}`}
            video={videoSlots.next}
            isActive={false} // Only current video should be active
            style={styles.video}
          />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    // Remove the static transform - we'll handle positioning with animated translateY
  },
  videoSlot: {
    height: SCREEN_HEIGHT,
    width: "100%",
  },
  video: {
    flex: 1,
  },
});
