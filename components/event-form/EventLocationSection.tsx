// components/event-form/EventLocationSection.tsx
import { components } from "@/styles";
import React from "react";
import { View, Text, TextInput } from "react-native";

interface EventLocationSectionProps {
  location: string;
  onLocationChange: (_location: string) => void;
}

export default function EventLocationSection({
  location,
  onLocationChange,
}: EventLocationSectionProps) {
  return (
    <View style={components.eventFormSection}>
      <Text style={components.eventFormSectionLabel}>Location</Text>
      <TextInput
        style={components.eventFormTextInput}
        value={location}
        onChangeText={onLocationChange}
        placeholder="Select Location (optional)"
        placeholderTextColor="#666"
        maxLength={100}
      />
    </View>
  );
}
