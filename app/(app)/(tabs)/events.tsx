// app/(app)/(tabs)/events.tsx - Updated to use UserEventsContext
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useUserEvents } from "@/contexts/UserEventsContext";
import EventsHeader from "@/components/events/EventsHeader";
import EventsContent from "@/components/events/EventsContent";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

export default function EventsScreen() {
  useDebugLifecycle("EventsScreen");

  const router = useRouter();
  const { events, loading, refreshing, error, refetch, hasInitialData } =
    useUserEvents();

  // Refetch events when returning to this screen
  useFocusEffect(
    useCallback(() => {
      // Only refetch if we have initial data (prevents infinite loops)
      if (hasInitialData) {
        refetch();
      }
    }, [hasInitialData, refetch])
  );

  const handleCreateEvent = () => {
    router.push("/(app)/(events)/create");
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/(app)/(event)/${eventId}`);
  };

  if (loading && !hasInitialData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <EventsHeader onCreateEvent={handleCreateEvent} />

      <EventsContent events={events} onEventPress={handleEventPress} />

      {/* Show subtle loading indicator when refreshing */}
      {refreshing && (
        <View style={styles.refreshingIndicator}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  refreshingIndicator: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    borderRadius: 20,
  },
});
