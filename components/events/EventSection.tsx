// components/events/EventSection.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Event as EventType } from "@/hooks/useEvents";
import EventCard from "@/components/events/EventCard";

interface EventSectionProps {
  title?: string;
  events: EventType[];
  type: "current" | "planned" | "past";
  onEventPress: (_eventId: string) => void;
  showTitle?: boolean;
}

export default function EventSection({
  title,
  events,
  type,
  onEventPress,
  showTitle = true,
}: EventSectionProps) {
  return (
    <View style={styles.section}>
      {showTitle && title && <Text style={styles.sectionTitle}>{title}</Text>}
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          type={type}
          onPress={() => onEventPress(event.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
});
