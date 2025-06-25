import React, { useState, useRef, useEffect } from "react";
import { Video } from "expo-av";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { mediaUploadManager } from "@/services/upload";
import log from "@/utils/logger";

interface UseMediaPreviewProps {
  mediaUri: string;
  userId: string;
}

export function useMediaPreview({ mediaUri, userId }: UseMediaPreviewProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  // Cleanup video when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  // Restart video when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      const restartVideo = async () => {
        if (videoRef.current) {
          try {
            await videoRef.current.playAsync();
          } catch (error) {
            log.debug("Failed to restart video:", error);
          }
        }
      };

      // Small delay to ensure video component is ready
      const timer = setTimeout(restartVideo, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  // Handle send button
  const handleSend = async () => {
    try {
      log.info("=== MediaPreview: Creating unified upload job ===");

      // Stop video before navigating
      if (videoRef.current) {
        await videoRef.current.pauseAsync();
      }

      // Create job immediately
      const newJobId = mediaUploadManager.createJob(mediaUri, userId, "video", {
        quality: 0.8,
        time: 1000,
      });

      setJobId(newJobId);

      // Start upload in background
      mediaUploadManager.startUpload(newJobId, (progress) => {
        log.debug(`Video upload progress: ${progress}%`);
      });

      // Navigate to event selection immediately
      router.push({
        pathname: "/(app)/(events)/select-events",
        params: { jobId: newJobId },
      });
    } catch (error) {
      log.error("=== MediaPreview: Failed to create job ===", error);
      Alert.alert("Error", "Failed to start upload. Please try again.");
    }
  };

  // Handle dismiss with job cleanup
  const handleDismiss = async () => {
    // Stop video before dismissing
    if (videoRef.current) {
      await videoRef.current.pauseAsync();
    }

    if (jobId) {
      try {
        mediaUploadManager.cancelJob(jobId);
        router.back();
      } catch (error) {
        log.error("Failed to cancel job:", error);
        router.back();
      }
    } else {
      router.back();
    }
  };

  return {
    jobId,
    videoRef,
    handleSend,
    handleDismiss,
  };
}
