// components/events/EventSection.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import EventCard from "@/components/events/EventCard";

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
