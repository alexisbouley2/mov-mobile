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
import { videoCacheService } from "@/services/videoCacheService";

export interface VideoItem {
  id: string;
  videoPath: string;
  thumbnailPath: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    photo: string | null;
    profileThumbnailUrl: string | null;
  };
}

export interface VideoFeedResponse {
  success: boolean;
  videos: VideoItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface EventVideosContextType {
  // Video data for both tabs
  allVideos: VideoItem[];
  userVideos: VideoItem[];

  // Loading states
  allVideosLoading: boolean;
  userVideosLoading: boolean;
  allVideosLoadingMore: boolean;
  userVideosLoadingMore: boolean;

  // Pagination states
  allVideosHasMore: boolean;
  userVideosHasMore: boolean;
  allVideosNextCursor: string | null;
  userVideosNextCursor: string | null;

  // Modal states
  modalVisible: boolean;
  currentVideoIndex: number;
  activeTab: "all" | "you";

  // Methods
  setActiveTab: (_tab: "all" | "you") => void;
  loadAllVideos: (_eventId: string) => Promise<void>;
  loadUserVideos: (_eventId: string, _userId: string) => Promise<void>;
  loadMoreAllVideos: () => Promise<void>;
  loadMoreUserVideos: () => Promise<void>;
  refreshAllVideos: () => Promise<void>;
  refreshUserVideos: () => Promise<void>;

  // Modal methods
  openVideoModal: (_index: number, _tab: "all" | "you") => void;
  closeVideoModal: () => void;
  setCurrentVideoIndex: (_index: number) => void;

  // Error states
  error: string | null;
  clearError: () => void;
}

const EventVideosContext = createContext<EventVideosContextType>({
  allVideos: [],
  userVideos: [],
  allVideosLoading: false,
  userVideosLoading: false,
  allVideosLoadingMore: false,
  userVideosLoadingMore: false,
  allVideosHasMore: true,
  userVideosHasMore: true,
  allVideosNextCursor: null,
  userVideosNextCursor: null,
  modalVisible: false,
  currentVideoIndex: 0,
  activeTab: "all",
  setActiveTab: () => {},
  loadAllVideos: async () => {},
  loadUserVideos: async () => {},
  loadMoreAllVideos: async () => {},
  loadMoreUserVideos: async () => {},
  refreshAllVideos: async () => {},
  refreshUserVideos: async () => {},
  openVideoModal: () => {},
  closeVideoModal: () => {},
  setCurrentVideoIndex: () => {},
  error: null,
  clearError: () => {},
});

export const useEventVideos = () => useContext(EventVideosContext);

export function EventVideosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserProfile();
  const { event } = useEvent();

  // Video data states
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [userVideos, setUserVideos] = useState<VideoItem[]>([]);

  // Loading states
  const [allVideosLoading, setAllVideosLoading] = useState(false);
  const [userVideosLoading, setUserVideosLoading] = useState(false);
  const [allVideosLoadingMore, setAllVideosLoadingMore] = useState(false);
  const [userVideosLoadingMore, setUserVideosLoadingMore] = useState(false);

