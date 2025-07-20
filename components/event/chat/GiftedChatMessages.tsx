import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Text, Image } from "react-native";
import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { Message } from "@/contexts/event/EventMessagesContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { ChatEmptyState } from "./ChatEmptyState";

interface GiftedChatMessagesProps {
  messages: Message[];
  messagesLoading: boolean;
  sending: boolean;
  onSendMessage: (_message: string) => Promise<void>;
  onLoadMoreMessages: () => void;
}

export const GiftedChatMessages: React.FC<GiftedChatMessagesProps> = ({
  messages,
  messagesLoading,
  sending,
  onSendMessage,
  onLoadMoreMessages,
}) => {
  const { user } = useUserProfile();

  // Convert our Message type to GiftedChat IMessage type
  const giftedMessages: IMessage[] = useMemo(() => {
    return messages.map((message) => ({
      _id: message.id,
      text: message.content,
      createdAt: new Date(message.createdAt),
      user: {
        _id: message.sender.id,
        name: message.sender.username,
        avatar: message.sender.profileThumbnailUrl || undefined,
      },
    }));
  }, [messages]);

  // Current user for GiftedChat
  const currentUser: User = useMemo(
    () => ({
      _id: user?.id || "",
      name: user?.username || "",
      avatar: user?.profileThumbnailUrl || undefined,
    }),
    [user]
  );

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (newMessages.length > 0) {
        const messageText = newMessages[0].text;
        if (messageText && messageText.trim()) {
          await onSendMessage(messageText.trim());
        }
      }
    },
    [onSendMessage]
  );

  const onLoadEarlier = useCallback(() => {
    onLoadMoreMessages();
  }, [onLoadMoreMessages]);

  if (messagesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={giftedMessages}
        onSend={onSend}
        user={currentUser}
        onLoadEarlier={onLoadEarlier}
        loadEarlier={true}
        isLoadingEarlier={messagesLoading}
        renderAvatarOnTop={true}
        showAvatarForEveryMessage={false}
        showUserAvatar={true}
        alwaysShowSend={true}
        scrollToBottomComponent={() => null}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        renderChatEmpty={() => <ChatEmptyState />}
        textInputProps={{
          placeholder: "Type a message...",
          placeholderTextColor: "#666",
          multiline: true,
          maxLength: 500,
          style: styles.textInput,
        }}
        renderSend={({ text }) => {
          if (!text || text.trim().length === 0 || sending) {
            return null;
          }
          return null; // GiftedChat will show its default send button
        }}
        // Custom styling for bubbles
        renderBubble={(props) => {
          const isMyMessage = props.currentMessage?.user?._id === user?.id;
          return (
            <View
              style={[
                styles.messageBubble,
                isMyMessage
                  ? styles.myMessageBubble
                  : styles.otherMessageBubble,
              ]}
            >
              {props.renderMessageText?.(props)}
            </View>
          );
        }}
        // Custom message text styling
        renderMessageText={(props) => {
          const isMyMessage = props.currentMessage?.user?._id === user?.id;
          return (
            <View style={styles.messageTextContainer}>
              {props.currentMessage?.text && (
                <Text
                  style={[
                    styles.messageText,
                    isMyMessage
                      ? styles.myMessageText
                      : styles.otherMessageText,
                  ]}
                >
                  {props.currentMessage.text}
                </Text>
              )}
            </View>
          );
        }}
        // Custom avatar
        renderAvatar={(props) => {
          const avatarUrl = props.currentMessage?.user?.avatar;
          if (!avatarUrl || typeof avatarUrl !== "string") {
            return null;
          }
          return (
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            </View>
          );
        }}
        // Custom time
        renderTime={(props) => {
          const time = new Date(props.currentMessage?.createdAt || Date.now());
          return (
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
        // Show usernames for messages from other users
        renderUsernameOnMessage={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  myMessageBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMessageBubble: {
    backgroundColor: "#333",
    alignSelf: "flex-start",
  },
  messageTextContainer: {
    flex: 1,
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
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  timeContainer: {
    marginTop: 4,
    marginHorizontal: 12,
  },
  timeText: {
    color: "#666",
    fontSize: 11,
  },
  usernameContainer: {
    marginBottom: 4,
    marginLeft: 12,
  },
  usernameText: {
    color: "#ccc",
    fontSize: 12,
  },
});
