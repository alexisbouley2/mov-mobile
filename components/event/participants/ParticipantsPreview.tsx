// Updated components/event/ParticipantsPreview.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useEvent } from "@/contexts/event/EventContext";
import { CachedImage } from "@/components/ui/CachedImage";

const MAX_VISIBLE_PARTICIPANTS = 4;

export default function ParticipantsPreview() {
  const router = useRouter();
  const { event } = useEvent();
  const participants = event?.participants || [];
  const totalParticipants = event?._count?.participants || 0;

  if (totalParticipants === 0) {
    return null;
  }

  const visibleParticipants = participants.slice(0, MAX_VISIBLE_PARTICIPANTS);

  const hiddenCount = Math.min(
    totalParticipants - MAX_VISIBLE_PARTICIPANTS,
    99
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.participantsRow}
        onPress={() => router.push("/participants")}
        activeOpacity={0.7}
      >
        {visibleParticipants.map((participant, index) => (
          <View
            key={participant.id}
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
      </TouchableOpacity>
      <Text style={styles.participantsText}>Participants</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
  participantsText: {
    fontSize: 10,
    fontWeight: "300",
    color: "#fff",
    marginTop: 4,
  },
});
