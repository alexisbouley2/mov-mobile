// Updated app/(app)/(event)/chat/[id].tsx
import React from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useEventMessages } from "@/contexts/EventMessagesContext";
import {
  ChatHeader,
  ChatMessagesList,
  ChatInput,
} from "@/components/event/chat";

export default function ChatScreen() {
  const { messages, messagesLoading, sending, sendMessage, loadMoreMessages } =
    useEventMessages();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 40}
      >
        <ChatHeader />
        <ChatMessagesList
          messages={messages}
          messagesLoading={messagesLoading}
          onLoadMoreMessages={loadMoreMessages}
        />
        <ChatInput onSendMessage={handleSendMessage} sending={sending} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#000",
  },
});
