// components/event/EventLocation.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface EventLocationProps {
  location: string;
}

export default function EventLocation({ location }: EventLocationProps) {
  return (
    <View style={styles.container}>
      <IconSymbol name="location" size={20} color="#888" />
      <Text style={styles.locationText}>{location}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  locationText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
});
