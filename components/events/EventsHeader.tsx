// components/events/EventsHeader.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

interface EventsHeaderProps {
  onCreateEvent: () => void;
}

export default function EventsHeader({ onCreateEvent }: EventsHeaderProps) {
  return (
    <View style={styles.header}>
      <Image
        source={require("@/assets/images/logo/mov.png")}
        style={styles.movLogo}
      />
      <Text style={styles.subtitle}>Your best memories.</Text>

      <TouchableOpacity style={styles.createButton} onPress={onCreateEvent}>
        <Image
          source={require("@/assets/images/icon/white-create.png")}
          style={styles.createIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  movLogo: {
    width: 140,
    height: 70,
  },
  subtitle: {
    fontSize: 18,
    color: "#ffffff",
    marginTop: 12,
    fontWeight: "400",
  },
  createButton: {
    position: "absolute",
    right: 30,
    top: 20,
  },

  createIcon: {
    width: 36,
    height: 36,
  },
});
