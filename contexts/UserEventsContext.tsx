// contexts/UserEventsContext.tsx - Updated with API types
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { eventsApi } from "@/services/api";
import { useAuth } from "./AuthContext";
import { imageCacheService } from "@/services/imageCacheService";
import log from "@/utils/logger";
import { CategorizedEventsResponse, EventForList } from "@movapp/types";

// Use the types from the API instead of defining our own
export type Event = EventForList;
export type CategorizedEvents = CategorizedEventsResponse;

interface UserEventsContextType {
  events: CategorizedEvents;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearEventsError: () => void;
}

const UserEventsContext = createContext<UserEventsContextType>({
  events: { current: [], planned: [], past: [] },
  loading: false,
  refreshing: false,
  error: null,
  refetch: async () => {},
  clearEventsError: () => {},
});

export const useUserEvents = () => useContext(UserEventsContext);

export function UserEventsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabaseUser, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CategorizedEvents>({
    current: [],
    planned: [],
    past: [],
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preloadEventImages = useCallback(
    async (eventsData: CategorizedEvents) => {
      const imagesToPreload: Array<{
        url: string;
        policy: "cover-image" | "cover-thumbnail";
      }> = [];

      // Collect all event cover images and thumbnails
      const allEvents = [
        ...eventsData.current,
        ...eventsData.planned,
        ...eventsData.past,
      ];

      for (const event of allEvents) {
        // Preload cover thumbnails (used in event lists)
        if (event.coverThumbnailUrl) {
          imagesToPreload.push({
            url: event.coverThumbnailUrl,
            policy: "cover-thumbnail",
          });
        }

        // Preload full cover images (used in event details)
        // Check both photo and coverImageUrl for flexibility
        const fullImageUrl = event.coverImageUrl;
        if (fullImageUrl) {
          imagesToPreload.push({
            url: fullImageUrl,
            policy: "cover-image",
          });
        }
      }

      // Preload images in background
      if (imagesToPreload.length > 0) {
        log.info(`Preloading ${imagesToPreload.length} event cover images`);
        await Promise.all(
          imagesToPreload.map(({ url, policy }) =>
            imageCacheService.cache(url, policy)
          )
        );
      }
    },
    []
  );

  const fetchUserEvents = useCallback(
    async (isRefresh = false) => {
      if (!supabaseUser?.id) {
        log.warn("Cannot fetch events: no user ID");
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        log.info(`Fetching events for user: ${supabaseUser.id}`);
        const data: CategorizedEventsResponse = await eventsApi.getUserEvents(
          supabaseUser.id
        );

        setEvents(data);

        // Preload event cover images in background
        await preloadEventImages(data);

        log.info("Events fetched successfully", {
          current: data.current.length,
          planned: data.planned.length,
          past: data.past.length,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch events";
        log.error("Error fetching events:", err);
        setError(errorMessage);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [supabaseUser?.id, preloadEventImages]
  );

  const refetch = useCallback(async () => {
    await fetchUserEvents(true);
  }, [fetchUserEvents]);

  const clearEventsError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch events when user logs in
  useEffect(() => {
    if (isAuthenticated && supabaseUser?.id) {
      log.info("User authenticated, fetching events");
      fetchUserEvents(false);
    } else if (!isAuthenticated) {
      // Clear events data when user logs out
      log.info("User logged out, clearing events data");
      setEvents({ current: [], planned: [], past: [] });
      setError(null);
    }
  }, [isAuthenticated, supabaseUser?.id, fetchUserEvents]);

  const contextValue = useMemo(
    () => ({
      events,
      loading,
      refreshing,
      error,
      refetch,
      clearEventsError,
    }),
    [events, loading, refreshing, error, refetch, clearEventsError]
  );

  return (
    <UserEventsContext.Provider value={contextValue}>
      {children}
    </UserEventsContext.Provider>
  );
}
