// app/(app)/(tabs)/events.tsx - Updated to use UserEventsContext
import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useUserEvents } from "@/contexts/UserEventsContext";
import EventsHeader from "@/components/events/EventsHeader";
import EventsContent from "@/components/events/EventsContent";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { TAB_BAR_HEIGHT } from "./_layout";

export default function EventsScreen() {
  useDebugLifecycle("EventsScreen");

  const router = useRouter();
  const { events, refetch, hasInitialData } = useUserEvents();

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

  return (
    <View style={styles.container}>
      <EventsHeader onCreateEvent={handleCreateEvent} />

      <EventsContent events={events} onEventPress={handleEventPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    marginBottom: TAB_BAR_HEIGHT,
  },
});
