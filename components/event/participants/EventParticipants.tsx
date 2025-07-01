// Updated components/event/EventParticipants.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EventParticipantsBottomSheet from "./EventParticipantsBottomSheet";
import ParticipantAvatar from "@/components/ui/ParticipantAvatar";
import { useEventParticipants } from "@/contexts/EventParticipantsContext";

const MAX_VISIBLE_PARTICIPANTS = 4;

export default function EventParticipants() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const { previewParticipants } = useEventParticipants();

  if (previewParticipants.length === 0) {
    return null;
  }

  const visibleParticipants = previewParticipants.slice(
    0,
    MAX_VISIBLE_PARTICIPANTS
  );
  const hiddenCount = previewParticipants.length - MAX_VISIBLE_PARTICIPANTS;

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
              <ParticipantAvatar user={participant.user} size={40} />
            </View>
          ))}
          {hiddenCount > 0 && (
            <View style={[styles.participantAvatar, styles.moreParticipants]}>
              <Text style={styles.avatarText}>+{hiddenCount}</Text>
            </View>
          )}
          {previewParticipants.length > MAX_VISIBLE_PARTICIPANTS && (
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
        onClose={() => setIsBottomSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 10,
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
