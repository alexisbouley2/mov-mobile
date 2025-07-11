import React from "react";
import { View, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { usePathname } from "expo-router";
import { useSwipableTabs } from "@/hooks/tab/useSwipableTabs";

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
  const pathname = usePathname();
  const childrenCount = children.length;

  // Determine the correct initial index based on the current route
  const getInitialIndexFromRoute = () => {
    if (pathname.includes("/(tabs)/events")) return 0;
    if (pathname.includes("/(tabs)/camera")) return 1;
    if (pathname.includes("/(tabs)/profile")) return 2;
    return initialIndex; // fallback to provided initialIndex
  };

  const routeBasedInitialIndex = getInitialIndexFromRoute();

  const {
    currentIndex,
    handleTabPress,
    isTabActive,
    gestureHandler,
    animatedStyle,
    SCREEN_WIDTH,
  } = useSwipableTabs({ childrenCount, initialIndex: routeBasedInitialIndex });

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
