// components/event/ParticipantListItem.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ParticipantAvatar from "@/components/ui/ParticipantAvatar";

interface Participant {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    profileThumbnailUrl: string | null | undefined;
  };
  joinedAt: string;
}

interface ParticipantListItemProps {
  participant: Participant;
  isLast?: boolean;
}

export default function ParticipantListItem({
  participant,
  isLast = false,
}: ParticipantListItemProps) {
  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.participantInfo}>
        <ParticipantAvatar user={participant.user} size={50} />
        <View style={styles.participantDetails}>
          <Text style={styles.participantName}>
            {participant.user.username}
          </Text>
          <Text style={styles.participantJoinDate}>
            Joined {formatJoinedDate(participant.joinedAt)}
          </Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantDetails: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  participantJoinDate: {
    fontSize: 14,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#333",
    marginTop: 12,
  },
});
