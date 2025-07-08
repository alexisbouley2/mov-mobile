import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TabType = "confirmed" | "invited";

interface Props {
  activeTab: TabType;
  setActiveTab: (_tab: TabType) => void;
  confirmedCount: number;
  invitedCount: number;
  onClose: () => void;
}

const EventParticipantsBottomSheetHeader: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  confirmedCount,
  invitedCount,
  onClose,
}) => (
  <View style={styles.header}>
    <View style={styles.tabsRow}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "confirmed" && styles.tabActive]}
        onPress={() => setActiveTab("confirmed")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "confirmed" && styles.tabTextActive,
          ]}
        >
          Participants ({confirmedCount})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "invited" && styles.tabActive]}
        onPress={() => setActiveTab("invited")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "invited" && styles.tabTextActive,
          ]}
        >
          Invited ({invitedCount})
        </Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Ionicons name="close" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#222",
    marginRight: 8,
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
  closeButton: {
    padding: 8,
  },
});

export default EventParticipantsBottomSheetHeader;
