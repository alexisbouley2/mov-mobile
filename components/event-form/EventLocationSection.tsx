// components/event-form/EventLocationSection.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface EventLocationSectionProps {
  location: string;
  onLocationChange: (_location: string) => void;
}

export default function EventLocationSection({
  location,
  onLocationChange,
}: EventLocationSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Location</Text>
      <TextInput
        style={styles.textInput}
        value={location}
        onChangeText={onLocationChange}
        placeholder="Where is this happening? (optional)"
        placeholderTextColor="#666"
        maxLength={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
});
