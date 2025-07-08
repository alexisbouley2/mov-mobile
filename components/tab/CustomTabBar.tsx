import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface CustomTabBarProps {
  currentIndex: number;
  onTabPress: (_index: number) => void;
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  currentIndex,
  onTabPress,
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

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.index}
          style={styles.tabItem}
          onPress={() => onTabPress(tab.index)}
          activeOpacity={0.7}
        >
          <Image
            source={tab.icon}
            style={[
              styles.tabIcon,
              tab.index === 1
                ? {
                    tintColor: undefined, // POV icon doesn't change color
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
    borderWidth: 1,
    borderColor: "red",
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
