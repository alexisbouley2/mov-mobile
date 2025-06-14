// components/event/EventChat.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function EventChat() {
  const handleOpenChat = () => {
    // TODO: Implement chat functionality
    console.log("Open chat");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
        <IconSymbol name="message" size={20} color="#fff" />
        <Text style={styles.chatButtonText}>Open Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
