// Updated components/event/EventGallery.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import EventVideoFeed from "./EventVideoFeed";
import { useEventVideos } from "@/contexts/EventVideosContext";

interface EventGalleryProps {
  eventDate: Date;
}

export default function EventGallery({ eventDate }: EventGalleryProps) {
  const { activeTab, setActiveTab } = useEventVideos();

  // Check if event is in the past (allow uploads)

  const isEventFuture = new Date() < eventDate;

  const handleTabPress = (tab: "all" | "you") => {
    // Update active tab in context - this will trigger preloading for new tab
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => handleTabPress("all")}
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
          onPress={() => handleTabPress("you")}
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

      {isEventFuture ? (
        <Text style={styles.warningText}>
          Wait for the event to start to give your POV
        </Text>
      ) : (
        <View style={styles.videoFeedContainer}>
          <EventVideoFeed />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
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
  warningText: {
    fontSize: 24,
    color: "#808080",
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  videoFeedContainer: {
    flex: 1,
  },
});
