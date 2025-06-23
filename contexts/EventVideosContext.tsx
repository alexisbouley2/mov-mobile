// contexts/EventVideosContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { config } from "@/lib/config";
import log from "@/utils/logger";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/EventContext";

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
  };
}

export interface VideoFeedResponse {
  success: boolean;
  videos: VideoItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface PreloadedVideo {
  id: string;
  videoUrl: string;
  isPreloaded: boolean;
  preloadPromise?: Promise<void>;
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

  // Preloading
  preloadedVideos: Map<string, PreloadedVideo>;

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
  preloadedVideos: new Map(),
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

  // Preloading state
  const [preloadedVideos, setPreloadedVideos] = useState<
    Map<string, PreloadedVideo>
  >(new Map());
  const preloadCache = useRef<Map<string, HTMLVideoElement>>(new Map());

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
      } catch (err) {
        log.error("Error loading user videos:", err);
        setError("Failed to load your videos");
      } finally {
        setUserVideosLoading(false);
      }
    },
    [fetchVideos]
  );

  // Load more all videos
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

  // Load more user videos
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

  // Video preloading functionality
  const preloadVideo = useCallback(async (video: VideoItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already preloaded
      if (preloadCache.current.has(video.id)) {
        resolve();
        return;
      }

      // Create video element for preloading
      const videoElement = document.createElement("video");
      videoElement.crossOrigin = "anonymous";
      videoElement.preload = "auto";
      videoElement.muted = true; // Required for autoplay policies

      const handleCanPlay = () => {
        preloadCache.current.set(video.id, videoElement);
        setPreloadedVideos(
          (prev) =>
            new Map(
              prev.set(video.id, {
                id: video.id,
                videoUrl: video.videoUrl,
                isPreloaded: true,
              })
            )
        );
        cleanup();
        resolve();
      };

      const handleError = () => {
        log.error(`Failed to preload video: ${video.id}`);
        cleanup();
        reject(new Error(`Failed to preload video: ${video.id}`));
      };

      const cleanup = () => {
        videoElement.removeEventListener("canplay", handleCanPlay);
        videoElement.removeEventListener("error", handleError);
      };

      videoElement.addEventListener("canplay", handleCanPlay);
      videoElement.addEventListener("error", handleError);

      // Start preloading
      videoElement.src = video.videoUrl;
      videoElement.load();

      // Track preloading state
      setPreloadedVideos(
        (prev) =>
          new Map(
            prev.set(video.id, {
              id: video.id,
              videoUrl: video.videoUrl,
              isPreloaded: false,
              preloadPromise: new Promise((res) => res()),
            })
          )
      );
    });
  }, []);

  // Preload adjacent videos when modal opens or current video changes
  const preloadAdjacentVideos = useCallback(
    (index: number, videos: VideoItem[]) => {
      const indicesToPreload = [];

      // Preload 2 before and 2 after
      for (
        let i = Math.max(0, index - 2);
        i <= Math.min(videos.length - 1, index + 2);
        i++
      ) {
        if (i !== index) {
          // Don't preload current video
          indicesToPreload.push(i);
        }
      }

      indicesToPreload.forEach((i) => {
        const video = videos[i];
        if (video && !preloadCache.current.has(video.id)) {
          preloadVideo(video).catch((err) => {
            log.error("Preload failed:", err);
          });
        }
      });
    },
    [preloadVideo]
  );

  // Cleanup old preloaded videos (keep only videos within range of current)
  const cleanupOldPreloads = useCallback(
    (currentIndex: number, videos: VideoItem[]) => {
      const keepRange = 5; // Keep videos within 5 positions
      // const currentTime = Date.now();

      preloadCache.current.forEach((videoElement, videoId) => {
        const videoIndex = videos.findIndex((v) => v.id === videoId);
        const shouldKeep =
          videoIndex >= 0 && Math.abs(videoIndex - currentIndex) <= keepRange;

        if (!shouldKeep) {
          // Remove from cache
          videoElement.src = "";
          videoElement.load();
          preloadCache.current.delete(videoId);

          // Remove from state
          setPreloadedVideos((prev) => {
            const newMap = new Map(prev);
            newMap.delete(videoId);
            return newMap;
          });
        }
      });
    },
    []
  );

  // Modal management
  const openVideoModal = useCallback(
    (index: number, tab: "all" | "you") => {
      setCurrentVideoIndex(index);
      setActiveTab(tab);
      setModalVisible(true);

      // Start preloading adjacent videos
      const videos = tab === "all" ? allVideos : userVideos;
      preloadAdjacentVideos(index, videos);
    },
    [allVideos, userVideos, preloadAdjacentVideos]
  );

  const closeVideoModal = useCallback(() => {
    setModalVisible(false);
    // Keep preloaded videos for potential reopening
  }, []);

  const updateCurrentVideoIndex = useCallback(
    (index: number) => {
      setCurrentVideoIndex(index);

      // Preload adjacent videos for new position
      const videos = activeTab === "all" ? allVideos : userVideos;
      preloadAdjacentVideos(index, videos);

      // Cleanup old preloads
      cleanupOldPreloads(index, videos);
    },
    [
      activeTab,
      allVideos,
      userVideos,
      preloadAdjacentVideos,
      cleanupOldPreloads,
    ]
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all preloaded videos
      preloadCache.current.forEach((videoElement) => {
        videoElement.src = "";
        videoElement.load();
      });
      preloadCache.current.clear();
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
      preloadedVideos,
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
      preloadedVideos,
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
