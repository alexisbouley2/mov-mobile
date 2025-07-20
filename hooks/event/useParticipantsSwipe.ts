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
      },
      onActive: (event, context: any) => {
        // Only handle horizontal gestures
        if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
          const newTranslateX = context.startX + event.translationX;
          // Limit the swipe to prevent going beyond the tabs
          const maxTranslateX = 0;
          const minTranslateX = -SCREEN_WIDTH;
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
        }
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
