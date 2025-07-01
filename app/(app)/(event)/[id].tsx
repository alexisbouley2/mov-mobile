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
import EventLocation from "@/components/event/global/EventLocation";
import EventInformation from "@/components/event/global/EventInformation";
import EventParticipants from "@/components/event/participants/EventParticipants";
import EventMessagePreview from "@/components/event/EventMessagePreview";
import EventGallery from "@/components/event/gallery/EventGallery";
import { useEventDetail } from "@/hooks/event/useEventDetail";

export default function EventDetailScreen() {
  const router = useRouter();
  const {
    event,
    eventLoading,
    error,
    renderData,
    flatListRef,
    screenKey,
    shouldRefresh,
    handleEdit,
    handleScroll,
    handleMomentumScrollEnd,
    handleRefresh,
    handleParticipate,
    handleInvite,
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

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "header":
        return <EventHeader event={item.data} onBack={() => router.back()} />;

      case "actions":
        return (
          <View style={styles.content}>
            <EventActions
              event={item.data.event}
              isAdmin={item.data.isAdmin}
              isParticipant={item.data.isParticipant}
              onUpdate={handleEdit}
              onParticipate={handleParticipate}
              onInvite={handleInvite}
            />
          </View>
        );

      case "location":
        return (
          <View style={styles.content}>
            <EventLocation location={item.data} />
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
            <EventParticipants />
          </View>
        );

      case "chat":
        return (
          <View style={styles.content}>
            <EventMessagePreview />
          </View>
        );

      case "gallery":
        return <EventGallery eventDate={item.data.eventDate} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        key={`event-${screenKey}`}
        data={renderData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        refreshing={eventLoading && shouldRefresh}
        onRefresh={handleRefresh}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
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
