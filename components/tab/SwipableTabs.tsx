import React, { useState } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SwipableTabsProps {
  children: React.ReactNode[];
  tabBarComponent: (_props: {
    currentIndex: number;
    onTabPress: (_index: number) => void;
  }) => React.ReactNode;
  initialIndex?: number;
}

export const SwipableTabs: React.FC<SwipableTabsProps> = ({
  children,
  tabBarComponent,
  initialIndex = 1,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useSharedValue(-initialIndex * SCREEN_WIDTH);
  const childrenCount = children.length;

  const handleTabPress = (index: number) => {
    setCurrentIndex(index);
    const targetTranslateX = -index * SCREEN_WIDTH;
    translateX.value = withSpring(targetTranslateX, {
      damping: 20,
      stiffness: 200,
    });
  };

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
          const minTranslateX = -(children.length - 1) * SCREEN_WIDTH;
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

          if (shouldSwipeLeft && currentIndex < children.length - 1) {
            targetIndex = currentIndex + 1;
          } else if (shouldSwipeRight && currentIndex > 0) {
            targetIndex = currentIndex - 1;
          }

          const targetTranslateX = -targetIndex * SCREEN_WIDTH;
          translateX.value = withSpring(targetTranslateX, {
            damping: 20,
            stiffness: 200,
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

  const renderScreens = () => {
    return children.map((child, index) => (
      <View key={index} style={styles.screen}>
        {child}
      </View>
    ));
  };

  const screensContainerStyle = {
    ...styles.screensContainer,
    width: SCREEN_WIDTH * childrenCount,
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={[-10, 10]} // Only activate for horizontal gestures
        failOffsetY={[-10, 10]} // Fail if vertical gesture is detected
      >
        <Animated.View style={[screensContainerStyle, animatedStyle]}>
          {renderScreens()}
        </Animated.View>
      </PanGestureHandler>

      {tabBarComponent({ currentIndex, onTabPress: handleTabPress })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "green",
  },
  screensContainer: {
    flexDirection: "row",
    flex: 1,
  },
  screen: {
    flex: 1,
    borderWidth: 10,
    borderColor: "blue",
  },
});
