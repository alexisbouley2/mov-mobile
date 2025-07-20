// contexts/EventParticipantsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { eventsApi } from "@/services/api";
import log from "@/utils/logger";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/event/EventContext";
import { EventParticipantsResponse, Participant } from "@movapp/types";

interface EventParticipantsContextType {
  // Preview data (from EventContext)
  previewParticipants: Participant[];
  totalCount: number;

  // Bottom sheet data
  confirmedParticipants: Participant[];
  unconfirmedParticipants: Participant[];
  confirmedLoading: boolean;
  unconfirmedLoading: boolean;
  confirmedHasMore: boolean;
  unconfirmedHasMore: boolean;
  loadConfirmedParticipants: (_eventId: string) => Promise<void>;
  loadUnconfirmedParticipants: (_eventId: string) => Promise<void>;
  loadMoreConfirmedParticipants: () => Promise<void>;
  loadMoreUnconfirmedParticipants: () => Promise<void>;

  // Shared state
  currentEventId: string | null;
  error: string | null;
  clearError: () => void;
  loadBothParticipants: (_eventId: string) => Promise<void>;

  // Participant management
  deleteParticipant: (_participantUserId: string) => Promise<void>;
}

const EventParticipantsContext = createContext<EventParticipantsContextType>({
  previewParticipants: [],
  totalCount: 0,
  confirmedParticipants: [],
  unconfirmedParticipants: [],
  confirmedLoading: false,
  unconfirmedLoading: false,
  confirmedHasMore: true,
  unconfirmedHasMore: true,
  loadConfirmedParticipants: async () => {},
  loadUnconfirmedParticipants: async () => {},
  loadMoreConfirmedParticipants: async () => {},
  loadMoreUnconfirmedParticipants: async () => {},
  currentEventId: null,
  error: null,
  clearError: () => {},
  loadBothParticipants: async () => {},
  deleteParticipant: async () => {},
});

export const useEventParticipants = () => useContext(EventParticipantsContext);

