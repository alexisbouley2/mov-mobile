import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface CustomTabBarProps {
  currentIndex: number;
  onTabPress: (_index: number) => void;
  isRecording?: boolean;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  currentIndex,
  onTabPress,
  isRecording = false,
}) => {
  const tabs = [
    {
      name: "Home",
      icon: require("@/assets/images/tab-icon/home.png"),
      index: 0,
    },
    {
      name: "POV",
      icon: require("@/assets/images/tab-icon/bolt-mov.png"),
      index: 1,
    },
    {
      name: "Profile",
      icon: require("@/assets/images/tab-icon/profile.png"),
      index: 2,
    },
  ];

  const handleTabPress = (index: number) => {
    if (isRecording) return;
    onTabPress(index);
  };

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.index}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab.index)}
          disabled={isRecording}
        >
          <Image
            source={tab.icon}
            style={[
              styles.tabIcon,
              tab.index === 1
                ? {
                    tintColor: undefined,
                  }
                : {
                    tintColor:
                      currentIndex === tab.index
                        ? Colors["dark"].tabIconSelected
                        : Colors["dark"].tabIconDefault,
                  },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#000000",
    padding: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
});
