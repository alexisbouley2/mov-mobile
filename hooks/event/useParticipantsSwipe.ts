import { useState, useCallback } from "react";
import { Dimensions } from "react-native";
import { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type TabType = "confirmed" | "invited";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function useParticipantsSwipe() {
  const [activeTab, setActiveTab] = useState<TabType>("confirmed");
  const translateX = useSharedValue(0);

  const handleTabPress = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      const targetTranslateX = tab === "confirmed" ? 0 : -SCREEN_WIDTH;
      translateX.value = withTiming(targetTranslateX, { duration: 200 });
    },
    [translateX]
  );

  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (event, context: any) => {
        context.startX = translateX.value;
        context.startTime = Date.now();
        context.isHorizontalGesture = null; // Will be determined in onActive
      },
      onActive: (event, context: any) => {
        // Determine gesture direction early
        if (context.isHorizontalGesture === null) {
          const absX = Math.abs(event.translationX);
          const absY = Math.abs(event.translationY);

          // Only consider it a horizontal gesture if horizontal movement is significantly larger
          if (absX > 10 || absY > 10) {
            context.isHorizontalGesture = absX > absY * 1.5; // More strict horizontal detection
          }
        }

        // Only handle if we've determined this is a horizontal gesture
        if (context.isHorizontalGesture) {
          const newTranslateX = context.startX + event.translationX;
          const maxTranslateX = 0;
          const minTranslateX = -SCREEN_WIDTH;
          translateX.value = Math.max(
            minTranslateX,
            Math.min(maxTranslateX, newTranslateX)
          );
        }
      },
      onEnd: (event, context: any) => {
        // Always complete the animation if it was determined to be a horizontal gesture
        if (context.isHorizontalGesture) {
          const shouldSwipeLeft =
            event.velocityX < -500 || event.translationX < -SCREEN_WIDTH * 0.3;
          const shouldSwipeRight =
            event.velocityX > 500 || event.translationX > SCREEN_WIDTH * 0.3;

          let targetTab: TabType = activeTab;

          if (shouldSwipeLeft && activeTab === "confirmed") {
            targetTab = "invited";
          } else if (shouldSwipeRight && activeTab === "invited") {
            targetTab = "confirmed";
          }

          const targetTranslateX =
            targetTab === "confirmed" ? 0 : -SCREEN_WIDTH;
          translateX.value = withTiming(targetTranslateX, { duration: 200 });

          runOnJS(setActiveTab)(targetTab);
        } else {
          // If it wasn't a horizontal gesture, snap back to current tab position
          const targetTranslateX =
            activeTab === "confirmed" ? 0 : -SCREEN_WIDTH;
          translateX.value = withTiming(targetTranslateX, { duration: 200 });
        }
      },
      onCancel: (_event, _context: any) => {
        // Always snap back to current position on cancel
        const targetTranslateX = activeTab === "confirmed" ? 0 : -SCREEN_WIDTH;
        translateX.value = withTiming(targetTranslateX, { duration: 200 });
      },
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return {
    activeTab,
    handleTabPress,
    gestureHandler,
    animatedStyle,
    SCREEN_WIDTH,
  };
}
