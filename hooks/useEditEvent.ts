// hooks/useEditEvent.ts
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useEventForm } from "./useEventForm";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export function useEditEvent(eventId: string, userId: string) {
  const { formData, updateField, setFormData } = useEventForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          photo: event.photo || null,
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

    try {
      const eventData = {
        name: formData.name.trim(),
        information: formData.information.trim() || undefined,
        location: formData.location.trim() || undefined,
        // Note: Don't include date in edit - it can't be changed
        // Note: photo upload would require additional backend setup for file handling
      };

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
    }
  };

  return {
    formData,
    loading,
    initialLoading,
    error,
    updateField,
    handleSubmit,
  };
}
