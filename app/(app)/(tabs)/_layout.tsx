// app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Image } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/Colors";

export const TAB_BAR_HEIGHT = 50;

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
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "#000000",
            paddingTop: 0,
            paddingBottom: 0,
            paddingHorizontal: 0,
            height: TAB_BAR_HEIGHT,
            elevation: 0,
            overflow: "hidden",
            borderTopColor: "808080",
          },
          android: {
            position: "absolute",
            backgroundColor: "#000000",
            paddingTop: 0,
            paddingBottom: 0,
            paddingHorizontal: 0,
            height: TAB_BAR_HEIGHT,
            elevation: 0,
            overflow: "hidden",
            borderTopColor: "808080",
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
