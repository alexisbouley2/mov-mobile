// components/event/EventInformation.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface EventInformationProps {
  information: string;
}

const MAX_LINES = 3;
const CHARS_PER_LINE = 40; // Approximate characters per line
const MAX_CHARS = MAX_LINES * CHARS_PER_LINE;

export default function EventInformation({
  information,
}: EventInformationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowSeeMore = information.length > MAX_CHARS;
  const displayText =
    isExpanded || !shouldShowSeeMore
      ? information
      : information.substring(0, MAX_CHARS) + "...";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Information</Text>
      <Text style={styles.description}>{displayText}</Text>
      {shouldShowSeeMore && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.seeMoreButton}
        >
          <Text style={styles.seeMoreText}>
            {isExpanded ? "See less" : "See more"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  seeMoreButton: {
    marginTop: 8,
  },
  seeMoreText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
