import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
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

// Context types
interface TabContextType {
  currentTabIndex: number;
  isTabActive: (_index: number) => boolean;
  isSwipingTowardsCamera: boolean;
  handleTabPress: (_index: number) => void;
  gestureHandler: any;
  animatedStyle: any;
  SCREEN_WIDTH: number;
}

// Create context
const TabContext = createContext<TabContextType | null>(null);

// Simple consumer hook
export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};

// Provider component with all logic
interface TabProviderProps {
  children: React.ReactNode;
  childrenCount: number;
  initialIndex?: number;
}

export const TabProvider: React.FC<TabProviderProps> = ({
  children,
  childrenCount,
  initialIndex = 1,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isSwipingTowardsCamera, setIsSwipingTowardsCamera] = useState(false);
  const translateX = useSharedValue(-initialIndex * SCREEN_WIDTH);

  const handleTabPress = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      const targetTranslateX = -index * SCREEN_WIDTH;
      // Instant transition for tab clicks
      translateX.value = targetTranslateX;
    },
    [translateX]
  );

  const isTabActive = useCallback(
    (index: number) => currentIndex === index,
    [currentIndex]
  );
  const gestureHandler =
    useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
      onStart: (_, context: any) => {
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
          // Limit the swipe to prevent going beyond the first and last tabs
          const maxTranslateX = 0;
          const minTranslateX = -(childrenCount - 1) * SCREEN_WIDTH;
          translateX.value = Math.max(
            minTranslateX,
            Math.min(maxTranslateX, newTranslateX)
          );

          // Check if swiping towards camera tab (index 1)
          const isSwipingTowardsCamera =
            (currentIndex < 1 && event.translationX < 0) || // Swiping left from events tab
            (currentIndex > 1 && event.translationX > 0); // Swiping right from profile tab

          // Update the context state
          runOnJS(setIsSwipingTowardsCamera)(isSwipingTowardsCamera);
        }
      },
      onEnd: (event, context: any) => {
        // Always complete the animation if it was determined to be a horizontal gesture
        if (context.isHorizontalGesture) {
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

          // Clear swipe towards camera state when gesture ends
          runOnJS(setIsSwipingTowardsCamera)(false);
        } else {
          // If it wasn't a horizontal gesture, snap back to current tab position
          const targetTranslateX = -currentIndex * SCREEN_WIDTH;
          translateX.value = withTiming(targetTranslateX, { duration: 100 });

          // Clear swipe towards camera state
          runOnJS(setIsSwipingTowardsCamera)(false);
        }
      },
      onCancel: (_event, _context: any) => {
        // Always snap back to current position on cancel
        const targetTranslateX = -currentIndex * SCREEN_WIDTH;
        translateX.value = withTiming(targetTranslateX, { duration: 100 });

        // Clear swipe towards camera state when gesture is cancelled
        runOnJS(setIsSwipingTowardsCamera)(false);
      },
    });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const contextValue = useMemo(
    () => ({
      currentTabIndex: currentIndex,
      isTabActive,
      isSwipingTowardsCamera,
      handleTabPress,
      gestureHandler,
      animatedStyle,
      SCREEN_WIDTH,
    }),
    [
      currentIndex,
      isTabActive,
      isSwipingTowardsCamera,
      handleTabPress,
      // Removed gestureHandler and animatedStyle from dependencies
    ]
  );

  return React.createElement(
    TabContext.Provider,
    { value: contextValue },
    children
  );
};
