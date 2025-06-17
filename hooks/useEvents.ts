// hooks/useEvents.ts
import { useState, useEffect, useCallback } from "react";
import { config } from "@/lib/config";

export interface User {
  id: string;
  username: string;
  photo?: string | null;
}

export interface EventParticipant {
  id: string;
  user: User;
  joinedAt: string;
}

export interface Event {
  id: string;
  name: string;
  information?: string | null;
  date: string;
  createdAt: string;
  location?: string | null;
  admin: User;
  participants: EventParticipant[];
  povCount?: number;
  photo?: string | null;
  _count?: {
    videos: number;
  };
}

export interface CategorizedEvents {
  current: Event[];
  planned: Event[];
  past: Event[];
}

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

export const useEvents = (userId: string) => {
  const [events, setEvents] = useState<CategorizedEvents>({
    current: [],
    planned: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  const fetchUserEvents = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(`${API_BASE_URL}/events/user/${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();

        setEvents(data);
        setError(null);
        setHasInitialData(true);
      } catch (err) {
        console.log("err", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      fetchUserEvents(false);
    }
  }, [fetchUserEvents]);

  const refetch = useCallback(() => {
    fetchUserEvents(true);
  }, [fetchUserEvents]);

  return {
    events,
    loading,
    refreshing,
    error,
    refetch,
    hasInitialData,
  };
};
