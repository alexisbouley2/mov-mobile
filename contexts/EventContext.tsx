// contexts/EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import log from "@/utils/logger";
import { EventWithDetails, UpdateEventRequest } from "@movapp/types";
import { eventsApi } from "@/services/api/events";

interface EventContextType {
  event: EventWithDetails | null;
  eventLoading: boolean;
  error: string | null;
  loadEvent: (_eventId: string) => Promise<void>;
  updateEvent: (
    _eventId: string,
    _data: UpdateEventRequest,
    _photoData?: {
      coverImagePath?: string;
      coverThumbnailPath?: string;
    }
  ) => Promise<{ error: any }>;
  toggleParticipation: (_userId: string) => Promise<void>;
  deleteEvent: () => void;
  clearEventError: () => void;
  clearEvent: () => void;
}

const EventContext = createContext<EventContextType>({
  event: null,
  eventLoading: false,
  error: null,
  loadEvent: async () => {},
  updateEvent: async () => ({ error: null }),
  toggleParticipation: async () => {},
  deleteEvent: () => {},
  clearEventError: () => {},
  clearEvent: () => {},
});

export const useEvent = () => useContext(EventContext);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [eventLoading, seteventLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async (eventId: string) => {
    try {
      seteventLoading(true);
      setError(null);

      const response = await eventsApi.getEvent(eventId);

      if (!response) {
        throw new Error("Failed to fetch event");
      }

      setEvent(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch event";
      log.error("Error fetching event:", err);
      setError(errorMessage);
    } finally {
      seteventLoading(false);
    }
  }, []);

  const updateEvent = useCallback(
    async (
      eventId: string,
      updateData: UpdateEventRequest,
      photoData?: {
        coverImagePath?: string;
        coverThumbnailPath?: string;
      }
    ) => {
      try {
        seteventLoading(true);
        setError(null);

        // Prepare update data
        const eventUpdateData: UpdateEventRequest = { ...updateData };

        // Include photo data if provided
        if (photoData) {
          eventUpdateData.coverImagePath = photoData.coverImagePath;
          eventUpdateData.coverThumbnailPath = photoData.coverThumbnailPath;
        }

        await eventsApi.update(eventId, eventUpdateData);

        // Reload event to get updated data
        await loadEvent(eventId);
        return { error: null };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update event";
        setError(errorMessage);
        return { error: errorMessage };
      } finally {
        seteventLoading(false);
      }
    },
    [loadEvent]
  );

  const updateParticipantConfirmedStatusLocally = useCallback(
    (userId: string, confirmed: boolean) => {
      setEvent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user.id === userId ? { ...p, confirmed } : p
          ),
        };
      });
    },
    []
  );

  const toggleParticipation = useCallback(
    async (userId: string) => {
      if (!event) return;

      // Find current participant status
      const currentParticipant = event.participants?.find(
        (p) => p.user.id === userId
      );
      if (!currentParticipant) return;

      const newConfirmedStatus = !currentParticipant.confirmed;

      // Optimistically update local state
      updateParticipantConfirmedStatusLocally(userId, newConfirmedStatus);

      try {
        await eventsApi.updateParticipantConfirmation(
          event.id,
          userId,
          newConfirmedStatus
        );
        // Optionally: schedule a background refresh here
      } catch {
        // Revert the change and show error
        updateParticipantConfirmedStatusLocally(userId, !newConfirmedStatus);
        setError("Failed to update participation status");
      }
    },
    [event, updateParticipantConfirmedStatusLocally]
  );

  const clearEventError = useCallback(() => {
    setError(null);
  }, []);

  const clearEvent = useCallback(() => {
    setEvent(null);
    setError(null);
  }, []);

  const deleteEvent = useCallback(() => {
    if (!event) return;

    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await eventsApi.delete(event.id, event.adminId);
              // Navigate away after successful deletion
              router.push("/(app)/(tabs)/events");
            } catch (error) {
              log.error("Error deleting event:", error);
              setError("Failed to delete event. Please try again.");
            }
          },
        },
      ]
    );
  }, [event]);

  const contextValue = useMemo(
    () => ({
      event,
      eventLoading,
      error,
      loadEvent,
      updateEvent,
      toggleParticipation,
      deleteEvent,
      clearEventError,
      clearEvent,
    }),
    [
      event,
      eventLoading,
      error,
      loadEvent,
      updateEvent,
      toggleParticipation,
      deleteEvent,
      clearEventError,
      clearEvent,
    ]
  );

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}
