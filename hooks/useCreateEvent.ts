// hooks/useCreateEvent.ts
import { useState } from "react";
import { Alert } from "react-native";
import { useEventForm } from "./useEventForm";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export function useCreateEvent(userId: string) {
  const { formData, updateField, validateEventDateTime } = useEventForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (onSuccess: () => void) => {
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
        // Note: photo upload would require additional backend setup for file handling
        // For now, we'll skip photo upload - you can implement this later
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

      await response.json();
      onSuccess();
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
  };
}
