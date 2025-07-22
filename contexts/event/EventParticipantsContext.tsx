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
  // Bottom sheet data
  confirmedParticipants: Participant[];
  unconfirmedParticipants: Participant[];
  confirmedLoading: boolean;
  unconfirmedLoading: boolean;
  confirmedHasMore: boolean;
  unconfirmedHasMore: boolean;
  loadConfirmedParticipants: (_eventId: string) => Promise<void>;
  loadUnconfirmedParticipants: (_eventId: string) => Promise<void>;

  // Convenience handlers that use current event
  handleLoadMoreConfirmed: () => Promise<void>;
  handleLoadMoreUnconfirmed: () => Promise<void>;

  // Shared state
  error: string | null;
  clearError: () => void;

  // Participant management
  deleteParticipant: (_participantUserId: string) => Promise<void>;
  toggleParticipation: (_userId: string) => Promise<void>;
  addParticipant: (
    _userId: string,
    _participantUser: {
      id: string;
      username: string;
      profileThumbnailPath: string | null;
      profileThumbnailUrl: string | null;
    }
  ) => Promise<void>;
}

const EventParticipantsContext = createContext<EventParticipantsContextType>({
  confirmedParticipants: [],
  unconfirmedParticipants: [],
  confirmedLoading: false,
  unconfirmedLoading: false,
  confirmedHasMore: true,
  unconfirmedHasMore: true,
  loadConfirmedParticipants: async () => {},
  loadUnconfirmedParticipants: async () => {},
  handleLoadMoreConfirmed: async () => {},
  handleLoadMoreUnconfirmed: async () => {},
  error: null,
  clearError: () => {},
  deleteParticipant: async () => {},
  toggleParticipation: async () => {},
  addParticipant: async () => {},
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
  const [error, setError] = useState<string | null>(null);

  // Helper function to sort participants alphabetically by username
  const sortParticipantsAlphabetically = useCallback(
    (participants: Participant[]) => {
      return [...participants].sort((a, b) =>
        a.user.username.localeCompare(b.user.username)
      );
    },
    []
  );

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
          setParticipants(sortParticipantsAlphabetically(data.participants));
        } else {
          setParticipants((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newParticipants = data.participants.filter(
              (p: Participant) => !existingIds.has(p.id)
            );
            return sortParticipantsAlphabetically([
              ...prev,
              ...newParticipants,
            ]);
          });
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (err) {
        log.error("Error loading participants:", err);
        setError("Failed to load participants");
      } finally {
        setLoading(false);
      }
    },
    [user?.id, sortParticipantsAlphabetically]
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
  const loadMoreConfirmedParticipants = useCallback(
    async (eventId: string) => {
      if (confirmedHasMore && !confirmedLoading) {
        await loadParticipantsPage(
          eventId,
          confirmedPage + 1,
          true,
          setConfirmedParticipants,
          setConfirmedHasMore,
          setConfirmedPage,
          setConfirmedLoading
        );
      }
    },
    [confirmedHasMore, confirmedLoading, confirmedPage, loadParticipantsPage]
  );

  const loadMoreUnconfirmedParticipants = useCallback(
    async (eventId: string) => {
      if (unconfirmedHasMore && !unconfirmedLoading) {
        await loadParticipantsPage(
          eventId,
          unconfirmedPage + 1,
          false,
          setUnconfirmedParticipants,
          setUnconfirmedHasMore,
          setUnconfirmedPage,
          setUnconfirmedLoading
        );
      }
    },
    [
      unconfirmedHasMore,
      unconfirmedLoading,
      unconfirmedPage,
      loadParticipantsPage,
    ]
  );

  // Convenience handlers that use current event
  const handleLoadMoreConfirmed = useCallback(async () => {
    if (event?.id) {
      await loadMoreConfirmedParticipants(event.id);
    }
  }, [event?.id, loadMoreConfirmedParticipants]);

  const handleLoadMoreUnconfirmed = useCallback(async () => {
    if (event?.id) {
      await loadMoreUnconfirmedParticipants(event.id);
    }
  }, [event?.id, loadMoreUnconfirmedParticipants]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Toggle participation status
  const toggleParticipation = useCallback(
    async (userId: string) => {
      if (!event || !user) return;

      // Find current participant status in both lists
      const confirmedParticipant = confirmedParticipants.find(
        (p) => p.user.id === userId
      );
      const unconfirmedParticipant = unconfirmedParticipants.find(
        (p) => p.user.id === userId
      );

      const currentParticipant = confirmedParticipant || unconfirmedParticipant;
      if (!currentParticipant) return;

      const newConfirmedStatus = !currentParticipant.confirmed;

      // Optimistically update local state
      if (newConfirmedStatus) {
        // Moving from unconfirmed to confirmed
        setUnconfirmedParticipants((prev) =>
          prev.filter((p) => p.user.id !== userId)
        );
        setConfirmedParticipants((prev) =>
          sortParticipantsAlphabetically([
            { ...currentParticipant, confirmed: true },
            ...prev,
          ])
        );
      } else {
        // Moving from confirmed to unconfirmed
        setConfirmedParticipants((prev) =>
          prev.filter((p) => p.user.id !== userId)
        );
        setUnconfirmedParticipants((prev) =>
          sortParticipantsAlphabetically([
            { ...currentParticipant, confirmed: false },
            ...prev,
          ])
        );
      }

      setEvent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentUserConfirmed: newConfirmedStatus,
        };
      });

      try {
        await eventsApi.updateParticipantConfirmation(
          event.id,
          userId,
          newConfirmedStatus
        );
      } catch (error) {
        // Revert the change on error
        if (newConfirmedStatus) {
          setConfirmedParticipants((prev) =>
            prev.filter((p) => p.user.id !== userId)
          );
          setUnconfirmedParticipants((prev) =>
            sortParticipantsAlphabetically([
              { ...currentParticipant, confirmed: false },
              ...prev,
            ])
          );
        } else {
          setUnconfirmedParticipants((prev) =>
            prev.filter((p) => p.user.id !== userId)
          );
          setConfirmedParticipants((prev) =>
            sortParticipantsAlphabetically([
              { ...currentParticipant, confirmed: true },
              ...prev,
            ])
          );
        }

        setEvent((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentUserConfirmed: !newConfirmedStatus,
          };
        });

        setError("Failed to update participation status");
        throw error;
      }
    },
    [
      event,
      user,
      confirmedParticipants,
      unconfirmedParticipants,
      sortParticipantsAlphabetically,
    ]
  );

  // Add new participant
  const addParticipant = useCallback(
    async (
      userId: string,
      participantUser: {
        id: string;
        username: string;
        profileThumbnailPath: string | null;
        profileThumbnailUrl: string | null;
      }
    ) => {
      if (!event || !user) return;

      const newParticipant: Participant = {
        id: participantUser.id,
        joinedAt: new Date(),
        confirmed: false,
        user: participantUser,
      };

      // Optimistically add to unconfirmed list
      setUnconfirmedParticipants((prev) =>
        sortParticipantsAlphabetically([newParticipant, ...prev])
      );

      try {
        await eventsApi.addParticipant(event.id, participantUser.id, user.id);
      } catch (error) {
        // Revert on error
        setUnconfirmedParticipants((prev) =>
          prev.filter((p) => p.user.id !== participantUser.id)
        );
        setError("Failed to add participant");
        throw error;
      }
    },
    [event, user, setEvent, sortParticipantsAlphabetically]
  );

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
      } catch (error) {
        // Don't update UI, just show error
        setError("Failed to delete participant. Please try again.");
        throw error; // Re-throw so component can handle it
      }
    },
    [event, user, setEvent]
  );

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

  useEffect(() => {
    if (event?.id) {
      loadBothParticipants(event.id);
    }
  }, [event?.id, loadBothParticipants]);

  const contextValue = useMemo(
    () => ({
      confirmedParticipants,
      unconfirmedParticipants,
      confirmedLoading,
      unconfirmedLoading,
      confirmedHasMore,
      unconfirmedHasMore,
      loadConfirmedParticipants,
      loadUnconfirmedParticipants,
      handleLoadMoreConfirmed,
      handleLoadMoreUnconfirmed,
      error,
      clearError,
      deleteParticipant,
      toggleParticipation,
      addParticipant,
    }),
    [
      confirmedParticipants,
      unconfirmedParticipants,
      confirmedLoading,
      unconfirmedLoading,
      confirmedHasMore,
      unconfirmedHasMore,
      loadConfirmedParticipants,
      loadUnconfirmedParticipants,
      handleLoadMoreConfirmed,
      handleLoadMoreUnconfirmed,
      error,
      clearError,
      deleteParticipant,
      toggleParticipation,
      addParticipant,
    ]
  );

  return (
    <EventParticipantsContext.Provider value={contextValue}>
      {children}
    </EventParticipantsContext.Provider>
  );
}
