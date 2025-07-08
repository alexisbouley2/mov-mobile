// components/event/EventActions.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";
import ParticipantAvatar from "@/components/ui/ParticipantAvatar";
import { EventWithDetails } from "@movapp/types";

interface EventActionsProps {
  event: EventWithDetails;
  isAdmin: boolean;
  isParticipant: boolean;
  onUpdate: () => void;
  onParticipate: () => void;
  onInvite: () => void;
}

export default function EventActions({
  event,
  isAdmin,
  isParticipant,
  onUpdate,
  onParticipate,
  onInvite,
}: EventActionsProps) {
  const adminName =
    event.admin.username.length > 10
      ? event.admin.username.slice(0, 10) + "..."
      : event.admin.username;

  return (
    <View
      style={[
        styles.container,
        isAdmin && {
          justifyContent: "center",
        },
      ]}
    >
      {isAdmin && (
        <>
          <TouchableOpacity
            style={[styles.button, styles.whiteButton]}
            onPress={onUpdate}
          >
            <Image
              source={require("@/assets/images/icon/black-edit.png")}
              style={styles.icon}
            />
            <Text style={[styles.buttonText, { color: "#000" }]}>
              Manage Event
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.blackButton]}
            onPress={onInvite}
          >
            <IconSymbol name="person.badge.plus" size={20} color="#fff" />
            <Text style={[styles.buttonText, { color: "#fff" }]}>Invite</Text>
          </TouchableOpacity>
        </>
      )}

      {!isAdmin && (
        <>
          <View style={styles.adminContainer}>
            <View style={styles.avatarContainer}>
              <ParticipantAvatar user={event.admin} size={40} />
            </View>
            <Text style={styles.adminText}>{adminName} invited you</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              isParticipant && styles.whiteButton,
              !isParticipant && styles.blackButton,
            ]}
            onPress={onParticipate}
          >
            <Text
              style={[
                styles.buttonText,
                isParticipant && { color: "#000" },
                !isParticipant && { color: "#fff" },
              ]}
            >
              {isParticipant ? "Participating" : "Invited"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 0,
    marginBottom: 20,
  },
  adminContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  icon: {
    width: 24,
    height: 24,
  },
  avatarContainer: {
    borderWidth: 1,
    borderColor: "#FFF",
    borderRadius: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  whiteButton: {
    backgroundColor: "#fff",
  },
  blackButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
