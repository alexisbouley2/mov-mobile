// components/event/EventActions.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "expo-image";

interface EventActionsProps {
  isAdmin: boolean;
  isConfirmed: boolean;
  onUpdate: () => void;
  onConfirm: () => void;
  onInvite: () => void;
}

export default function EventActions({
  isAdmin,
  isConfirmed,
  onUpdate,
  onConfirm,
  onInvite,
}: EventActionsProps) {
  return (
    <View
      style={[
        styles.container,
        isAdmin && {
          justifyContent: "center",
        },
      ]}
    >
      {isAdmin ? (
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
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            styles.statusButton,
            isConfirmed && styles.whiteButton,
            !isConfirmed && styles.blackButton,
          ]}
          onPress={onConfirm}
        >
          <IconSymbol
            name={isConfirmed ? "checkmark" : "clock"}
            size={20}
            color={isConfirmed ? "#000" : "#fff"}
          />
          <Text
            style={[
              styles.buttonText,
              isConfirmed && { color: "#000" },
              !isConfirmed && { color: "#fff" },
            ]}
          >
            {isConfirmed ? "Participate" : "Invited"}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.button, styles.blackButton]}
        onPress={onInvite}
      >
        <IconSymbol name="person.badge.plus" size={20} color="#fff" />
        <Text style={[styles.buttonText, { color: "#fff" }]}>Invite</Text>
      </TouchableOpacity>
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
  icon: {
    width: 20,
    height: 20,
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
  statusButton: {
    minWidth: 150, // Fixed minimum width for status button
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
