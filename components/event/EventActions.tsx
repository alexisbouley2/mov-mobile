// components/event/EventActions.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface EventActionsProps {
  isAdmin: boolean;
  isParticipant: boolean;
  onUpdate: () => void;
  onParticipate: () => void;
  onInvite: () => void;
}

export default function EventActions({
  isAdmin,
  isParticipant,
  onUpdate,
  onParticipate,
  onInvite,
}: EventActionsProps) {
  return (
    <View style={styles.container}>
      {isAdmin ? (
        <TouchableOpacity style={styles.primaryButton} onPress={onUpdate}>
          <IconSymbol name="pencil" size={16} color="#000" />
          <Text style={styles.primaryButtonText}>Update</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            isParticipant && styles.participatingButton,
          ]}
          onPress={onParticipate}
        >
          <IconSymbol
            name={isParticipant ? "checkmark" : "person.badge.plus"}
            size={16}
            color={isParticipant ? "#fff" : "#000"}
          />
          <Text
            style={[
              styles.primaryButtonText,
              isParticipant && styles.participatingButtonText,
            ]}
          >
            {isParticipant ? "Participating" : "Participate"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={onInvite}>
        <IconSymbol name="person.badge.plus" size={16} color="#fff" />
        <Text style={styles.secondaryButtonText}>Invite</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  participatingButton: {
    backgroundColor: "#4CAF50",
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  participatingButtonText: {
    color: "#fff",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
