// contexts/EventContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { config } from "@/lib/config";
import log from "@/utils/logger";

export interface User {
  id: string;
  username: string;
  profileThumbnailUrl: string | null | undefined;
  //   photo: string | null | undefined;
}

export interface EventParticipant {
  id: string;
  userId: string;
  user: User;
  joinedAt: string;
}

export interface EventDetail {
  id: string;
  name: string;
  information: string | null;
  date: string;
  createdAt: string;
  location: string | null;
  coverImagePath: string | null;
  coverThumbnailPath: string | null;
  coverImageUrl: string | null;
  adminId: string;
  admin: User;
  participants: EventParticipant[];
  _count?: {
    videos: number;
  };
}

interface EventContextType {
  event: EventDetail | null;
  eventLoading: boolean;
  error: string | null;
  loadEvent: (_eventId: string) => Promise<void>;
  updateEvent: (
    _eventId: string,
    _data: Partial<EventDetail>,
    _photoData?: {
      coverImagePath?: string;
      coverThumbnailPath?: string;
    }
  ) => Promise<{ error: any }>;
  toggleParticipation: (_userId: string) => Promise<void>;
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
  clearEventError: () => {},
  clearEvent: () => {},
});

export const useEvent = () => useContext(EventContext);

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventLoading, seteventLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async (eventId: string) => {
    try {
      seteventLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }

      const data = await response.json();
      setEvent(data);
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
      updateData: Partial<EventDetail>,
      photoData?: {
        coverImagePath?: string;
        coverThumbnailPath?: string;
      }
    ) => {
      try {
        seteventLoading(true);
        setError(null);

        // Prepare update data
        const eventUpdateData: any = { ...updateData };

        // Include photo data if provided
        if (photoData) {
          eventUpdateData.coverImagePath = photoData.coverImagePath;
          eventUpdateData.coverThumbnailPath = photoData.coverThumbnailPath;
        }

        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventUpdateData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to update event: ${response.status} - ${errorText}`
          );
        }

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

  const toggleParticipation = useCallback(
    async (_userId: string) => {
      if (!event) return;

      try {
        // TODO: Implement actual API call for toggling participation
        // For now, just reload the event data to get updated participants
        await loadEvent(event.id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to toggle participation"
        );
      }
    },
    [event, loadEvent]
  );

  const clearEventError = useCallback(() => {
    setError(null);
  }, []);

  const clearEvent = useCallback(() => {
    setEvent(null);
    setError(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      event,
      eventLoading,
      error,
      loadEvent,
      updateEvent,
      toggleParticipation,
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
