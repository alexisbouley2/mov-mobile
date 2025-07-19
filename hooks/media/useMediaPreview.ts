// hooks/media/useMediaPreview.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { mediaUploadManager } from "@/services/upload";
import { useUserEvents } from "@/contexts/UserEventsContext";
import log from "@/utils/logger";

interface UseMediaPreviewProps {
  mediaUri?: string;
  userId: string;
  isProcessing?: boolean;
}

export function useMediaPreview({
  mediaUri,
  userId,
  isProcessing = false,
}: UseMediaPreviewProps) {
  const router = useRouter();
  const { events } = useUserEvents();
  const params = useLocalSearchParams();

  // Get mediaUri from params if not provided directly
  const videoUri = mediaUri || (params.mediaUri as string);

  const [paused, setPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef<any>(null);

  // If processing, wait for the video URI from navigation params
  useEffect(() => {
    if (isProcessing && params.mediaUri) {
      log.info("Video URI received from recording:", params.mediaUri);
      setRetryCount((prev) => prev + 1); // Force reload with new URI
    }
  }, [params.mediaUri, isProcessing]);

  // Auto-play video when screen focuses and video is ready
  useFocusEffect(
    useCallback(() => {
      if (videoReady) {
        setPaused(false);
      }

      return () => {
        setPaused(true);
      };
    }, [videoReady])
  );

  // Handle video load success
  const handleVideoLoad = useCallback(() => {
    log.info("Video loaded successfully");
    setVideoReady(true);
    setPaused(false);
  }, []);

  // Handle video load error with retry
  const handleVideoError = useCallback(
    (_error: any) => {
      if (!videoUri || videoUri === "undefined") {
        // Still waiting for video URI from recording
        return;
      }

      log.warn("Video not ready yet, retrying...");

      if (retryCount < 30) {
        // Max 3 seconds of retries
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 100);
      } else {
        log.error("Video failed to load after maximum retries");
        Alert.alert("Error", "Failed to load video. Please try again.");
      }
    },
    [retryCount, videoUri]
  );

  // Handle send button
  const handleSend = useCallback(async () => {
    if (!videoUri || videoUri === "undefined") {
      Alert.alert("Error", "Video not ready yet. Please wait.");
      return;
    }

    try {
      log.info("Creating upload job for video");

      // Pause video before navigation
      setPaused(true);

      // Create upload job
      const jobId = mediaUploadManager.createJob(videoUri, userId, "video", {
        quality: 0.8,
        time: 1000,
      });

      // Start upload in background
      mediaUploadManager.startUpload(jobId, (progress) => {
        log.debug(`Upload progress: ${progress}%`);
      });

      // Navigate based on available events
      const currentEvents = events.current || [];

      if (currentEvents.length === 0) {
        router.push({
          pathname: "/(app)/(events)/create",
          params: { jobId },
        });
      } else {
        router.push({
          pathname: "/(app)/(events)/select-events",
          params: { jobId },
        });
      }
    } catch (error) {
      log.error("Failed to create upload job:", error);
      Alert.alert("Error", "Failed to process video. Please try again.");
    }
  }, [videoUri, userId, events, router]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setPaused(true);
    router.back();
  }, [router]);

  return {
    videoRef,
    videoUri: videoUri || (params.mediaUri as string),
    paused,
    videoReady,
    retryCount,
    handleVideoLoad,
    handleVideoError,
    handleSend,
    handleDismiss,
  };
}
