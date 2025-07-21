// app/(app)/(event)/chat.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
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

      <GiftedChatMessages
        messages={messages}
        messagesLoading={messagesLoading}
        loadingEarlier={loadingEarlier}
        hasMore={hasMore}
        sending={sending}
        onSendMessage={sendMessage}
        onLoadEarlier={loadEarlier}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
