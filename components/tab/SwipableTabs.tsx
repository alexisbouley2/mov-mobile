import React from "react";
import { View, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { usePathname } from "expo-router";
import { TabProvider, useTab } from "@/contexts/TabContext";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

interface SwipableTabsProps {
  children: React.ReactNode[];
  tabBarComponent: (_props: {
    currentIndex: number;
    onTabPress: (_index: number) => void;
  }) => React.ReactNode;
  initialIndex?: number;
  isRecording?: boolean;
}

// Inner component that uses the tab context
const SwipableTabsContent: React.FC<{
  children: React.ReactNode[];
  tabBarComponent: (_props: {
    currentIndex: number;
    onTabPress: (_index: number) => void;
  }) => React.ReactNode;
  isRecording?: boolean;
}> = ({ children, tabBarComponent, isRecording = false }) => {
  const {
    currentTabIndex,
    handleTabPress,
    gestureHandler,
    animatedStyle,
    SCREEN_WIDTH,
  } = useTab();

  const renderScreens = () => {
    return children.map((child, _index) => (
      <View key={_index} style={styles.screen}>
        {child}
      </View>
    ));
  };

  const screensContainerStyle = {
    ...styles.screensContainer,
    width: SCREEN_WIDTH * children.length,
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={[-10, 10]} // Only activate for horizontal gestures
        failOffsetY={[-20, 20]} // Fail if vertical gesture is detected
        enabled={!isRecording}
      >
        <Animated.View style={[screensContainerStyle, animatedStyle]}>
          {renderScreens()}
        </Animated.View>
      </PanGestureHandler>
      {tabBarComponent({
        currentIndex: currentTabIndex,
        onTabPress: handleTabPress,
      })}
    </View>
  );
};

export const SwipableTabs: React.FC<SwipableTabsProps> = ({
  children,
  tabBarComponent,
  initialIndex = 1,
  isRecording = false,
}) => {
  const pathname = usePathname();
  const childrenCount = children.length;

  useDebugLifecycle("SwipableTabs");

  // Determine the correct initial index based on the current route
  const getInitialIndexFromRoute = () => {
    if (pathname.includes("/events")) return 0;
    if (pathname.includes("/camera")) return 1;
    if (pathname.includes("/profile")) return 2;
    return initialIndex; // fallback to provided initialIndex
  };
  const routeBasedInitialIndex = getInitialIndexFromRoute();

  return (
    <TabProvider
      childrenCount={childrenCount}
      initialIndex={routeBasedInitialIndex}
    >
      <SwipableTabsContent
        tabBarComponent={tabBarComponent}
        isRecording={isRecording}
      >
        {children}
      </SwipableTabsContent>
    </TabProvider>
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
