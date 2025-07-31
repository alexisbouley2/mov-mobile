import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { mediaUploadManager } from "@/services/upload";
import { useUserEvents } from "@/contexts/UserEventsContext";
import log from "@/utils/logger";

interface UseMediaPreviewProps {
  mediaUri: string;
  userId: string;
}

interface UseMediaPreviewReturn {
  videoRef: React.RefObject<any>;
  paused: boolean;
  isMuted: boolean;
  handleSend: () => Promise<void>;
  handleDismiss: () => void;
  handleMuteToggle: () => void;
}

export const useMediaPreview = ({
  mediaUri,
  userId,
}: UseMediaPreviewProps): UseMediaPreviewReturn => {
  const router = useRouter();
  const { events } = useUserEvents();
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // Create upload job immediately when component mounts
  useEffect(() => {
    try {
      log.info("Creating upload job for video");
      const newJobId = mediaUploadManager.createJob(mediaUri, userId, "video", {
        quality: 0.8,
        time: 1000,
      });

      // Start upload in background
      mediaUploadManager.startUpload(newJobId, (progress) => {
        log.debug(`Upload progress: ${progress}%`);
      });

      setJobId(newJobId);
    } catch (error) {
      log.error("Failed to create upload job:", error);
    }
  }, [mediaUri, userId]);

  // Auto-play when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      setPaused(false);
      return () => {
        setPaused(true);
      };
    }, [])
  );

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSend = async () => {
    try {
      if (!jobId) {
        log.error("No job ID available for upload");
        return;
      }

      // Pause video
      setPaused(true);

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
      log.error("Failed to start upload:", error);
    }
  };

  const handleDismiss = () => {
    setPaused(true);
    if (jobId) {
      mediaUploadManager.cancelJob(jobId);
    }
    router.back();
  };

  return {
    videoRef,
    paused,
    isMuted,
    handleSend,
    handleDismiss,
    handleMuteToggle,
  };
};
