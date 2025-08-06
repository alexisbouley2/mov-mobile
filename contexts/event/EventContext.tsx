// contexts/EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import log from "@/utils/logger";
import { EventWithDetails, UpdateEventRequest, Message } from "@movapp/types";
import { eventsApi } from "@/services/api/events";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { PushNotificationService } from "@/services/notifications/pushNotificationService";

interface EventContextType {
  event: EventWithDetails | null;
  eventLoading: boolean;
  error: string | null;
  lastMessage: Message | null;
  loadEvent: (_eventId: string, _userId: string) => Promise<void>;
  updateEvent: (
    _eventId: string,
    _data: UpdateEventRequest,
    _photoData?: {
      coverImagePath?: string;
      coverThumbnailPath?: string;
    }
  ) => Promise<{ error: any }>;
  deleteEvent: () => void;
  clearEventError: () => void;
  clearEvent: () => void;
  setEvent: React.Dispatch<React.SetStateAction<EventWithDetails | null>>;
  setLastMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}

const EventContext = createContext<EventContextType>({
  event: null,
  eventLoading: false,
  error: null,
  lastMessage: null,
  loadEvent: async () => {},
  updateEvent: async () => ({ error: null }),
  deleteEvent: () => {},
  clearEventError: () => {},
  clearEvent: () => {},
  setEvent: () => {},
  setLastMessage: () => {},
});

export const useEvent = () => useContext(EventContext);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUserProfile();
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [eventLoading, seteventLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  const loadEvent = useCallback(async (eventId: string, userId: string) => {
    try {
      seteventLoading(true);
      setError(null);

      const response = await eventsApi.getEvent(eventId, userId);

      if (!response) {
        throw new Error("Failed to fetch event");
      }

      setEvent(response);
      setLastMessage(response.lastMessage);
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
        if (user?.id) {
          await loadEvent(eventId, user.id);
        }
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

  const clearEventError = useCallback(() => {
    setError(null);
  }, []);

  const clearEvent = useCallback(() => {
    setEvent(null);
    setError(null);
  }, []);

  // Track current viewing event for push notifications
  useEffect(() => {
    if (event?.id) {
      PushNotificationService.getInstance().setCurrentViewingEventId(event.id);
      return () => {
        PushNotificationService.getInstance().setCurrentViewingEventId(null);
      };
    }
  }, [event?.id]);

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
      lastMessage,
      loadEvent,
      updateEvent,
      deleteEvent,
      clearEventError,
      clearEvent,
      setEvent,
      setLastMessage,
    }),
    [
      event,
      eventLoading,
      error,
      lastMessage,
      loadEvent,
      updateEvent,
      deleteEvent,
      clearEventError,
      clearEvent,
      setEvent,
      setLastMessage,
    ]
  );

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}
