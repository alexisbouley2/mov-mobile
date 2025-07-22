import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "@movapp/types";
import { useUserProfile } from "@/contexts/UserProfileContext";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useUserProfile();
  const isMyMessage = message.sender.id === user?.id;

  return (
    <View
      style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {!isMyMessage && (
        <Text style={styles.senderName}>{message.sender.username}</Text>
      )}
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
          ]}
        >
          {message.content}
        </Text>
      </View>
      <Text style={styles.messageTime}>
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  senderName: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: "#007AFF",
  },
  otherMessageBubble: {
    backgroundColor: "#333",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#fff",
  },
  messageTime: {
    color: "#666",
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 12,
  },
});
