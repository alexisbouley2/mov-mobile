// useEditEvent.ts
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useEventForm } from "./useEventForm";
import { useEventPhoto } from "./useEventPhoto";
import { useEvent } from "@/contexts/EventContext";
import log from "@/utils/logger";
import { UpdateEventRequest } from "@movapp/types";

export function useEditEvent() {
  const { event, updateEvent, deleteEvent } = useEvent(); // Get from context
  const { formData, updateField, setFormData } = useEventForm();
  const [loading, setLoading] = useState(false);
  // Initialize photo with event's current image
  const {
    previewImage,
    pickImage,
    getPhotoData,
    isUploading,
    waitForUpload,
    cleanup,
    cancelJob,
  } = useEventPhoto({
    initialImageUrl: event?.coverImageUrl || null,
  });

  // Initialize form with event data from context
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        information: event.information || "",
        date: new Date(event.date),
        location: event.location || "",
      });
    }
  }, [event, setFormData]);

  const handleSubmit = async (onSuccess: () => void) => {
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
      const eventUpdateData: UpdateEventRequest = {
        name: formData.name.trim(),
        information: formData.information.trim(),
        location: formData.location.trim(),
        // Note: Don't include date in edit - it can't be changed
      };

      // Use context's updateEvent instead of direct fetch
      const { error } = await updateEvent(
        event!.id,
        eventUpdateData,
        photoData
      );

      if (error) {
        throw new Error(error);
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
    deleteEvent,
  };
}
