import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useEventForm } from "./useEventForm";
import { eventPhotoJobManager } from "@/services/eventPhotoJobService";
import { config } from "@/lib/config";

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

export function useEditEvent(eventId: string, userId: string) {
  const { formData, updateField, setFormData } = useEventForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);

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
        console.error("Error loading event:", err);
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
    if (!userId) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert("Error", "Event name is required");
      return;
    }

    setLoading(true);
    setPhotoUploadProgress(0);

    try {
      let photoData = undefined;

      // If there's a new photo job, upload it first
      if (formData.photoJobId) {
        try {
          console.log("Uploading new event photo...");
          const uploadResult = await eventPhotoJobManager.uploadJob(
            formData.photoJobId,
            (progress) => {
              setPhotoUploadProgress(progress);
            }
          );

          photoData = {
            photoStoragePath: uploadResult.fullPath,
            photoThumbnailPath: uploadResult.thumbnailPath,
          };

          // Clean up the job
          eventPhotoJobManager.cleanupJob(formData.photoJobId);
        } catch (uploadError) {
          console.error("Photo upload failed:", uploadError);
          Alert.alert(
            "Warning",
            "Photo upload failed. Saving event without new photo."
          );
        }
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
        eventData.photoStoragePath = photoData.photoStoragePath;
        eventData.photoThumbnailPath = photoData.photoThumbnailPath;
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

      await response.json();
      onSuccess();
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Error", "Failed to update event. Please try again.");
    } finally {
      setLoading(false);
      setPhotoUploadProgress(0);
    }
  };

  const cancelPhotoUpload = () => {
    if (formData.photoJobId) {
      eventPhotoJobManager.cancelJob(formData.photoJobId);
      updateField("photoJobId", null);
      setPhotoUploadProgress(0);
      // Revert to original photo if available
      // Note: You might want to store the original photo URL separately
    }
  };

  return {
    formData,
    loading,
    initialLoading,
    error,
    photoUploadProgress,
    updateField,
    handleSubmit,
    cancelPhotoUpload,
  };
}
