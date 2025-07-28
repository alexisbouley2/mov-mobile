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

          // Check if swiping towards camera tab (index 1)
          const isSwipingTowardsCamera =
            (currentIndex < 1 && event.translationX < 0) || // Swiping left from events tab
            (currentIndex > 1 && event.translationX > 0); // Swiping right from profile tab

          // Update the context state
          runOnJS(setIsSwipingTowardsCamera)(isSwipingTowardsCamera);
        } else {
        }
      },
      onEnd: (event, _context: any) => {
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

          // Clear swipe towards camera state when gesture ends
          runOnJS(setIsSwipingTowardsCamera)(false);
        }
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
