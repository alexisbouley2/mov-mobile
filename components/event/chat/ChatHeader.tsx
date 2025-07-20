import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BackButton from "@/components/ui/button/BackButton";
import { CachedImage } from "@/components/ui/CachedImage";
import { useEvent } from "@/contexts/event/EventContext";

export const ChatHeader: React.FC = () => {
  const router = useRouter();
  const { event } = useEvent();

  return (
    <View style={styles.header}>
      <BackButton onPress={() => router.back()} />
      <Text style={styles.headerTitle}>{event?.name}</Text>
      {event?.coverThumbnailUrl && (
        <CachedImage
          uri={event.coverThumbnailUrl}
          cachePolicy="cover-thumbnail"
          style={styles.eventImage}
          fallbackSource={undefined}
          showLoading={true}
          loadingColor="#666"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#808080",
    position: "absolute",
    right: 20,
  },
});
