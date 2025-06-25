// app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export const TAB_BAR_HEIGHT = 60;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "#1C1C1E",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 0,
            paddingBottom: 0,
            paddingHorizontal: 0,
            height: TAB_BAR_HEIGHT,
            elevation: 0,
            shadowOpacity: 0,
            overflow: "hidden",
            opacity: 0.8,
          },
          android: {
            position: "absolute",
            backgroundColor: "#1C1C1E",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 0,
            paddingBottom: 0,
            paddingHorizontal: 0,
            height: TAB_BAR_HEIGHT,
            elevation: 0,
            shadowOpacity: 0,
            overflow: "hidden",
            opacity: 0.8,
          },
          default: {},
        }),
        tabBarItemStyle: {
          flex: 1,
          borderWidth: 1,
          borderColor: "red",
          borderStyle: "solid",
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          title: "Pov",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="camera.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
