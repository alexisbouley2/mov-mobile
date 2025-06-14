// hooks/useEvents.ts
import { useState, useEffect } from "react";

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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export const useEvents = (userId: string) => {
  const [events, setEvents] = useState<CategorizedEvents>({
    current: [],
    planned: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/user/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      setEvents(data);
      setError(null);
    } catch (err) {
      console.log("err", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserEvents();
    }
  }, [userId]);

  const refetch = () => {
    fetchUserEvents();
  };

  return {
    events,
    loading,
    error,
    refetch,
  };
};
