// components/event/EventLocation.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";

interface EventLocationProps {
  location: string;
}

export default function EventLocation({ location }: EventLocationProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/icon/location.png")}
        style={styles.locationIcon}
      />
      <Text style={styles.locationText}>{location}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
    gap: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    flex: 1,
  },
  locationIcon: {
    width: 24,
    height: 24,
  },
});
