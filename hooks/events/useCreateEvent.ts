// hooks/useCreateEvent.ts - Updated to use API
import { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEventForm } from "../event/useEventForm";
import { useEventPhoto } from "../event/useEventPhoto";
import { useUserEvents } from "@/contexts/UserEventsContext";
import { mediaUploadManager } from "@/services/upload";
import { eventsApi, videosApi } from "@/services/api";
import log from "@/utils/logger";
import { CreateEventRequest, AssociateEventsRequest } from "@movapp/types";

export function useCreateEvent(userId: string) {
  const router = useRouter();
  const { jobId, selectedEventIds } = useLocalSearchParams<{
    jobId?: string;
    selectedEventIds?: string;
  }>();

  // Use context to refresh events after creation
  const { refetch } = useUserEvents();

  const { formData, updateField, validateEventDateTime } = useEventForm();
  const [loading, setLoading] = useState(false);

  const {
    isUploading,
    progress,
    getPhotoData,
    waitForUpload,
    cleanup,
    cancelJob,
    pickImage,
    previewImage,
  } = useEventPhoto();

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
      // If there's an upload in progress, wait for it to complete
      if (isUploading) {
        await waitForUpload();
      }

      let photoData = undefined;

      // If there's a completed photo job, get the upload result
      const photoResult = getPhotoData();
      if (photoResult) {
        photoData = photoResult;
        cleanup();
      }

      // Create event data
      const eventData: CreateEventRequest = {
        name: formData.name.trim(),
        information: formData.information.trim() || undefined,
        date: formData.date,
        adminId: userId,
        ...(photoData && {
          coverImagePath: photoData.coverImagePath,
          coverThumbnailPath: photoData.coverThumbnailPath,
        }),
      };

      const newEvent = await eventsApi.create(eventData);

      // Refresh events context to include the new event
      await refetch();

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
          await associateVideoWithEvents(jobId, allEventIds);

          Alert.alert("Success", "Event created and video added!", [
            {
              text: "OK",
              onPress: () => router.push("/(app)/(tabs)/events"),
            },
          ]);
        } catch (error) {
          log.error("Failed to associate video with event:", error);
          Alert.alert(
            "Warning",
            "Event created but failed to add video. You can add it later.",
            [
              {
                text: "OK",
                onPress: () => router.push("/(app)/(tabs)/events"),
              },
            ]
          );
        }
      } else {
        // Normal event creation without video
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/(app)/(tabs)/events");
        }
      }
    } catch (error) {
      log.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
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

    const associationData: AssociateEventsRequest = {
      fileName: job.uploadResult.videoPath,
      userId: job.userId,
      eventIds,
    };

    await videosApi.associateEvents(associationData);

    // Clean up the job
    mediaUploadManager.cleanupJob(jobId);
  };

  const handleBack = () => {
    cancelJob();
  };

  return {
    formData,
    loading,
    photoUploadProgress: progress,
    updateField,
    handleSubmit,
    handleBack,
    hasVideo: !!jobId,
    // Photo upload functions to pass to child components (like edit-profile)
    pickImage,
    previewImage,
    isUploading,
  };
}
