// components/events/EventsContent.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useEventsLogic } from "@/hooks/events/useEventsLogic";
import EventSection from "@/components/events/EventSection";
import { CategorizedEventsResponse, User } from "@movapp/types";

interface EventsContentProps {
  events: CategorizedEventsResponse;
  onEventPress: (_eventId: string) => void;
  user: User | null;
}

export default function EventsContent({
  events,
  onEventPress,
  user,
}: EventsContentProps) {
  const { pastEventsByMonth, hasNoEvents } = useEventsLogic(events);

  // Show placeholder when there are no events
  if (hasNoEvents) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No MOV yet.</Text>
        <Text style={styles.emptySubtitle}>
          Schedule one with your friends or start a Quick MOV from the Camera!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Current Events */}
      {events.current.length > 0 && (
        <EventSection
          title="Current Events"
          events={events.current}
          user={user}
          type="current"
          onEventPress={onEventPress}
        />
      )}

      {/* Planned Events */}
      {events.planned.length > 0 && (
        <EventSection
          title="Planned Events"
          events={events.planned}
          user={user}
          type="planned"
          onEventPress={onEventPress}
        />
      )}

      {/* Past Events (Memories) */}
      {Object.keys(pastEventsByMonth).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.eventSectionTitle}>Memories</Text>
          {Object.entries(pastEventsByMonth).map(([monthYear, monthEvents]) => (
            <View key={monthYear}>
              <Text style={styles.monthTitle}>{monthYear}</Text>
              <EventSection
                events={monthEvents}
                user={user}
                type="past"
                onEventPress={onEventPress}
                showTitle={false}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {},
  eventSectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 8,
  },
  monthTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 16,
    marginBottom: 12,
  },
});
