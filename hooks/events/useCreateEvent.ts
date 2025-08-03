// hooks/useCreateEvent.ts - Updated to use API
import { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEventForm } from "../event/useEventForm";
import { useEventPhoto } from "../event/useEventPhoto";
import { mediaUploadManager } from "@/services/upload";
import { eventsApi, videosApi } from "@/services/api";
import log from "@/utils/logger";
import { CreateEventRequest, AssociateEventsRequest } from "@movapp/types";

export function useCreateEvent(userId: string) {
  const { jobId, selectedEventIds } = useLocalSearchParams<{
    jobId?: string;
    selectedEventIds?: string;
  }>();

  const { formData, updateField, validateEventDateTime, postProcessFormData } =
    useEventForm();
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

  const handleSubmit = async (onSuccess: () => void) => {
    if (!validateEventDateTime(formData.date)) {
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not authenticated");
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

      // Process form data with default values
      const processedData = postProcessFormData(formData);

      // Create event data
      const eventData: CreateEventRequest = {
        name: processedData.name,
        information: processedData.information,
        date: processedData.date,
        adminId: userId,
        ...(photoData && {
          coverImagePath: photoData.coverImagePath,
          coverThumbnailPath: photoData.coverThumbnailPath,
        }),
      };

      const newEvent = await eventsApi.create(eventData);

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

          // Call onSuccess callback if provided, otherwise navigate directly

          onSuccess();
        } catch (error) {
          log.error("Failed to associate video with event:", error);

          onSuccess();
        }
      } else {
        // Normal event creation without video

        onSuccess();
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
    // Wait for job to complete if it's still uploading
    const job = await mediaUploadManager.waitForJob(jobId);

    if (!job.uploadResult?.videoPath) {
      throw new Error("Unable to associate video with events");
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
