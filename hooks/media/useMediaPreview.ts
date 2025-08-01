import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { mediaUploadManager } from "@/services/upload";
import { useUserEvents } from "@/contexts/UserEventsContext";
import log from "@/utils/logger";

interface UseMediaPreviewProps {
  jobId?: string;
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
  jobId,
}: UseMediaPreviewProps): UseMediaPreviewReturn => {
  const router = useRouter();
  const { events } = useUserEvents();
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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
