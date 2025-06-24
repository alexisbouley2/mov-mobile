// components/events/EventCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Event as EventType } from "@/hooks/useEvents";
import EventParticipants from "@/components/events/EventParticipants";
import { CachedImage } from "../ui/CachedImage";

interface EventCardProps {
  event: EventType;
  type: "current" | "planned" | "past";
  onPress: () => void;
}

export default function EventCard({ event, type, onPress }: EventCardProps) {
  const getSubtitle = () => {
    if (type === "current") {
      return `Created by ${event.admin.username}`;
    } else if (type === "planned") {
      const eventDate = new Date(event.date);
      return eventDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else if (type === "past") {
      const povCount = event.povCount || event._count?.videos || 0;
      return `You shared ${povCount} POVs`;
    }
    return "";
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.eventContent}>
        <View style={styles.eventIcon}>
          {event.coverThumbnailUrl ? (
            <CachedImage
              uri={event.coverThumbnailUrl}
              cachePolicy="cover-thumbnail"
              style={styles.eventImage}
              fallbackSource={undefined}
              showLoading={true}
              loadingColor="#666"
            />
          ) : (
            <View style={styles.placeholderIcon}>
              <Text style={styles.placeholderText}>{event.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventSubtitle}>{getSubtitle()}</Text>
        </View>

        {type === "past" && (
          <View style={styles.povBadge}>
            <Text style={styles.povText}>POV</Text>
          </View>
        )}

        {event.participants && event.participants.length > 0 && (
          <EventParticipants participants={event.participants} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  eventIcon: {
    marginRight: 16,
  },
  eventImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  povBadge: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  povText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