  // Pagination states
  const [allVideosHasMore, setAllVideosHasMore] = useState(true);
  const [userVideosHasMore, setUserVideosHasMore] = useState(true);
  const [allVideosNextCursor, setAllVideosNextCursor] = useState<string | null>(
    null
  );
  const [userVideosNextCursor, setUserVideosNextCursor] = useState<
    string | null
  >(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "you">("all");

  // Error state
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

  // Generic fetch function
  const fetchVideos = useCallback(
    async (
      eventId: string,
      cursor?: string,
      userId?: string
    ): Promise<VideoFeedResponse> => {
      const params = new URLSearchParams({
        limit: "20",
        ...(cursor && { cursor }),
        ...(userId && { userId }),
      });

      const response = await fetch(
        `${API_BASE_URL}/videos/feed/${eventId}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      return response.json();
    },
    [API_BASE_URL]
  );

  // Load all videos
  const loadAllVideos = useCallback(
    async (eventId: string) => {
      if (!eventId) return;

      try {
        setAllVideosLoading(true);
        setError(null);

        const data = await fetchVideos(eventId);
        setAllVideos(data.videos);
        setAllVideosNextCursor(data.nextCursor);
        setAllVideosHasMore(data.hasMore);

        // Start preloading first few videos
        if (data.videos.length > 0) {
          videoCacheService.preloadVideosAround(data.videos, 0);
        }
      } catch (err) {
        log.error("Error loading all videos:", err);
        setError("Failed to load videos");
      } finally {
        setAllVideosLoading(false);
      }
    },
    [fetchVideos]
  );

  // Load user videos
  const loadUserVideos = useCallback(
    async (eventId: string, userId: string) => {
      if (!eventId || !userId) return;

      try {
        setUserVideosLoading(true);
        setError(null);

        const data = await fetchVideos(eventId, undefined, userId);
        setUserVideos(data.videos);
        setUserVideosNextCursor(data.nextCursor);
        setUserVideosHasMore(data.hasMore);

        // Start preloading first few videos
        if (data.videos.length > 0) {
          videoCacheService.preloadVideosAround(data.videos, 0);
        }
      } catch (err) {
        log.error("Error loading user videos:", err);
        setError("Failed to load your videos");
      } finally {
        setUserVideosLoading(false);
      }
    },
    [fetchVideos]
  );

  // Load more functions (simplified)
  const loadMoreAllVideos = useCallback(async () => {
    if (
      !event?.id ||
      allVideosLoadingMore ||
      !allVideosHasMore ||
      !allVideosNextCursor
    )
      return;

    try {
      setAllVideosLoadingMore(true);
      const data = await fetchVideos(event.id, allVideosNextCursor);
      setAllVideos((prev) => [...prev, ...data.videos]);
      setAllVideosNextCursor(data.nextCursor);
      setAllVideosHasMore(data.hasMore);
    } catch (err) {
      log.error("Error loading more all videos:", err);
    } finally {
      setAllVideosLoadingMore(false);
    }
  }, [
    event?.id,
    allVideosLoadingMore,
    allVideosHasMore,
    allVideosNextCursor,
    fetchVideos,
  ]);

  const loadMoreUserVideos = useCallback(async () => {
    if (
      !event?.id ||
      !user?.id ||
      userVideosLoadingMore ||
      !userVideosHasMore ||
      !userVideosNextCursor
    )
      return;

    try {
      setUserVideosLoadingMore(true);
      const data = await fetchVideos(event.id, userVideosNextCursor, user.id);
      setUserVideos((prev) => [...prev, ...data.videos]);
      setUserVideosNextCursor(data.nextCursor);
      setUserVideosHasMore(data.hasMore);
    } catch (err) {
      log.error("Error loading more user videos:", err);
    } finally {
      setUserVideosLoadingMore(false);
    }
  }, [
    event?.id,
    user?.id,
    userVideosLoadingMore,
    userVideosHasMore,
    userVideosNextCursor,
    fetchVideos,
  ]);

  // Refresh functions
  const refreshAllVideos = useCallback(async () => {
    if (event?.id) {
      setAllVideosNextCursor(null);
      setAllVideosHasMore(true);
      await loadAllVideos(event.id);
    }
  }, [event?.id, loadAllVideos]);

  const refreshUserVideos = useCallback(async () => {
    if (event?.id && user?.id) {
      setUserVideosNextCursor(null);
      setUserVideosHasMore(true);
      await loadUserVideos(event.id, user.id);
    }
  }, [event?.id, user?.id, loadUserVideos]);

  // Modal management
  const openVideoModal = useCallback(
    (index: number, tab: "all" | "you") => {
      setCurrentVideoIndex(index);
      setActiveTab(tab);
      setModalVisible(true);

      // Start preloading videos around the opened index
      const videos = tab === "all" ? allVideos : userVideos;
      videoCacheService.preloadVideosAround(videos, index);
    },
    [allVideos, userVideos]
  );

  const closeVideoModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const updateCurrentVideoIndex = useCallback(
    (index: number) => {
      setCurrentVideoIndex(index);

      // Preload videos around new position
      const videos = activeTab === "all" ? allVideos : userVideos;
      videoCacheService.preloadVideosAround(videos, index);
    },
    [activeTab, allVideos, userVideos]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load videos when event changes
  useEffect(() => {
    if (event?.id) {
      loadAllVideos(event.id);
      if (user?.id) {
        loadUserVideos(event.id, user.id);
      }
    }
  }, [event?.id, user?.id, loadAllVideos, loadUserVideos]);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      videoCacheService.clearCache();
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      allVideos,
      userVideos,
      allVideosLoading,
      userVideosLoading,
      allVideosLoadingMore,
      userVideosLoadingMore,
      allVideosHasMore,
      userVideosHasMore,
      allVideosNextCursor,
      userVideosNextCursor,
      modalVisible,
      currentVideoIndex,
      activeTab,
      setActiveTab,
      loadAllVideos,
      loadUserVideos,
      loadMoreAllVideos,
      loadMoreUserVideos,
      refreshAllVideos,
      refreshUserVideos,
      openVideoModal,
      closeVideoModal,
      setCurrentVideoIndex: updateCurrentVideoIndex,
      error,
      clearError,
    }),
    [
      allVideos,
      userVideos,
      allVideosLoading,
      userVideosLoading,
      allVideosLoadingMore,
      userVideosLoadingMore,
      allVideosHasMore,
      userVideosHasMore,
      allVideosNextCursor,
      userVideosNextCursor,
      modalVisible,
      currentVideoIndex,
      activeTab,
      setActiveTab,
      loadAllVideos,
      loadUserVideos,
      loadMoreAllVideos,
      loadMoreUserVideos,
      refreshAllVideos,
      refreshUserVideos,
      openVideoModal,
      closeVideoModal,
      updateCurrentVideoIndex,
      error,
      clearError,
    ]
  );

  return (
    <EventVideosContext.Provider value={contextValue}>
      {children}
    </EventVideosContext.Provider>
  );
}