export function EventParticipantsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserProfile();
  const { event, setEvent } = useEvent();

  // Confirmed
  const [confirmedParticipants, setConfirmedParticipants] = useState<
    Participant[]
  >([]);
  const [confirmedLoading, setConfirmedLoading] = useState(false);
  const [confirmedHasMore, setConfirmedHasMore] = useState(true);
  const [confirmedPage, setConfirmedPage] = useState(1);

  // Unconfirmed
  const [unconfirmedParticipants, setUnconfirmedParticipants] = useState<
    Participant[]
  >([]);
  const [unconfirmedLoading, setUnconfirmedLoading] = useState(false);
  const [unconfirmedHasMore, setUnconfirmedHasMore] = useState(true);
  const [unconfirmedPage, setUnconfirmedPage] = useState(1);

  // Shared state
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to load a page of participants (mutualized)
  const loadParticipantsPage = useCallback(
    async (
      eventId: string,
      pageNum: number,
      confirmed: boolean,
      setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>,
      setHasMore: React.Dispatch<React.SetStateAction<boolean>>,
      setPage: React.Dispatch<React.SetStateAction<number>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data: EventParticipantsResponse =
          await eventsApi.getEventParticipants(
            eventId,
            user.id,
            pageNum,
            20,
            confirmed
          );
        if (pageNum === 1) {
          setParticipants(data.participants);
        } else {
          setParticipants((prev) => {
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
      } catch (err) {
        log.error("Error loading participants:", err);
        setError("Failed to load participants");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  // Loaders for confirmed/unconfirmed
  const loadConfirmedParticipants = useCallback(
    async (eventId: string) => {
      await loadParticipantsPage(
        eventId,
        1,
        true,
        setConfirmedParticipants,
        setConfirmedHasMore,
        setConfirmedPage,
        setConfirmedLoading
      );
    },
    [loadParticipantsPage]
  );

  const loadUnconfirmedParticipants = useCallback(
    async (eventId: string) => {
      await loadParticipantsPage(
        eventId,
        1,
        false,
        setUnconfirmedParticipants,
        setUnconfirmedHasMore,
        setUnconfirmedPage,
        setUnconfirmedLoading
      );
    },
    [loadParticipantsPage]
  );

  // Load more for confirmed/unconfirmed
  const loadMoreConfirmedParticipants = useCallback(async () => {
    if (confirmedHasMore && !confirmedLoading && currentEventId) {
      await loadParticipantsPage(
        currentEventId,
        confirmedPage + 1,
        true,
        setConfirmedParticipants,
        setConfirmedHasMore,
        setConfirmedPage,
        setConfirmedLoading
      );
    }
  }, [
    confirmedHasMore,
    confirmedLoading,
    currentEventId,
    confirmedPage,
    loadParticipantsPage,
  ]);

  const loadMoreUnconfirmedParticipants = useCallback(async () => {
    if (unconfirmedHasMore && !unconfirmedLoading && currentEventId) {
      await loadParticipantsPage(
        currentEventId,
        unconfirmedPage + 1,
        false,
        setUnconfirmedParticipants,
        setUnconfirmedHasMore,
        setUnconfirmedPage,
        setUnconfirmedLoading
      );
    }
  }, [
    unconfirmedHasMore,
    unconfirmedLoading,
    currentEventId,
    unconfirmedPage,
    loadParticipantsPage,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Delete participant with API call first, then update UI if successful
  const deleteParticipant = useCallback(
    async (participantUserId: string) => {
      if (!event || !user) return;

      try {
        await eventsApi.deleteParticipant(
          event.id,
          participantUserId,
          event.adminId
        );

        // Only update UI after successful API call
        setConfirmedParticipants((prev) =>
          prev.filter((p) => p.user.id !== participantUserId)
        );
        setUnconfirmedParticipants((prev) =>
          prev.filter((p) => p.user.id !== participantUserId)
        );

        // Also update the main event participants (preview)
        setEvent((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: prev.participants.filter(
              (p) => p.user.id !== participantUserId
            ),
          };
        });
      } catch (error) {
        // Don't update UI, just show error
        setError("Failed to delete participant. Please try again.");
        throw error; // Re-throw so component can handle it
      }
    },
    [event, user, setEvent]
  );

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

  // Load both lists when opening bottom sheet
  const loadBothParticipants = useCallback(
    async (eventId: string) => {
      await Promise.all([
        loadConfirmedParticipants(eventId),
        loadUnconfirmedParticipants(eventId),
      ]);
    },
    [loadConfirmedParticipants, loadUnconfirmedParticipants]
  );

  const contextValue = useMemo(
    () => ({
      previewParticipants,
      totalCount,
      confirmedParticipants,
      unconfirmedParticipants,
      confirmedLoading,
      unconfirmedLoading,
      confirmedHasMore,
      unconfirmedHasMore,
      loadConfirmedParticipants,
      loadUnconfirmedParticipants,
      loadMoreConfirmedParticipants,
      loadMoreUnconfirmedParticipants,
      currentEventId,
      error,
      clearError,
      loadBothParticipants,
      deleteParticipant,
    }),
    [
      previewParticipants,
      totalCount,
      confirmedParticipants,
      unconfirmedParticipants,
      confirmedLoading,
      unconfirmedLoading,
      confirmedHasMore,
      unconfirmedHasMore,
      loadConfirmedParticipants,
      loadUnconfirmedParticipants,
      loadMoreConfirmedParticipants,
      loadMoreUnconfirmedParticipants,
      currentEventId,
      error,
      clearError,
      loadBothParticipants,
      deleteParticipant,
    ]
  );

  return (
    <EventParticipantsContext.Provider value={contextValue}>
      {children}
    </EventParticipantsContext.Provider>
  );
}
