import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type TabType = "confirmed" | "invited";

interface ParticipantsTabHeaderProps {
  activeTab: TabType;
  onTabPress: (_tab: TabType) => void;
  confirmedCount: number;
  unconfirmedCount: number;
}

export default function ParticipantsTabHeader({
  activeTab,
  onTabPress,
  confirmedCount,
  unconfirmedCount,
}: ParticipantsTabHeaderProps) {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "confirmed" && styles.tabActive]}
        onPress={() => onTabPress("confirmed")}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "confirmed" && styles.tabTextActive,
          ]}
        >
          Confirmed ({confirmedCount})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "invited" && styles.tabActive]}
        onPress={() => onTabPress("invited")}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "invited" && styles.tabTextActive,
          ]}
        >
          Invited ({unconfirmedCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#222",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  tabTextActive: {
    color: "#000",
  },
});
