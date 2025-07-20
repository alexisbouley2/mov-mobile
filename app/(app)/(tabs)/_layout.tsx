// app/(app)/(tabs)/_layout.tsx
import React from "react";
import { SwipableTabs } from "@/components/tab/SwipableTabs";
import { CustomTabBar } from "@/components/tab/CustomTabBar";
// Import the screen components
import EventsScreen from "./events";
import CameraScreen from "./camera";
import ProfileScreen from "./profile";
// Import the recording context to access recording state
import { useRecording } from "@/contexts/RecordingContext";

export default function TabLayout() {
  const { isRecording } = useRecording();

  return (
    <SwipableTabs
      tabBarComponent={({ currentIndex, onTabPress }: any) => (
        <CustomTabBar
          currentIndex={currentIndex}
          onTabPress={onTabPress}
          isRecording={isRecording}
        />
      )}
      isRecording={isRecording}
    >
      <EventsScreen />
      <CameraScreen />
      <ProfileScreen />
    </SwipableTabs>
  );
}
