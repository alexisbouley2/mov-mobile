import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import EventHeader from "@/components/event/global/EventHeader";
import EventActions from "@/components/event/global/EventActions";
import EventInformation from "@/components/event/global/EventInformation";
import ParticipantsPreview from "@/components/event/participants/ParticipantsPreview";
import ChatPreview from "@/components/event/chat/ChatPreview";
import EventVideoFeed from "@/components/event/gallery/EventVideoFeed";
import { useEventDetail } from "@/hooks/event/useEventDetail";

export default function EventDetailScreen() {
  const router = useRouter();
  const {
    event,
    eventLoading,
    error,
    user,
    renderData,
    screenKey,
    handleEdit,
    handleConfirm,
    handleInvite,
    handleLeave,
  } = useEventDetail();

  if (eventLoading && !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Event not found"}</Text>
        </View>
      </View>
    );
  }

  const isAdmin = event.adminId === user?.id;

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "header":
        return (
          <EventHeader
            event={item.data}
            onBack={() => router.back()}
            onLeave={handleLeave}
            isAdmin={isAdmin}
          />
        );

      case "actions":
        return (
          <View style={styles.content}>
            <EventActions
              isAdmin={item.data.isAdmin}
              isConfirmed={item.data.isConfirmed}
              onUpdate={handleEdit}
              onConfirm={handleConfirm}
              onInvite={handleInvite}
            />
          </View>
        );

      case "information":
        return (
          <View style={styles.content}>
            <EventInformation information={item.data} />
          </View>
        );

      case "participants":
        return (
          <View style={styles.content}>
            <ParticipantsPreview />
          </View>
        );

      case "chat":
        return (
          <View style={styles.content}>
            <ChatPreview />
          </View>
        );

      case "gallery":
        return <EventVideoFeed eventDate={item.data.eventDate} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        key={`event-${screenKey}`}
        data={renderData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        refreshing={false}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  flatListContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
});
