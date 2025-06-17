// components/event/EventParticipants.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EventParticipantsBottomSheet from "./EventParticipantsBottomSheet";

interface Participant {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    photoThumbnailUrl: string | null | undefined;
  };
  joinedAt: string;
}

interface EventParticipantsProps {
  participants: Participant[];
}

const MAX_VISIBLE_PARTICIPANTS = 4;

export default function EventParticipants({
  participants,
}: EventParticipantsProps) {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  if (participants.length === 0) {
    return null;
  }

  const visibleParticipants = participants.slice(0, MAX_VISIBLE_PARTICIPANTS);
  const hiddenCount = participants.length - MAX_VISIBLE_PARTICIPANTS;

  const renderParticipantAvatar = (
    participant: Participant,
    size: number = 40
  ) => {
    if (participant.user.photoThumbnailUrl) {
      return (
        <Image
          source={{ uri: participant.user.photoThumbnailUrl }}
          style={[
            styles.participantImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      );
    }
    return (
      <View
        style={[
          styles.avatarPlaceholder,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
          {participant.user.username.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Participants</Text>
        <TouchableOpacity
          style={styles.participantsRow}
          onPress={() => setIsBottomSheetVisible(true)}
          activeOpacity={0.7}
        >
          {visibleParticipants.map((participant, index) => (
            <View
              key={participant.id}
              style={[
                styles.participantAvatar,
                { marginLeft: index > 0 ? -8 : 0 },
              ]}
            >
              {renderParticipantAvatar(participant)}
            </View>
          ))}
          {hiddenCount > 0 && (
            <View style={[styles.participantAvatar, styles.moreParticipants]}>
              <Text style={styles.avatarText}>+{hiddenCount}</Text>
            </View>
          )}
          {participants.length > MAX_VISIBLE_PARTICIPANTS && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#fff"
              style={styles.expandIcon}
            />
          )}
        </TouchableOpacity>
      </View>

      <EventParticipantsBottomSheet
        visible={isBottomSheetVisible}
        participants={participants}
        onClose={() => setIsBottomSheetVisible(false)}
      />
    </>
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
  avatarPlaceholder: {
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
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
  expandIcon: {
    marginLeft: 8,
    opacity: 0.7,
  },
});
