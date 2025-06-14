// components/event-form/EventNameSection.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface EventNameSectionProps {
  name: string;
  onNameChange: (_name: string) => void;
}

export default function EventNameSection({
  name,
  onNameChange,
}: EventNameSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Event Name</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={onNameChange}
        placeholder="Enter event name"
        placeholderTextColor="#666"
        maxLength={50}
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
