// components/event/chat/GiftedChatMessages.tsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Keyboard } from "react-native";
import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { Message } from "@/contexts/event/EventMessagesContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { ChatEmptyState } from "./ChatEmptyState";
import {
  CustomInputToolbar,
  CustomComposer,
  CustomSend,
  CustomBubble,
  CustomAvatar,
  CustomDay,
  CustomLoadEarlier,
} from "./renders";

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

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track keyboard height
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    <View style={styles.container}>
      <GiftedChat
        messages={giftedMessages}
        onSend={onSend}
        user={currentUser}
        loadEarlier={true}
        onLoadEarlier={handleLoadEarlier}
        isLoadingEarlier={loadingEarlier}
        infiniteScroll={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        renderChatEmpty={() => <ChatEmptyState />}
        placeholder="Message"
        alwaysShowSend
        inverted={true}
        maxComposerHeight={100}
        minComposerHeight={44}
        // Custom renders
        renderInputToolbar={CustomInputToolbar}
        renderComposer={CustomComposer}
        renderSend={CustomSend}
        renderBubble={CustomBubble}
        renderAvatar={CustomAvatar}
        renderDay={CustomDay}
        renderLoadEarlier={CustomLoadEarlier}
        // Styling
        messagesContainerStyle={styles.messagesContainer}
        bottomOffset={0}
        listViewProps={
          {
            contentContainerStyle: {
              paddingBottom: keyboardHeight, // This prevents top messages from being cut off
            },
          } as any
        }
        keyboardShouldPersistTaps="never"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "red",
  },
  messagesContainer: {
    backgroundColor: "#000",
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
