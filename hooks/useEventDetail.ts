// hooks/useEventDetail.ts
import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  username: string;
  photo: string | null | undefined;
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
  photo: string | null;
  adminId: string;
  admin: User;
  participants: EventParticipant[];
  _count?: {
    videos: number;
  };
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  const fetchEvent = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await response.json();
        setEvent(data);
        setHasInitialData(true);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch event");
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [eventId]
  );

  const toggleParticipation = async (userId: string) => {
    if (!event) return;

    try {
      const isParticipant = event.participants?.some(
        (p) => p.userId === userId
      );

      const response = await fetch(
        `${API_BASE_URL}/events/${eventId}/participants/${userId}`,
        {
          method: isParticipant ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle participation");
      }

      // Refetch the event data to get updated participants
      await fetchEvent(true);
    } catch (err) {
      console.error("Error toggling participation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to toggle participation"
      );
    }
  };

  const refetch = useCallback(() => {
    fetchEvent(true);
  }, [fetchEvent]);

  useEffect(() => {
    if (eventId) {
      fetchEvent(false);
    }
  }, [fetchEvent]);

  return {
    event,
    loading,
    refreshing,
    error,
    refetch,
    toggleParticipation,
    hasInitialData,
  };
}
