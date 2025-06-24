// components/events/EventsContent.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useEventsLogic } from "@/hooks/events/useEventsLogic";
import EventSection from "@/components/events/EventSection";

export interface User {
  id: string;
  username: string;
  photo?: string | null;
  profileThumbnailUrl?: string | null;
}

export interface EventParticipant {
  id: string;
  user: User;
  joinedAt: string;
}

export interface EventType {
  id: string;
  name: string;
  information?: string | null;
  date: string;
  createdAt: string;
  location?: string | null;
  admin: User;
  participants: EventParticipant[];
  photo?: string | null;
  coverThumbnailUrl?: string | null;
  _count?: {
    videos: number;
  };
}

export interface CategorizedEvents {
  current: EventType[];
  planned: EventType[];
  past: EventType[];
}

interface EventsContentProps {
  events: CategorizedEvents;
  onEventPress: (_eventId: string) => void;
}

export default function EventsContent({
  events,
  onEventPress,
}: EventsContentProps) {
  const { pastEventsByMonth } = useEventsLogic(events);

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Current Events */}
      {events.current.length > 0 && (
        <EventSection
          title="Current Events"
          events={events.current}
          type="current"
          onEventPress={onEventPress}
        />
      )}

      {/* Planned Events */}
      {events.planned.length > 0 && (
        <EventSection
          title="Planned Events"
          events={events.planned}
          type="planned"
          onEventPress={onEventPress}
        />
      )}

      {/* Past Events (Memories) */}
      {Object.keys(pastEventsByMonth).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Memories</Text>
          {Object.entries(pastEventsByMonth).map(([monthYear, monthEvents]) => (
            <View key={monthYear}>
              <Text style={styles.monthTitle}>{monthYear}</Text>
              <EventSection
                events={monthEvents as EventType[]}
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  monthTitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 20,
    marginBottom: 12,
  },
});
