// components/events/EventSection.tsx
import React from "react";
import { View, Text } from "react-native";
import EventCard from "@/components/events/EventCard";
import typography from "@/styles/typography";

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
        <Text style={typography.eventSectionTitle}>{title}</Text>
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
