// components/events/EventsContent.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useEventsLogic } from "@/hooks/events/useEventsLogic";
import EventSection from "@/components/events/EventSection";
import typography from "@/styles/typography";
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
  const { pastEventsByMonth } = useEventsLogic(events);

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
          <Text style={typography.eventSectionTitle}>Memories</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {},
  monthTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 16,
    marginBottom: 12,
  },
});
