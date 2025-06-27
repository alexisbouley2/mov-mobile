// components/event-form/EventNameSection.tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import { components } from "@/styles";

interface EventNameSectionProps {
  name: string;
  onNameChange: (_name: string) => void;
}

export default function EventNameSection({
  name,
  onNameChange,
}: EventNameSectionProps) {
  return (
    <View style={components.eventFormSection}>
      <Text style={components.eventFormSectionLabel}>Title</Text>
      <TextInput
        style={components.eventFormTextInput}
        value={name}
        onChangeText={onNameChange}
        placeholder="Enter Event's Title"
        placeholderTextColor="#666"
        maxLength={25}
      />
    </View>
  );
}
