// components/event/EventMessages.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import { useEventMessages } from "@/contexts/EventMessagesContext";

export default function EventMessages() {
  const router = useRouter();
  const { preview, previewLoading } = useEventMessages();

  const handleOpenChat = () => {
    router.push(`/(app)/(event)/chat`);
  };

  if (previewLoading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.chatButton} disabled>
          <IconSymbol name="message" size={20} color="#666" />
          <Text style={[styles.chatButtonText, { color: "#666" }]}>
            Loading...
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
        <IconSymbol name="message" size={20} color="#fff" />

        {preview?.hasMessages && preview.lastMessage ? (
          <View style={styles.messagePreview}>
            <Text style={styles.senderName}>
              {preview.lastMessage.sender.username}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {preview.lastMessage.content}
            </Text>
            {preview.messageCount > 1 && (
              <Text style={styles.messageCount}>
                {preview.messageCount} messages
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.chatButtonText}>Open Chat</Text>
        )}

        <IconSymbol name="chevron.right" size={16} color="#fff" />
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
    flex: 1,
  },
  messagePreview: {
    flex: 1,
  },
  senderName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  lastMessage: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 2,
  },
  messageCount: {
    color: "#888",
    fontSize: 12,
  },
});
