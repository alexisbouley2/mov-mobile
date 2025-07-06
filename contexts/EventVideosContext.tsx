import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Alert } from "react-native";
import { videosApi } from "@/services/api";
import log from "@/utils/logger";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/EventContext";
import { videoCacheService } from "@/services/videoCacheService";
import { VideoFeedResponse, VideoWithUrls } from "@movapp/types";

// Use the VideoWithUrls type from the API instead of defining our own
export type VideoItem = VideoWithUrls;

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

  // Video actions
  reportVideo: (_videoId: string) => Promise<void>;
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
  reportVideo: async () => {},
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

  // Load all videos
  const loadAllVideos = useCallback(async (eventId: string) => {
    if (!eventId) return;

    try {
      setAllVideosLoading(true);
      setError(null);

      const data: VideoFeedResponse = await videosApi.getEventVideoFeed(
        eventId,
        undefined,
        20
      );

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
  }, []);

  // Load user videos
  const loadUserVideos = useCallback(
    async (eventId: string, userId: string) => {
      if (!eventId || !userId) return;

      try {
        setUserVideosLoading(true);
        setError(null);

        const data: VideoFeedResponse = await videosApi.getEventVideoFeed(
          eventId,
          undefined,
          20,
          userId
        );

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
    []
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
      const data: VideoFeedResponse = await videosApi.getEventVideoFeed(
        event.id,
        allVideosNextCursor,
        20
      );
      setAllVideos((prev) => [...prev, ...data.videos]);
      setAllVideosNextCursor(data.nextCursor);
      setAllVideosHasMore(data.hasMore);
    } catch (err) {
      log.error("Error loading more all videos:", err);
    } finally {
      setAllVideosLoadingMore(false);
    }
  }, [event?.id, allVideosLoadingMore, allVideosHasMore, allVideosNextCursor]);

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
      const data: VideoFeedResponse = await videosApi.getEventVideoFeed(
        event.id,
        userVideosNextCursor,
        20,
        user.id
      );
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

  // Report video functionality
  const reportVideo = useCallback(
    async (videoId: string) => {
      if (!event?.id || !user?.id) {
        setError("Unable to report video: missing event or user data");
        return;
      }

      Alert.alert(
        "Report Video",
        "Are you sure you want to report this video? It will be removed from this event permanently.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Report",
            style: "destructive",
            onPress: async () => {
              try {
                await videosApi.reportVideo({
                  videoId,
                  userId: user.id,
                  eventId: event.id,
                });

                // Remove the video from both feeds
                setAllVideos((prev) =>
                  prev.filter((video) => video.id !== videoId)
                );
                setUserVideos((prev) =>
                  prev.filter((video) => video.id !== videoId)
                );

                // Close modal since user was viewing the reported video
                if (modalVisible) {
                  closeVideoModal();
                }
              } catch (error) {
                log.error("Error reporting video:", error);
                setError("Failed to report video. Please try again.");
              }
            },
          },
        ]
      );
    },
    [event?.id, user?.id, modalVisible, closeVideoModal]
  );

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
      reportVideo,
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
      reportVideo,
    ]
  );

  return (
    <EventVideosContext.Provider value={contextValue}>
      {children}
    </EventVideosContext.Provider>
  );
}
