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
  return (
    <View style={styles.container}>
      <View style={styles.participantInfo}>
        <ParticipantAvatar user={participant.user} size={36} />
        <View style={styles.participantDetails}>
          <Text style={styles.participantName}>
            {participant.user.username}
          </Text>
        </View>
      </View>
      {!isLast && <View style={styles.separator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 10,
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
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  separator: {
    height: 1,
    backgroundColor: "#333",
    marginTop: 12,
  },
});
