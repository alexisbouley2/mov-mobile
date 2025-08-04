// components/event-form/EventInformationSection.tsx
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import eventFormStyles from "./style";

interface EventInformationSectionProps {
  information: string;
  onInformationChange: (_info: string) => void;
}

export default function EventInformationSection({
  information,
  onInformationChange,
}: EventInformationSectionProps) {
  return (
    <View style={eventFormStyles.section}>
      <Text style={eventFormStyles.sectionLabel}>Description</Text>
      <TextInput
        style={[eventFormStyles.textInput, styles.textArea]}
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
