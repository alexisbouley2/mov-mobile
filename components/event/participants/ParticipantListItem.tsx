// components/event/ParticipantListItem.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ParticipantAvatar from "@/components/ui/ParticipantAvatar";
import { Participant } from "@movapp/types";

interface ParticipantListItemProps {
  participant: Participant;
}

export default function ParticipantListItem({
  participant,
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
});
