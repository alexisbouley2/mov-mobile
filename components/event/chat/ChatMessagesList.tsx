import React, { useRef, useEffect, useMemo } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { Message } from "@/contexts/EventMessagesContext";
import { ChatMessage } from "./ChatMessage";
import { ChatEmptyState } from "./ChatEmptyState";
import { DateSeparator } from "./DateSeparator";

interface ChatMessagesListProps {
  messages: Message[];
  messagesLoading: boolean;
  onLoadMoreMessages: () => void;
}

interface ListItem {
  type: "message" | "date";
  id: string;
  data: Message | Date;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  messagesLoading,
  onLoadMoreMessages,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // Group messages by date and create list items with date separators
  const listItems = useMemo(() => {
    const items: ListItem[] = [];
    let currentDate: string | null = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();

      // Add date separator if this is a new date
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        items.push({
          type: "date",
          id: `message-${message.id}`,
          data: new Date(message.createdAt),
        });
      }

      // Add the message
      items.push({
        type: "message",
        id: message.id,
        data: message,
      });
    });

    return items;
  }, [messages]);

  const scrollToBottom = () => {
    if (listItems.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (listItems.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [listItems.length]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "date") {
      return <DateSeparator date={item.data as Date} />;
    } else {
      return <ChatMessage message={item.data as Message} />;
    }
  };

  if (messagesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={listItems}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.messagesList}
      contentContainerStyle={styles.messagesContent}
      onEndReached={onLoadMoreMessages}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={<ChatEmptyState />}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
