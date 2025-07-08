import React from "react";
import { View, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useSwipableTabs } from "../../hooks/tab/useSwipableTabs";

interface SwipableTabsProps {
  children: React.ReactNode[];
  tabBarComponent: (_props: {
    currentIndex: number;
    onTabPress: (_index: number) => void;
  }) => React.ReactNode;
  initialIndex?: number;
  isRecording?: boolean;
}

// Create a context to share the current tab index
export const TabContext = React.createContext<{
  currentTabIndex: number;
  isTabActive: (_index: number) => boolean;
}>({
  currentTabIndex: 0,
  isTabActive: () => false,
});

export const SwipableTabs: React.FC<SwipableTabsProps> = ({
  children,
  tabBarComponent,
  initialIndex = 1,
  isRecording = false,
}) => {
  const childrenCount = children.length;

  const {
    currentIndex,
    handleTabPress,
    isTabActive,
    gestureHandler,
    animatedStyle,
    SCREEN_WIDTH,
  } = useSwipableTabs({ childrenCount, initialIndex });

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
    <TabContext.Provider value={{ currentTabIndex: currentIndex, isTabActive }}>
      <View style={styles.container}>
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          activeOffsetX={[-10, 10]} // Only activate for horizontal gestures
          failOffsetY={[-10, 10]} // Fail if vertical gesture is detected
          enabled={!isRecording}
        >
          <Animated.View style={[screensContainerStyle, animatedStyle]}>
            {renderScreens()}
          </Animated.View>
        </PanGestureHandler>

        {tabBarComponent({ currentIndex, onTabPress: handleTabPress })}
      </View>
    </TabContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  screensContainer: {
    flexDirection: "row",
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
