// app/(app)/(tabs)/_layout.tsx
import React from "react";

import { SwipableTabs } from "@/components/tab/SwipableTabs";
import { CustomTabBar } from "@/components/tab/CustomTabBar";

// Import the screen components
import EventsScreen from "./events";
import CameraScreen from "./camera";
import ProfileScreen from "./profile";

export default function TabLayout() {
  return (
    <SwipableTabs
      tabBarComponent={({ currentIndex, onTabPress }) => (
        <CustomTabBar currentIndex={currentIndex} onTabPress={onTabPress} />
      )}
    >
      <EventsScreen />
      <CameraScreen />
      <ProfileScreen />
    </SwipableTabs>
  );
}
