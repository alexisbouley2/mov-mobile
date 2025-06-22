import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useEventForm } from "./useEventForm";
import { useEventPhoto } from "./useEventPhoto";
import { config } from "@/lib/config";
import log from "@/utils/logger";

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

export function useEditEvent(eventId: string, userId: string) {
  const { formData, updateField, setFormData } = useEventForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    currentJobId,
    isUploading,
    progress,
    getPhotoData,
    waitForUpload,
    cleanup,
    cancelJob,
  } = useEventPhoto({
    initialImageUrl: formData.photo,
    onImageChange: (imageUri) => {
      updateField("photo", imageUri);
      updateField("photoJobId", currentJobId);
    },
  });

  // Load existing event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);

        if (!response.ok) {
          throw new Error("Failed to load event");
        }

        const event = await response.json();

        // Check if user is admin
        if (event.adminId !== userId) {
          throw new Error("You don't have permission to edit this event");
        }

        // Populate form with existing data
        setFormData({
          name: event.name || "",
          information: event.information || "",
          date: new Date(event.date),
          location: event.location || "",
          photo: event.photoUrl || null, // Use photoUrl from response (includes presigned URL)
          photoJobId: null, // No job initially since we're loading existing data
        });
      } catch (err) {
        log.error("Error loading event:", err);
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setInitialLoading(false);
      }
    };

    if (eventId && userId) {
      loadEvent();
    }
  }, [eventId, userId, setFormData]);

  const handleSubmit = async (onSuccess: () => void) => {
    log.info("formData", formData);
    log.info("here 1");
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
      log.info("here 2");
      if (isUploading) {
        await waitForUpload();
      }

      log.info("here 3");
      let photoData = undefined;

      // If there's a completed photo job, get the upload result
      const photoResult = getPhotoData();
      if (photoResult) {
        photoData = photoResult;
        cleanup();
      }

      log.info("here 4");
      log.info("photoData", photoData);

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

      log.info("here 5");
      log.info("eventData", eventData);

      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      log.info("here 6");
      log.info("response", response);

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      log.info("here 7");

      onSuccess();

      log.info("here 8");
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
    initialLoading,
    error,
    photoUploadProgress: progress,
    updateField,
    handleSubmit,
    handleBack,
  };
}
