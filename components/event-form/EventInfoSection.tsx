import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import eventFormStyles from "./style";

interface EventInfoSectionProps {
  mode: "create" | "edit";
}

export default function EventInfoSection({ mode }: EventInfoSectionProps) {
  const infoText =
    mode === "create"
      ? "You'll be the admin of this event. You can invite friends after creating it."
      : "As the admin, you can update event details. Date cannot be changed once set.";

  return (
    <View style={eventFormStyles.section}>
      <View style={styles.infoItem}>
        <IconSymbol name="info.circle" size={16} color="#666" />
        <Text style={styles.infoText}>{infoText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
    lineHeight: 20,
  },
});
