// components/event-form/EventFormHeader.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface EventFormHeaderProps {
  title: string;
  onBack: () => void;
}

export default function EventFormHeader({
  title,
  onBack,
}: EventFormHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <IconSymbol name="chevron.left" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={styles.headerRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerRight: {
    width: 40, // Same width as back button for balance
  },
});
