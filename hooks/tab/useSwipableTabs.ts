import { useState } from "react";
import { Dimensions } from "react-native";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface UseSwipableTabsProps {
  childrenCount: number;
  initialIndex?: number;
}

export const useSwipableTabs = ({
  childrenCount,
  initialIndex = 1,
}: UseSwipableTabsProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useSharedValue(-initialIndex * SCREEN_WIDTH);

  const handleTabPress = (index: number) => {
    setCurrentIndex(index);
    const targetTranslateX = -index * SCREEN_WIDTH;
    // Instant transition for tab clicks
    translateX.value = targetTranslateX;
  };

  const isTabActive = (index: number) => currentIndex === index;

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (_, context: any) => {
        context.startX = translateX.value;
      },
      onActive: (event, context: any) => {
        // Only handle horizontal gestures
        if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
          const newTranslateX = context.startX + event.translationX;
          // Limit the swipe to prevent going beyond the first and last tabs
          const maxTranslateX = 0;
          const minTranslateX = -(childrenCount - 1) * SCREEN_WIDTH;
          translateX.value = Math.max(
            minTranslateX,
            Math.min(maxTranslateX, newTranslateX)
          );
        }
      },
      onEnd: (event) => {
        // Only handle horizontal gestures
        if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
          const shouldSwipeLeft =
            event.velocityX < -500 || event.translationX < -SCREEN_WIDTH * 0.3;
          const shouldSwipeRight =
            event.velocityX > 500 || event.translationX > SCREEN_WIDTH * 0.3;

          let targetIndex = currentIndex;

          if (shouldSwipeLeft && currentIndex < childrenCount - 1) {
            targetIndex = currentIndex + 1;
          } else if (shouldSwipeRight && currentIndex > 0) {
            targetIndex = currentIndex - 1;
          }

          const targetTranslateX = -targetIndex * SCREEN_WIDTH;
          translateX.value = withTiming(targetTranslateX, {
            duration: 100,
          });

          runOnJS(setCurrentIndex)(targetIndex);
        }
      },
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return {
    currentIndex,
    handleTabPress,
    isTabActive,
    gestureHandler,
    animatedStyle,
    SCREEN_WIDTH,
  };
};
