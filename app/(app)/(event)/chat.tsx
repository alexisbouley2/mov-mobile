// app/(app)/(event)/chat.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEventMessages } from "@/contexts/event/EventMessagesContext";
import { useEvent } from "@/contexts/event/EventContext";
import { CachedImage } from "@/components/ui/CachedImage";
import Header from "@/components/ui/Header";
import { GiftedChatMessages } from "@/components/event/chat";

export default function ChatScreen() {
  const router = useRouter();
  const { event } = useEvent();
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
      <Header
        title={event?.name || "Chat"}
        onBack={() => router.back()}
        rightComponent={
          event?.coverThumbnailUrl && (
            <CachedImage
              uri={event.coverThumbnailUrl}
              cachePolicy="cover-thumbnail"
              style={styles.eventImage}
              fallbackSource={undefined}
              showLoading={true}
              loadingColor="#666"
            />
          )
        }
      />

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
  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#808080",
  },
});
