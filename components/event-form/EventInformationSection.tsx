// components/event-form/EventInformationSection.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface EventInformationSectionProps {
  information: string;
  onInformationChange: (_info: string) => void;
}

export default function EventInformationSection({
  information,
  onInformationChange,
}: EventInformationSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Information</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        value={information}
        onChangeText={onInformationChange}
        placeholder="What's this event about? (optional)"
        placeholderTextColor="#666"
        multiline
        numberOfLines={4}
        maxLength={200}
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
