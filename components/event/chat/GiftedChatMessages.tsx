// components/event/chat/GiftedChatMessages.tsx
import React, { useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { Message } from "@/contexts/event/EventMessagesContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { ChatEmptyState } from "./ChatEmptyState";

interface GiftedChatMessagesProps {
  messages: Message[];
  messagesLoading: boolean;
  loadingEarlier: boolean;
  hasMore: boolean;
  sending: boolean;
  onSendMessage: (_message: string) => Promise<void>;
  onLoadEarlier: () => void;
}

export const GiftedChatMessages: React.FC<GiftedChatMessagesProps> = ({
  messages,
  messagesLoading,
  loadingEarlier,
  hasMore,
  onSendMessage,
  onLoadEarlier,
}) => {
  const { user } = useUserProfile();

  // Convert messages to GiftedChat format
  const giftedMessages: IMessage[] = useMemo(() => {
    // Reverse the array so newest messages are at the bottom
    return messages
      .slice()
      .reverse()
      .map((message) => ({
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
      if (newMessages.length > 0 && newMessages[0].text) {
        await onSendMessage(newMessages[0].text);
      }
    },
    [onSendMessage]
  );

  // Handle scroll to load more
  const handleLoadEarlier = useCallback(() => {
    if (hasMore && !loadingEarlier) {
      onLoadEarlier();
    }
  }, [hasMore, loadingEarlier, onLoadEarlier]);

  if (messagesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <GiftedChat
      messages={giftedMessages}
      onSend={onSend}
      user={currentUser}
      loadEarlier={true} // Must be true for infiniteScroll
      onLoadEarlier={handleLoadEarlier}
      isLoadingEarlier={loadingEarlier}
      infiniteScroll={true} // Enable automatic loading
      renderLoading={() => (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      renderChatEmpty={() => <ChatEmptyState />}
      placeholder="Type a message..."
      alwaysShowSend
      inverted={true}
      textInputProps={{
        style: styles.textInput,
      }}
      maxComposerHeight={100}
      minComposerHeight={44}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  textInput: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 16,
    lineHeight: 20,
  },
});
