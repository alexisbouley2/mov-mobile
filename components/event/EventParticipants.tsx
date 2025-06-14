// components/event/EventParticipants.tsx
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface Participant {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    photo: string | null | undefined;
  };
}

interface EventParticipantsProps {
  participants: Participant[];
}

const MAX_VISIBLE_PARTICIPANTS = 6;

export default function EventParticipants({
  participants,
}: EventParticipantsProps) {
  if (participants.length === 0) {
    return null;
  }

  const visibleParticipants = participants.slice(0, MAX_VISIBLE_PARTICIPANTS);
  const hiddenCount = participants.length - MAX_VISIBLE_PARTICIPANTS;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Participants</Text>
      <View style={styles.participantsRow}>
        {visibleParticipants.map((participant, index) => (
          <View
            key={participant.id}
            style={[
              styles.participantAvatar,
              { marginLeft: index > 0 ? -8 : 0 },
            ]}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
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
    fontSize: 14,
    fontWeight: "bold",
  },
});
