import { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEventForm } from "./useEventForm";
import { jobManager } from "@/services/jobService";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export function useCreateEvent(userId: string) {
  const router = useRouter();
  const { jobId, selectedEventIds } = useLocalSearchParams<{
    jobId?: string;
    selectedEventIds?: string;
  }>();

  const { formData, updateField, validateEventDateTime } = useEventForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (onSuccess?: () => void) => {
    if (!validateEventDateTime(formData.date)) {
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert("Error", "Event name is required");
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        name: formData.name.trim(),
        information: formData.information.trim() || undefined,
        date: formData.date.toISOString(),
        location: formData.location.trim() || undefined,
        adminId: userId,
      };

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const newEvent = await response.json();

      // If we have a video job, associate it with the new event
      if (jobId) {
        try {
          // Parse previously selected event IDs
          const previousEventIds = selectedEventIds
            ? selectedEventIds.split(",")
            : [];

          // Add the new event ID
          const allEventIds = [...previousEventIds, newEvent.id];

          // Associate video with all selected events
          await jobManager.associateEvents(jobId, allEventIds);

          Alert.alert("Success", "Event created and video added!", [
            {
              text: "OK",
              onPress: () => router.push("/(tabs)/events"),
            },
          ]);
        } catch (error) {
          console.error("Failed to associate video with event:", error);
          Alert.alert(
            "Warning",
            "Event created but failed to add video. You can add it later.",
            [
              {
                text: "OK",
                onPress: () => router.push("/(tabs)/events"),
              },
            ]
          );
        }
      } else {
        // Normal event creation without video
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/(tabs)/events");
        }
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    updateField,
    handleSubmit,
    hasVideo: !!jobId,
  };
}
