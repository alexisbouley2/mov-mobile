// app/(app)/(tabs)/events.tsx - Updated to use UserEventsContext
import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useUserEvents } from "@/contexts/UserEventsContext";
import EventsHeader from "@/components/events/EventsHeader";
import EventsContent from "@/components/events/EventsContent";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useUserProfile } from "@/contexts/UserProfileContext";

export default function EventsScreen() {
  useDebugLifecycle("EventsScreen");

  const router = useRouter();
  const { events, refetch, refreshing } = useUserEvents();
  const { user } = useUserProfile();

  const handleCreateEvent = () => {
    router.push("/(app)/(events)/create");
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/(app)/(event)/${eventId}`);
  };

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
        <EventsHeader onCreateEvent={handleCreateEvent} />

        <EventsContent
          events={events}
          onEventPress={handleEventPress}
          user={user}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
});
