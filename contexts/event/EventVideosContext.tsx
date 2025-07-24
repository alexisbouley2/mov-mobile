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
import { useEvent } from "@/contexts/event/EventContext";
import { videoCacheService } from "@/services/videoCacheService";
import { VideoFeedResponse, VideoWithUrls } from "@movapp/types";

// Use the VideoWithUrls type from the API instead of defining our own
export type VideoItem = VideoWithUrls;

interface EventVideosContextType {
  // Video data
  videos: VideoItem[];

  // Loading states
  loading: boolean;
  loadingMore: boolean;

  // Pagination states
  hasMore: boolean;
  nextCursor: string | null;

  // Modal states
  modalVisible: boolean;
  currentVideoIndex: number;

  // Methods
  loadVideos: (_eventId: string) => Promise<void>;
  loadMoreVideos: () => Promise<void>;
  refreshVideos: () => Promise<void>;

  // Modal methods
  openVideoModal: (_index: number) => void;
  closeVideoModal: () => void;
  setCurrentVideoIndex: (_index: number) => void;

  // Error states
  error: string | null;
  clearError: () => void;

  // Video actions
  reportVideo: (_videoId: string) => Promise<void>;
}

const EventVideosContext = createContext<EventVideosContextType>({
  videos: [],
  loading: false,
  loadingMore: false,
  hasMore: true,
  nextCursor: null,
  modalVisible: false,
  currentVideoIndex: 0,
  loadVideos: async () => {},
  loadMoreVideos: async () => {},
  refreshVideos: async () => {},
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
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Pagination states
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load videos
  const loadVideos = useCallback(async (eventId: string) => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const data: VideoFeedResponse = await videosApi.getEventVideoFeed(
        eventId,
        undefined,
        20
      );

      setVideos(data.videos);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);

      // Start preloading first few videos
      if (data.videos.length > 0) {
        videoCacheService.preloadVideosAround(data.videos, 0);
      }
    } catch (err) {
      log.error("Error loading videos:", err);
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more videos
  const loadMoreVideos = useCallback(async () => {
    if (!event?.id || loadingMore || !hasMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      const data: VideoFeedResponse = await videosApi.getEventVideoFeed(
        event.id,
        nextCursor,
        20
      );
      setVideos((prev) => [...prev, ...data.videos]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      log.error("Error loading more videos:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [event?.id, loadingMore, hasMore, nextCursor]);

  // Refresh videos
  const refreshVideos = useCallback(async () => {
    if (event?.id) {
      setNextCursor(null);
      setHasMore(true);
      await loadVideos(event.id);
    }
  }, [event?.id, loadVideos]);

  // Modal management
  const openVideoModal = useCallback(
    (index: number) => {
      setCurrentVideoIndex(index);
      setModalVisible(true);

      // Start preloading videos around the opened index
      videoCacheService.preloadVideosAround(videos, index);
    },
    [videos]
  );

  const closeVideoModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const updateCurrentVideoIndex = useCallback(
    (index: number) => {
      setCurrentVideoIndex(index);

      // Preload videos around new position
      videoCacheService.preloadVideosAround(videos, index);
    },
    [videos]
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

                // Remove the video from feed
                setVideos((prev) =>
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
      loadVideos(event.id);
    }
  }, [event?.id, loadVideos]);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      videoCacheService.clearCache();
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      videos,
      loading,
      loadingMore,
      hasMore,
      nextCursor,
      modalVisible,
      currentVideoIndex,
      loadVideos,
      loadMoreVideos,
      refreshVideos,
      openVideoModal,
      closeVideoModal,
      setCurrentVideoIndex: updateCurrentVideoIndex,
      error,
      clearError,
      reportVideo,
    }),
    [
      videos,
      loading,
      loadingMore,
      hasMore,
      nextCursor,
      modalVisible,
      currentVideoIndex,
      loadVideos,
      loadMoreVideos,
      refreshVideos,
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
