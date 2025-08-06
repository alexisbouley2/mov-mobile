// components/event/EventMessages.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ParticipantAvatar from "@/components/ui/ParticipantAvatar";
import { useEvent } from "@/contexts/event/EventContext";

export default function ChatPreview() {
  const router = useRouter();
  const { lastMessage } = useEvent();

  const handleOpenChat = () => {
    router.push(`/(app)/(event)/chat`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
        {lastMessage ? (
          <>
            <View style={styles.avatarContainer}>
              <ParticipantAvatar user={lastMessage.sender} size={40} />
            </View>
            <View style={styles.messagePreview}>
              <Text style={styles.senderName}>
                {lastMessage?.sender?.username}
              </Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {lastMessage?.content}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.centeredChatButtonText}>{"Open Chat"}</Text>
        )}
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
    backgroundColor: "#1C1C1E",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 16,
    minHeight: 72, // This ensures consistent height (16px padding top + 40px avatar + 16px padding bottom)
  },
  avatarContainer: {
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  centeredChatButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  messagePreview: {
    flex: 1,
  },
  senderName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  lastMessage: {
    color: "#ccc",
    fontSize: 14,
  },
});
