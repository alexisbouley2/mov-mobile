// components/event/ParticipantListItem.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import ParticipantAvatar from "@/components/ui/ParticipantAvatar";
import { Participant } from "@movapp/types";
import { useEvent } from "@/contexts/event/EventContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEventParticipants } from "@/contexts/event/EventParticipantsContext";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface ParticipantListItemProps {
  participant: Participant;
}

export default function ParticipantListItem({
  participant,
}: ParticipantListItemProps) {
  const { event } = useEvent();
  const { user } = useUserProfile();
  const { deleteParticipant } = useEventParticipants();

  const isAdmin = event?.adminId === user?.id;
  const isCurrentUser = participant.user.id === user?.id;

  const handleDeleteParticipant = () => {
    if (!event || !user) return;

    Alert.alert(
      "Remove Participant",
      `Are you sure you want to remove ${participant.user.username} from this event?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteParticipant(participant.user.id);
            } catch {
              Alert.alert(
                "Error",
                "Failed to remove participant. Please try again."
              );
            }
          },
        },
      ]
    );
  };

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
      {isAdmin && !isCurrentUser && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteParticipant}
          activeOpacity={0.7}
        >
          <IconSymbol name="trash" size={16} color="#ff6b6b" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
});
