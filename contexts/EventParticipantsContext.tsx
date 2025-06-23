// contexts/EventParticipantsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { config } from "@/lib/config";
import log from "@/utils/logger";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/EventContext";

export interface Participant {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    profileThumbnailUrl: string | null | undefined;
  };
  joinedAt: string;
}

export interface EventParticipantsResponse {
  participants: Participant[];
  hasMore: boolean;
  page: number;
  total: number;
  event: {
    id: string;
    name: string | null;
  };
}

interface EventParticipantsContextType {
  // Preview data (from EventContext)
  previewParticipants: Participant[];
  totalCount: number;

  // Bottom sheet data
  bottomSheetParticipants: Participant[];
  bottomSheetLoading: boolean;
  hasMore: boolean;
  loadBottomSheetParticipants: (_eventId: string) => Promise<void>;
  loadMoreParticipants: () => Promise<void>;

  // Shared state
  currentEventId: string | null;
  error: string | null;
  clearError: () => void;
}

const EventParticipantsContext = createContext<EventParticipantsContextType>({
  previewParticipants: [],
  totalCount: 0,
  bottomSheetParticipants: [],
  bottomSheetLoading: false,
  hasMore: true,
  loadBottomSheetParticipants: async () => {},
  loadMoreParticipants: async () => {},
  currentEventId: null,
  error: null,
  clearError: () => {},
});

export const useEventParticipants = () => useContext(EventParticipantsContext);

export function EventParticipantsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserProfile();
  const { event } = useEvent();

  // Bottom sheet state
  const [bottomSheetParticipants, setBottomSheetParticipants] = useState<
    Participant[]
  >([]);
  const [bottomSheetLoading, setBottomSheetLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Shared state
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load participants for bottom sheet with pagination
  const loadParticipantsPage = useCallback(
    async (eventId: string, pageNum: number) => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `${config.EXPO_PUBLIC_API_URL}/events/${eventId}/participants/user/${user.id}?page=${pageNum}&limit=20`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data: EventParticipantsResponse = await response.json();

          if (pageNum === 1) {
            setBottomSheetParticipants(data.participants);
          } else {
            // Deduplicate participants when loading more
            setBottomSheetParticipants((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newParticipants = data.participants.filter(
                (p: Participant) => !existingIds.has(p.id)
              );
              return [...prev, ...newParticipants];
            });
          }

          setHasMore(data.hasMore);
          setPage(pageNum);
          setCurrentEventId(eventId);
        } else {
          log.error("Failed to load participants:", response.statusText);
          setError("Failed to load participants");
        }
      } catch (err) {
        log.error("Error loading participants:", err);
        setError("Failed to load participants");
      } finally {
        setBottomSheetLoading(false);
      }
    },
    [user?.id]
  );

  // Load initial participants for bottom sheet
  const loadBottomSheetParticipants = useCallback(
    async (eventId: string) => {
      setBottomSheetLoading(true);
      setError(null);
      await loadParticipantsPage(eventId, 1);
    },
    [loadParticipantsPage]
  );

  // Load more participants (pagination)
  const loadMoreParticipants = useCallback(async () => {
    if (hasMore && !bottomSheetLoading && currentEventId) {
      await loadParticipantsPage(currentEventId, page + 1);
    }
  }, [currentEventId, hasMore, bottomSheetLoading, page, loadParticipantsPage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set current event when event changes
  useEffect(() => {
    if (event?.id) {
      setCurrentEventId(event.id);
    }
  }, [event?.id]);

  // Get preview data from EventContext
  const previewParticipants = useMemo(() => {
    return event?.participants || [];
  }, [event?.participants]);

  const totalCount = useMemo(() => {
    return event?.participants?.length || 0;
  }, [event?.participants?.length]);

  const contextValue = useMemo(
    () => ({
      previewParticipants,
      totalCount,
      bottomSheetParticipants,
      bottomSheetLoading,
      hasMore,
      loadBottomSheetParticipants,
      loadMoreParticipants,
      currentEventId,
      error,
      clearError,
    }),
    [
      previewParticipants,
      totalCount,
      bottomSheetParticipants,
      bottomSheetLoading,
      hasMore,
      loadBottomSheetParticipants,
      loadMoreParticipants,
      currentEventId,
      error,
      clearError,
    ]
  );

  return (
    <EventParticipantsContext.Provider value={contextValue}>
      {children}
    </EventParticipantsContext.Provider>
  );
}
