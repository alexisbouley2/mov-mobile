// components/event/chat/ChatMessages.tsx
import React, { useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import { MessageItem } from "./MessageItem";
import { MessageInput } from "./MessageInput";
import { Message } from "@movapp/types";
import { useUserProfile } from "@/contexts/UserProfileContext";

interface ChatMessagesProps {
  messages: Message[];
  messagesLoading: boolean;
  loadingEarlier: boolean;
  hasMore: boolean;
  sending: boolean;
  onSendMessage: (_text: string) => void;
  onLoadEarlier: () => void;
}

const { height: _screenHeight } = Dimensions.get("window");

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  messagesLoading,
  loadingEarlier,
  hasMore,
  sending,
  onSendMessage,
  onLoadEarlier,
}) => {
  const { user } = useUserProfile();
  const flatListRef = useRef<FlatList>(null);

  // Sort messages by date (newest first) for inverted display
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Handle sending message with auto-scroll
  const handleSendMessage = (text: string) => {
    onSendMessage(text);
    // Auto-scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, 100);
  };

  // Handle loading earlier messages with built-in guards
  const handleLoadEarlier = () => {
    if (!loadingEarlier && hasMore) {
      onLoadEarlier();
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.sender.id === user?.id;

    // Note: Since we're inverted, the logic for grouping changes
    // Previous message is now at index + 1 (because we're reversed)
    // Next message is now at index - 1
    const previousMessage =
      index < sortedMessages.length - 1 ? sortedMessages[index + 1] : null;
    const nextMessage = index > 0 ? sortedMessages[index - 1] : null;

    const isFirstInGroup =
      !previousMessage || previousMessage.sender.id !== item.sender.id;
    const isLastInGroup =
      !nextMessage || nextMessage.sender.id !== item.sender.id;

    return (
      <MessageItem
        message={item}
        isCurrentUser={isCurrentUser}
        isFirstInGroup={isFirstInGroup}
        isLastInGroup={isLastInGroup}
      />
    );
  };

  const keyExtractor = (item: Message) => item.id;

  if (messagesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  // Show placeholder when there are no messages
  if (messages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to start the conversation!
          </Text>
        </View>
        <MessageInput onSendMessage={handleSendMessage} sending={sending} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={sortedMessages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        inverted={true}
        onEndReached={handleLoadEarlier}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        windowSize={21}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
      />

      <MessageInput onSendMessage={handleSendMessage} sending={sending} />
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
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8, // Changed from paddingTop since we're inverted
  },
});
