// app/(app)/(events)/select-events.tsx - Updated to use UserEventsContext
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserEvents } from "@/contexts/UserEventsContext";
import { mediaUploadManager, type UploadJob } from "@/services/upload";
import { config } from "@/lib/config";
import log from "@/utils/logger";

export default function SelectEventsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const { events, loading, hasInitialData } = useUserEvents();

  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
    new Set()
  );
  const [includeCreateNew, setIncludeCreateNew] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [_job, setJob] = useState(mediaUploadManager.getJob(jobId));

  // Subscribe to job updates
  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = mediaUploadManager.subscribe(
      jobId,
      (updatedJob: UploadJob) => {
        setJob(updatedJob);
      }
    );

    return unsubscribe;
  }, [jobId]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Toggle event selection
  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Handle add button
  const handleAdd = async () => {
    if (selectedEventIds.size === 0 && !includeCreateNew) {
      Alert.alert("Error", "Please select at least one event");
      return;
    }

    setIsProcessing(true);

    try {
      // If creating new event, navigate there with job context
      if (includeCreateNew) {
        router.push({
          pathname: "/(app)/(events)/create",
          params: {
            jobId,
            selectedEventIds: Array.from(selectedEventIds).join(","),
          },
        });
        return;
      }

      // Otherwise, associate with selected events
      await associateVideoWithEvents(jobId, Array.from(selectedEventIds));

      Alert.alert("Success", "Video added to events!", [
        {
          text: "OK",
          onPress: () => router.push("/(app)/(tabs)/events"),
        },
      ]);
    } catch (error) {
      log.error("Failed to associate events:", error);
      Alert.alert("Error", "Failed to add video to events");
    } finally {
      setIsProcessing(false);
    }
  };

  // Associate video with events
  const associateVideoWithEvents = async (
    jobId: string,
    eventIds: string[]
  ) => {
    const job = mediaUploadManager.getJob(jobId);
    if (!job || job.status !== "uploaded" || !job.uploadResult?.videoPath) {
      throw new Error("Video not ready for association");
    }

    const API_BASE_URL = config.EXPO_PUBLIC_API_URL;
    const response = await fetch(`${API_BASE_URL}/videos/associate-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: job.uploadResult.videoPath,
        userId: job.userId,
        eventIds,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to associate events");
    }

    // Clean up the job
    mediaUploadManager.cleanupJob(jobId);
  };

  // Format time display
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return "Just started";
    } else if (diffHours < 24) {
      return `Started ${diffHours}h ago`;
    } else {
      return `Started ${Math.floor(diffHours / 24)}d ago`;
    }
  };

  // Filter current events (last 24h)
  const currentEvents = events.current || [];
  const hasActiveEvents = currentEvents.length > 0;

  // Show loading only if we haven't loaded data yet
  if (loading && !hasInitialData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="#0096ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to an Event</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Events Section */}
        {hasActiveEvents ? (
          <>
            {currentEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => toggleEventSelection(event.id)}
                activeOpacity={0.7}
              >
                <View style={styles.eventCheckbox}>
                  {selectedEventIds.has(event.id) && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </View>

                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>
                    {event.name || "Unnamed Event"}
                  </Text>
                  <Text style={styles.eventTime}>
                    {formatEventTime(event.date)} by {event.admin.username}
                  </Text>
                </View>

                <View style={styles.eventParticipants}>
                  {event.participants.slice(0, 3).map((participant, index) => (
                    <View
                      key={participant.id}
                      style={[
                        styles.participantAvatar,
                        { marginLeft: index > 0 ? -8 : 0 },
                      ]}
                    >
                      {participant.user.photo ? (
                        <Text>👤</Text>
                      ) : (
                        <View style={styles.defaultAvatar} />
                      )}
                    </View>
                  ))}
                  {event.participants.length > 3 && (
                    <View
                      style={[styles.participantAvatar, { marginLeft: -8 }]}
                    >
                      <Text style={styles.moreParticipants}>
                        +{event.participants.length - 3}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No active events</Text>
            <Text style={styles.noEventsSubtext}>
              Create a new event to start sharing videos
            </Text>
          </View>
        )}

        {/* Create New Event Option */}
        <View style={styles.createNewSection}>
          <Text style={styles.sectionTitle}>Or create a new one</Text>

          <TouchableOpacity
            style={styles.eventItem}
            onPress={() => setIncludeCreateNew(!includeCreateNew)}
            activeOpacity={0.7}
          >
            <View style={styles.eventCheckbox}>
              {includeCreateNew && (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
            </View>

            <View style={styles.eventInfo}>
              <Text style={styles.eventName}>New Quick MOV</Text>
            </View>

            <View style={styles.quickMovIcon}>
              <Text style={styles.quickMovText}>Quick</Text>
              <Text style={styles.quickMovTextMov}>MOV</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addButton,
            selectedEventIds.size === 0 &&
              !includeCreateNew &&
              styles.addButtonDisabled,
            isProcessing && styles.addButtonDisabled,
          ]}
          onPress={handleAdd}
          disabled={
            (selectedEventIds.size === 0 && !includeCreateNew) || isProcessing
          }
        >
          <Text style={styles.addButtonText}>
            {isProcessing ? "Processing..." : "Add"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  eventCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 13,
    color: "#999",
  },
  eventParticipants: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  defaultAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#666",
  },
  moreParticipants: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  noEventsContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  createNewSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  quickMovIcon: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  quickMovText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ff0080",
  },
  quickMovTextMov: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00ffff",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  addButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#333",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
