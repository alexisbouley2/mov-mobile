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
import { useAuth } from "@/contexts/AuthContext";
import { useEventDetail } from "@/hooks/event/useEventDetail";
import EventHeader from "@/components/event/EventHeader";
import EventActions from "@/components/event/EventActions";
import EventLocation from "@/components/event/EventLocation";
import EventInformation from "@/components/event/EventInformation";
import EventParticipants from "@/components/event/EventParticipants";
import EventMessages from "@/components/event/EventMessages";
import EventGallery from "@/components/event/EventGallery";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    event,
    loading,
    refreshing,
    error,
    toggleParticipation,
    refetch,
    hasInitialData,
  } = useEventDetail(id!);

  // Force refetch when screen comes into focus (e.g., returning from edit screen)
  useFocusEffect(
    useCallback(() => {
      // Only refetch if we have initial data (prevents infinite loops)
      if (hasInitialData) {
        refetch();
      }
    }, [hasInitialData, refetch])
  );

  // Handler for navigating to edit screen with event data
  const handleEdit = useCallback(() => {
    if (event) {
      router.push({
        pathname: `/(app)/(event)/edit/${id}`,
        params: {
          eventData: JSON.stringify(event),
        },
      });
    }
  }, [event, id, router]);

  if (loading && !hasInitialData) {
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
    { type: "participants", data: event.participants || [] },
    { type: "chat", data: { eventId: event.id } }, // Pass eventId to chat
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
            <EventParticipants participants={item.data} />
          </View>
        );

      case "chat":
        return (
          <View style={styles.content}>
            <EventMessages eventId={item.data.eventId} />
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <FlatList
        data={renderData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        refreshing={refreshing}
        onRefresh={refetch}
      />

      {/* Show a subtle loading indicator when refetching */}
      {refreshing && (
        <View style={styles.refetchingIndicator}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
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
  refetchingIndicator: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    borderRadius: 20,
  },
});
