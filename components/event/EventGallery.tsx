// components/event/EventGallery.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface EventGalleryProps {
  eventId: string;
  userId: string;
  eventDate: Date;
}

export default function EventGallery({
  eventId,
  userId,
  eventDate,
}: EventGalleryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "you">("all");

  const isEventInFuture = eventDate > new Date();

  if (isEventInFuture) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Gallery</Text>
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>Wait for the event to start</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gallery</Text>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "you" && styles.activeTab]}
          onPress={() => setActiveTab("you")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "you" && styles.activeTabText,
            ]}
          >
            You
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gallery Content */}
      <View style={styles.galleryContent}>
        {activeTab === "all" ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              All videos will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Your videos will appear here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#000",
  },
  galleryContent: {
    minHeight: 200,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 40,
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
  waitingContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  waitingText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
});
