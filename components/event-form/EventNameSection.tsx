// components/event-form/EventNameSection.tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import eventFormStyles from "./style";

interface EventNameSectionProps {
  name: string;
  onNameChange: (_name: string) => void;
}

export default function EventNameSection({
  name,
  onNameChange,
}: EventNameSectionProps) {
  return (
    <View style={eventFormStyles.section}>
      <Text style={eventFormStyles.sectionLabel}>Title</Text>
      <TextInput
        style={eventFormStyles.textInput}
        value={name}
        onChangeText={onNameChange}
        placeholder="Enter Event's Title"
        placeholderTextColor="#666"
        maxLength={25}
      />
    </View>
  );
}
