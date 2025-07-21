// app/(app)/(event)/chat.tsx
import React from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useEventMessages } from "@/contexts/event/EventMessagesContext";
import { ChatHeader, GiftedChatMessages } from "@/components/event/chat";

export default function ChatScreen() {
  const {
    messages,
    messagesLoading,
    loadingEarlier,
    hasMore,
    sending,
    sendMessage,
    loadEarlier,
  } = useEventMessages();

  return (
    <View style={styles.container}>
      <ChatHeader />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <GiftedChatMessages
          messages={messages}
          messagesLoading={messagesLoading}
          loadingEarlier={loadingEarlier}
          hasMore={hasMore}
          sending={sending}
          onSendMessage={sendMessage}
          onLoadEarlier={loadEarlier}
        />
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
    borderWidth: 1,
    borderColor: "red",
  },
});
