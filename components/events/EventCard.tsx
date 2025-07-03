// components/events/EventCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import EventParticipants from "@/components/events/EventParticipants";
import { CachedImage } from "../ui/CachedImage";
import { User, EventForList } from "@movapp/types";

interface EventCardProps {
  event: EventForList;
  type: "current" | "planned" | "past";
  onPress: () => void;
  user: User | null;
}

export default function EventCard({
  event,
  type,
  onPress,
  user,
}: EventCardProps) {
  const getSubtitle = () => {
    if (type === "current") {
      return `Created by ${event.admin.username}`;
    } else if (type === "planned") {
      const eventDate = new Date(event.date);
      return eventDate
        .toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, ".");
    } else if (type === "past") {
      const povCount = event._count?.videos || 0;
      return `You shared ${povCount} POV`;
    }
    return "";
  };

  return (
    <View>
      {type === "planned" && user?.id !== event.admin.id && (
        <Text style={styles.inviteText}>
          {event.admin.username} invited you
        </Text>
      )}
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
                <Text style={styles.placeholderText}>
                  {event.name?.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventSubtitle}>{getSubtitle()}</Text>
          </View>

          {type === "past" && (
            <Image
              source={require("@/assets/images/logo/mov.png")}
              style={styles.movLogo}
            />
          )}

          {type !== "past" &&
            event.participants &&
            event.participants.length > 0 && (
              <EventParticipants participants={event.participants} />
            )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inviteText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "400",
    textAlign: "left",
    marginBottom: 4,
    marginLeft: 12,
  },
  eventCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#808080",
    marginBottom: 8,
  },
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  eventIcon: {
    marginRight: 16,
  },
  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#808080",
  },
  placeholderIcon: {
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#808080",
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
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#fff",
  },
  movLogo: {
    width: 60,
    height: 30,
  },
});
