// app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Image } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";

export const TAB_BAR_HEIGHT = 60;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Platform.select({
          ios: Colors["dark"].tint,
          android: Colors["dark"].tabIconSelected,
          default: Colors["dark"].tint,
        }),
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
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/tab-icon/home.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused
                  ? Colors["dark"].tabIconSelected
                  : Colors["dark"].tabIconDefault,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="camera"
        options={{
          title: "POV",
          tabBarIcon: () => (
            <Image
              source={require("@/assets/images/tab-icon/bolt-mov.png")}
              style={{
                width: 24,
                height: 24,
                borderWidth: 0,
                borderColor: "transparent",
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/images/tab-icon/profile.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: focused
                  ? Colors["dark"].tabIconSelected
                  : Colors["dark"].tabIconDefault,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
