import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUserEvents } from "@/contexts/UserEventsContext";
import { mediaUploadManager, type UploadJob } from "@/services/upload";
import { videosApi } from "@/services/api";
import log from "@/utils/logger";
import { AssociateEventsRequest } from "@movapp/types";

interface UseSelectEventsProps {
  jobId: string;
}

export const useSelectEvents = ({ jobId }: UseSelectEventsProps) => {
  const router = useRouter();
  const { events } = useUserEvents();

  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(
    new Set()
  );
  const [includeCreateNew, setIncludeCreateNew] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [job, setJob] = useState(mediaUploadManager.getJob(jobId));

  // Subscribe to job updates
  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = mediaUploadManager.subscribe(
      jobId,
      (updatedJob: UploadJob) => {
        setJob(updatedJob);
      }
    );

    return unsubscribe;
  }, [jobId]);

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Toggle event selection
  const toggleEventSelection = (eventId: string) => {
    setSelectedEventIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Toggle create new event option
  const toggleCreateNew = () => {
    setIncludeCreateNew(!includeCreateNew);
  };

  // Associate video with events
  const associateVideoWithEvents = async (
    jobId: string,
    eventIds: string[]
  ) => {
    // Wait for job to complete if it's still uploading
    const job = await mediaUploadManager.waitForJob(jobId);

    if (!job.uploadResult?.videoPath) {
      throw new Error("Unable to associate video with events");
    }

    const associationData: AssociateEventsRequest = {
      fileName: job.uploadResult.videoPath,
      userId: job.userId,
      eventIds,
    };

    await videosApi.associateEvents(associationData);

    // Clean up the job
    mediaUploadManager.cleanupJob(jobId);
  };

  // Handle add button
  const handleAdd = async () => {
    if (selectedEventIds.size === 0 && !includeCreateNew) {
      Alert.alert("Error", "Please select at least one event");
      return;
    }

    setIsProcessing(true);

    try {
      // If creating new event, navigate there with job context
      if (includeCreateNew) {
        router.push({
          pathname: "/(app)/(events)/create",
          params: {
            jobId,
            selectedEventIds: Array.from(selectedEventIds).join(","),
          },
        });
        return;
      }

      // Otherwise, associate with selected events
      await associateVideoWithEvents(jobId, Array.from(selectedEventIds));

      Alert.alert("Success", "Video added to events!", [
        {
          text: "OK",
          onPress: () => router.push("/(app)/(tabs)/events"),
        },
      ]);
    } catch (error) {
      log.error("Failed to associate events:", error);
      Alert.alert("Error", "Failed to add video to events");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format time display
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `Started at ${hours}:${minutes}`;
    } else {
      return `Started ${Math.floor(diffHours / 24)}d ago`;
    }
  };

  // Filter current events (last 24h)
  const currentEvents = events.current || [];

  // Check if add button should be disabled
  const isAddButtonDisabled =
    (selectedEventIds.size === 0 && !includeCreateNew) || isProcessing;

  return {
    // State
    selectedEventIds,
    includeCreateNew,
    isProcessing,
    job,
    currentEvents,
    isAddButtonDisabled,

    // Actions
    handleBack,
    toggleEventSelection,
    toggleCreateNew,
    handleAdd,

    // Utilities
    formatEventTime,
  };
};
