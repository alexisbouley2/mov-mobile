// components/events/EventParticipants.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { EventParticipant } from "@/hooks/useEvents";

interface EventParticipantsProps {
  participants: EventParticipant[];
  maxVisible?: number;
}

export default function EventParticipants({
  participants,
  maxVisible = 3,
}: EventParticipantsProps) {
  const visibleParticipants = participants.slice(0, maxVisible);
  const hiddenCount = participants.length - maxVisible;

  return (
    <View style={styles.participantsContainer}>
      {visibleParticipants.map((participant, index) => (
        <View
          key={participant.user.id}
          style={[styles.participantAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
        >
          {participant.user.photo ? (
            <Image
              source={{ uri: participant.user.photo }}
              style={styles.participantImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {participant.user.username.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      ))}
      {hiddenCount > 0 && (
        <View style={[styles.participantAvatar, styles.moreParticipants]}>
          <Text style={styles.avatarText}>+{hiddenCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1a1a1a",
    overflow: "hidden",
  },
  participantImage: {
    width: "100%",
    height: "100%",
  },
  moreParticipants: {
    backgroundColor: "#333",
    marginLeft: -8,
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
