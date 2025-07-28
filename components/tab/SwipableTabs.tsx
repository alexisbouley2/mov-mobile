import React from "react";
import { View, StyleSheet } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useLocalSearchParams } from "expo-router";
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
  const params = useLocalSearchParams();
  const childrenCount = children.length;

  useDebugLifecycle("SwipableTabs");

  // Get screen from route params and map to tab index
  const getTabIndexFromScreen = (
    screen: string | string[] | undefined
  ): number => {
    if (!screen || Array.isArray(screen)) return initialIndex;

    switch (screen) {
      case "events":
        return 0;
      case "camera":
        return 1;
      case "profile":
        return 2;
      default:
        return initialIndex;
    }
  };

  // Only use route params on initial mount, then TabProvider handles state
  const routeInitialIndex = getTabIndexFromScreen(params.screen);

  return (
    <TabProvider
      childrenCount={childrenCount}
      initialIndex={routeInitialIndex}
      // Add a key to reset TabProvider when screen param changes
      key={`tabs-${params.screen || "default"}`}
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
