import { useState, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useEventForm } from "./useEventForm";
import { useEventPhoto } from "./useEventPhoto";
import { EventDetail } from "./useEventDetail";
import { config } from "@/lib/config";
import log from "@/utils/logger";

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

export function useEditEvent(
  eventId: string,
  userId: string,
  eventData: EventDetail | null
) {
  const { formData, updateField, setFormData } = useEventForm();
  const [loading, setLoading] = useState(false);

  // Memoize the event data to prevent unnecessary re-renders
  const memoizedEventData = useMemo(
    () => eventData,
    [
      eventData?.id,
      eventData?.name,
      eventData?.information,
      eventData?.date,
      eventData?.location,
      eventData?.coverImageUrl,
    ]
  );

  // Initialize photo hook with initial image if provided
  const {
    previewImage,
    pickImage,
    getPhotoData,
    isUploading,
    waitForUpload,
    cleanup,
    cancelJob,
  } = useEventPhoto({
    initialImageUrl: memoizedEventData?.coverImageUrl || null,
  });

  // Initialize form with event data
  useEffect(() => {
    if (memoizedEventData) {
      // Populate form with existing data
      setFormData({
        name: memoizedEventData.name || "",
        information: memoizedEventData.information || "",
        date: new Date(memoizedEventData.date),
        location: memoizedEventData.location || "",
      });

      // The image is already set via initialImageUrl in useEventPhoto
    }
  }, [memoizedEventData, setFormData]);

  const handleSubmit = async (onSuccess: () => void) => {
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

      // Prepare update data
      const eventData: any = {
        name: formData.name.trim(),
        information: formData.information.trim() || undefined,
        location: formData.location.trim() || undefined,
        // Note: Don't include date in edit - it can't be changed
      };

      // Only include photo data if we have new photos
      if (photoData) {
        eventData.coverImagePath = photoData.coverImagePath;
        eventData.coverThumbnailPath = photoData.coverThumbnailPath;
      }

      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      onSuccess();
    } catch (error) {
      log.error("Error updating event:", error);
      Alert.alert("Error", "Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    cancelJob();
  };

  return {
    formData,
    loading,
    updateField,
    handleSubmit,
    handleBack,
    pickImage,
    previewImage,
    isUploading,
  };
}
