import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useEvent } from "@/contexts/EventContext";
import EventHeader from "@/components/event/EventHeader";
import EventActions from "@/components/event/EventActions";
import EventLocation from "@/components/event/EventLocation";
import EventInformation from "@/components/event/EventInformation";
import EventParticipants from "@/components/event/participants/EventParticipants";
import EventMessages from "@/components/event/EventMessages";
import EventGallery from "@/components/event/EventGallery";
import { useUserProfile } from "@/contexts/UserProfileContext";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUserProfile();
  const { event, eventLoading, error, loadEvent, toggleParticipation } =
    useEvent();

  // Load event every time we come to this screen
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadEvent(id);
      }
    }, [id, loadEvent])
  );

  // Handler for navigating to edit screen - no data passing needed!
  const handleEdit = useCallback(() => {
    if (event) {
      router.push(`/(app)/(event)/edit`);
    }
  }, [event, router]);

  if (eventLoading && !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Event not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = event.adminId === user?.id;
  const isParticipant = event.participants?.some((p) => p.userId === user?.id);

  // Create data array for FlatList to avoid VirtualizedList nesting
  const renderData = [
    { type: "header", data: event },
    { type: "actions", data: { isAdmin, isParticipant } },
    ...(event.location ? [{ type: "location", data: event.location }] : []),
    ...(event.information
      ? [{ type: "information", data: event.information }]
      : []),
    { type: "participants", data: {} },
    { type: "chat", data: { eventId: event.id } },
    {
      type: "gallery",
      data: {
        eventId: event.id,
        userId: user?.id || "",
        eventDate: new Date(event.date),
      },
    },
  ];

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "header":
        return <EventHeader event={item.data} onBack={() => router.back()} />;

      case "actions":
        return (
          <View style={styles.content}>
            <EventActions
              isAdmin={item.data.isAdmin}
              isParticipant={item.data.isParticipant}
              onUpdate={handleEdit}
              onParticipate={() => toggleParticipation(user?.id || "")}
              onInvite={() => {
                /* TODO: Implement invite */
              }}
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
            <EventMessages />
          </View>
        );

      case "gallery":
        return (
          <View style={styles.content}>
            <EventGallery
              eventId={item.data.eventId}
              userId={item.data.userId}
              eventDate={item.data.eventDate}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const handleRefresh = () => {
    if (id) {
      loadEvent(id);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <FlatList
        data={renderData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        refreshing={eventLoading}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
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
    padding: 20,
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
