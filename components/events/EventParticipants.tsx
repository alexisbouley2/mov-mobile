// components/events/EventParticipants.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CachedImage } from "../ui/CachedImage";
import { Participant } from "@movapp/types";

interface EventParticipantsProps {
  participants: Participant[];
  maxVisible?: number;
}

export default function EventParticipants({
  participants,
  maxVisible = 3,
}: EventParticipantsProps) {
  const visibleParticipants = [...participants.slice(0, maxVisible)];
  const hiddenCount = Math.min(participants.length - maxVisible, 99);

  return (
    <View style={styles.participantsContainer}>
      {visibleParticipants.map((participant, index) => (
        <View
          key={participant.user.id}
          style={[
            styles.participantAvatar,
            { marginLeft: index > 0 ? -10 : 0 },
          ]}
        >
          {participant.user.profileThumbnailUrl ? (
            <CachedImage
              uri={participant.user.profileThumbnailUrl}
              cachePolicy="profile-thumbnail"
              style={styles.participantImage}
              fallbackSource={undefined}
              showLoading={true}
              loadingColor="#666"
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
    marginLeft: -10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
