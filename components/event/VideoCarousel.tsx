// import React, { useEffect, useState } from "react";
// import { View, StyleSheet, Dimensions } from "react-native";
// import {
//   PanGestureHandler,
//   PanGestureHandlerGestureEvent,
// } from "react-native-gesture-handler";
// import Animated, {
//   useAnimatedGestureHandler,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   runOnJS,
// } from "react-native-reanimated";
// import VirtualVideoPlayer from "./VirtualVideoPlayer";
// import { VideoItem } from "@/contexts/EventVideosContext";
// import { videoCacheService } from "@/services/video/videoCacheService";

// const { height } = Dimensions.get("window");
// const SCREEN_HEIGHT = height - 60; // Account for header

// interface VideoCarouselProps {
//   videos: VideoItem[];
//   initialIndex: number;
//   onIndexChange: (_index: number) => void;
// }

// export default function VideoCarousel({
//   videos,
//   initialIndex,
//   onIndexChange,
// }: VideoCarouselProps) {
//   const [currentIndex, setCurrentIndex] = useState(initialIndex);
//   const translateY = useSharedValue(-initialIndex * SCREEN_HEIGHT);

//   // Three video slots: previous, current, next
//   const [videoSlots, setVideoSlots] = useState<{
//     previous: VideoItem | null;
//     current: VideoItem | null;
//     next: VideoItem | null;
//   }>({
//     previous: null,
//     current: null,
//     next: null,
//   });

//   useEffect(() => {
//     console.log("new log");
//     console.log("videoSlots id", videoSlots.current?.id);
//     console.log("videoSlots previous id", videoSlots.previous?.id);
//     console.log("videoSlots next id", videoSlots.next?.id);
//   }, [videoSlots]);

//   // Update video slots when index changes
//   useEffect(() => {
//     const updateSlots = () => {
//       setVideoSlots({
//         previous: currentIndex > 0 ? videos[currentIndex - 1] : null,
//         current: videos[currentIndex] || null,
//         next:
//           currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null,
//       });

//       // Preload videos around current index
//       videoCacheService.preloadVideosAround(videos, currentIndex);
//     };

//     updateSlots();
//   }, [currentIndex, videos]);

//   // Initialize position
//   useEffect(() => {
//     setCurrentIndex(initialIndex);
//     translateY.value = -initialIndex * SCREEN_HEIGHT;
//   }, [initialIndex]);

//   const changeIndex = (newIndex: number) => {
//     if (
//       newIndex >= 0 &&
//       newIndex < videos.length &&
//       newIndex !== currentIndex
//     ) {
//       setCurrentIndex(newIndex);
//       onIndexChange(newIndex);
//     }
//   };

//   const gestureHandler =
//     useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
//       onStart: (_, context) => {
//         context.startY = translateY.value;
//       },
//       onActive: (event, context) => {
//         translateY.value = (context.startY as number) + event.translationY;
//       },
//       onEnd: (event) => {
//         const { velocityY, translationY } = event;
//         const threshold = SCREEN_HEIGHT * 0.3;

//         let targetIndex = currentIndex;

//         if (Math.abs(translationY) > threshold || Math.abs(velocityY) > 1000) {
//           if (translationY < 0 && currentIndex < videos.length - 1) {
//             // Swipe up - next video
//             targetIndex = currentIndex + 1;
//           } else if (translationY > 0 && currentIndex > 0) {
//             // Swipe down - previous video
//             targetIndex = currentIndex - 1;
//           }
//         }

//         const targetY = -targetIndex * SCREEN_HEIGHT;
//         translateY.value = withSpring(targetY, {
//           damping: 20,
//           stiffness: 300,
//         });

//         if (targetIndex !== currentIndex) {
//           runOnJS(changeIndex)(targetIndex);
//         }
//       },
//     });

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//   }));

//   return (
//     <PanGestureHandler onGestureEvent={gestureHandler}>
//       <Animated.View style={[styles.container, animatedStyle]}>
//         {/* Previous video slot */}
//         <View style={styles.videoSlot}>
//           <VirtualVideoPlayer
//             video={videoSlots.previous}
//             isActive={false}
//             style={styles.video}
//           />
//         </View>

//         {/* Current video slot */}
//         <View style={styles.videoSlot}>
//           <VirtualVideoPlayer
//             video={videoSlots.current}
//             isActive={true}
//             style={styles.video}
//           />
//         </View>

//         {/* Next video slot */}
//         <View style={styles.videoSlot}>
//           <VirtualVideoPlayer
//             video={videoSlots.next}
//             isActive={false}
//             style={styles.video}
//           />
//         </View>
//       </Animated.View>
//     </PanGestureHandler>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   videoSlot: {
//     height: SCREEN_HEIGHT,
//     width: "100%",
//   },
//   video: {
//     flex: 1,
//   },
// });

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
import { videoCacheService } from "@/services/video/videoCacheService";

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
  // Always keep the current video in the middle slot (index 1)
  const translateY = useSharedValue(-SCREEN_HEIGHT);

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
      setVideoSlots({
        previous: currentIndex > 0 ? videos[currentIndex - 1] : null,
        current: videos[currentIndex] || null,
        next:
          currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null,
      });

      // Preload videos around current index
      videoCacheService.preloadVideosAround(videos, currentIndex);
    };

    updateSlots();
  }, [currentIndex, videos]);

  // Initialize position - always start with current video in middle
  useEffect(() => {
    setCurrentIndex(initialIndex);
    // Always keep the carousel positioned to show the middle slot (current video)
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
        const threshold = SCREEN_HEIGHT * 0.3;

        let targetIndex = currentIndex;

        if (Math.abs(translationY) > threshold || Math.abs(velocityY) > 1000) {
          if (translationY < 0 && currentIndex < videos.length - 1) {
            // Swipe up - next video
            targetIndex = currentIndex + 1;
          } else if (translationY > 0 && currentIndex > 0) {
            // Swipe down - previous video
            targetIndex = currentIndex - 1;
          }
        }

        // Always return to middle position (showing current video)
        const targetY = -SCREEN_HEIGHT;
        translateY.value = withSpring(targetY, {
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
        {/* Previous video slot */}
        <View style={styles.videoSlot}>
          <VirtualVideoPlayer
            video={videoSlots.previous}
            // isActive={false}
            isActive={true}
            style={styles.video}
          />
        </View>

        {/* Current video slot */}
        <View style={styles.videoSlot}>
          <VirtualVideoPlayer
            video={videoSlots.current}
            isActive={true}
            style={styles.video}
          />
        </View>

        {/* Next video slot */}
        <View style={styles.videoSlot}>
          <VirtualVideoPlayer
            video={videoSlots.next}
            // isActive={false}
            isActive={true}
            style={styles.video}
          />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoSlot: {
    height: SCREEN_HEIGHT,
    width: "100%",
  },
  video: {
    flex: 1,
  },
});
