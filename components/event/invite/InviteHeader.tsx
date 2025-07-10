import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/styles";
import BackButton from "@/components/ui/button/BackButton";

interface InviteHeaderProps {
  onBack: () => void;
  onShare: () => void;
  shareLoading: boolean;
}

export default function InviteHeader({
  onBack,
  onShare,
  shareLoading,
}: InviteHeaderProps) {
  return (
    <View style={styles.header}>
      <BackButton onPress={onBack} />
      <Text style={typography.headerTitle}>Invite Friends</Text>
      <TouchableOpacity
        onPress={onShare}
        style={styles.shareHeaderButton}
        disabled={shareLoading}
      >
        <Ionicons name="share-outline" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 16,
  },
  shareHeaderButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    position: "absolute",
    right: 20,
  },
});
