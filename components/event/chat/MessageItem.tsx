// components/event/chat/MessageItem.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Message } from "@movapp/types";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  isFirstInGroup,
  isLastInGroup,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        isLastInGroup && styles.lastInGroup,
      ]}
    >
      {/* Avatar for other users, only show on last message in group */}
      {!isCurrentUser && isLastInGroup && (
        <View style={styles.avatarContainer}>
          {message.sender.profileThumbnailUrl ? (
            <Image
              source={{ uri: message.sender.profileThumbnailUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {message.sender.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Spacer for alignment when no avatar */}
      {!isCurrentUser && !isLastInGroup && <View style={styles.avatarSpacer} />}

      <View style={styles.messageContent}>
        {/* Show username for other users, only on first message in group */}
        {!isCurrentUser && isFirstInGroup && (
          <Text style={styles.userName}>{message.sender.username}</Text>
        )}

        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
            isFirstInGroup &&
              (isCurrentUser ? styles.firstCurrentUser : styles.firstOtherUser),
            isLastInGroup &&
              (isCurrentUser ? styles.lastCurrentUser : styles.lastOtherUser),
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}
          >
            {message.content}
          </Text>
        </View>

        {/* Show timestamp on last message in group */}
        {isLastInGroup && (
          <Text
            style={[
              styles.timestamp,
              isCurrentUser
                ? styles.currentUserTimestamp
                : styles.otherUserTimestamp,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    marginVertical: 1,
    paddingHorizontal: 8,
  },
  currentUserMessage: {
    justifyContent: "flex-end",
  },
  otherUserMessage: {
    justifyContent: "flex-start",
  },
  lastInGroup: {
    marginBottom: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginTop: 4,
  },
  avatarSpacer: {
    width: 40, // 32 + 8 margin
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  messageContent: {
    flex: 1,
    maxWidth: "80%",
  },
  userName: {
    color: "#888",
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginVertical: 1,
  },
  currentUserBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherUserBubble: {
    backgroundColor: "#333",
    alignSelf: "flex-start",
  },
  // First message in group styling
  firstCurrentUser: {
    borderTopRightRadius: 18,
  },
  firstOtherUser: {
    borderTopLeftRadius: 18,
  },
  // Last message in group styling
  lastCurrentUser: {
    borderBottomRightRadius: 4,
  },
  lastOtherUser: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: "#fff",
  },
  otherUserText: {
    color: "#fff",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  currentUserTimestamp: {
    color: "#888",
    textAlign: "right",
    marginRight: 4,
  },
  otherUserTimestamp: {
    color: "#888",
    textAlign: "left",
    marginLeft: 12,
  },
});
