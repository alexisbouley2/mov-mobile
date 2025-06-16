import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import EventVideoFeed from "./EventVideoFeed";

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

  // Check if event is in the past (allow uploads)
  const isEventPast = new Date() > eventDate;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        {isEventPast && (
          <Text style={styles.subtitle}>
            Share your memories from this event
          </Text>
        )}
      </View>

      {/* Tab Navigation */}
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

      {/* Video Feed - Remove fixed height and negative margins */}
      <View style={styles.videoFeedContainer}>
        <EventVideoFeed
          eventId={eventId}
          userId={userId}
          filterByUser={activeTab === "you"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Changed from no flex to flex: 1
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#111",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#000",
  },
  videoFeedContainer: {
    flex: 1, // Changed from fixed height to flex: 1
    // Removed negative margins
  },
});
