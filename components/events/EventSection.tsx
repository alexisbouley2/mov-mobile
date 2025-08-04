// components/events/EventSection.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import EventCard from "@/components/events/EventCard";
import { EventForList, User } from "@movapp/types";

interface EventSectionProps {
  title?: string;
  events: EventForList[];
  user: User | null;
  type: "current" | "planned" | "past";
  onEventPress: (_eventId: string) => void;
  showTitle?: boolean;
}

export default function EventSection({
  title,
  events,
  user,
  type,
  onEventPress,
  showTitle = true,
}: EventSectionProps) {
  return (
    <View>
      {showTitle && title && (
        <Text style={styles.eventSectionTitle}>{title}</Text>
      )}
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          user={user}
          type={type}
          onPress={() => onEventPress(event.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  eventSectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 8,
  },
});
