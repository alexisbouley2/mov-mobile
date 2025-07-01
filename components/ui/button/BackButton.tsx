import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.backButton}>
      <Ionicons name="chevron-back" size={32} color="#007AFF" />
      <Text style={styles.backButtonText}>Back</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 10,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 20,
  },
});
