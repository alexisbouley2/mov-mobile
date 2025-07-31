import { useState, useCallback } from "react";
import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { mediaUploadManager } from "@/services/upload";
import { useUploadStatus } from "@/hooks/upload/useUploadStatus";
import { UploadType } from "@/services/upload/types";
import log from "@/utils/logger";
import { useAuth } from "@/contexts/AuthContext";

interface UsePhotoUploadProps {
  initialImageUrl?: string | null;
  onImageChange?: (_imageUri: string | null) => void;
  uploadType: UploadType;
  aspectRatio?: [number, number];
  photoDataKey?: {
    imagePath: string;
    thumbnailPath: string;
  };
}

export function usePhotoUpload({
  initialImageUrl,
  onImageChange,
  uploadType,
  aspectRatio = [1, 1], // Default to square for profile photos
  photoDataKey = {
    imagePath: "imagePath",
    thumbnailPath: "thumbnailPath",
  },
}: UsePhotoUploadProps) {
  const { supabaseUser } = useAuth();
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialImageUrl || null
  );
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Use the upload status hook
  const { isUploading, progress, isComplete, error, waitForCompletion } =
    useUploadStatus({
      jobId: currentJobId,
    });

  const pickImage = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need camera roll permissions to select photos. Please enable it in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 1,
      });

      if (!result.canceled && result.assets[0] && supabaseUser) {
        const imageUri = result.assets[0].uri;

        // Check file size (limit: 20MB)
        try {
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          const maxSize = 20 * 1024 * 1024; // 20MB in bytes
          if (fileInfo.exists) {
            if (fileInfo.size > maxSize) {
              Alert.alert(
                "Image Too Large",
                "Please select an image smaller than 20MB.",
                [{ text: "OK" }]
              );
              return;
            }
          }
        } catch (error) {
          log.error("Failed to get file info for size check:", error);
          Alert.alert("Error", "Could not check image size. Please try again.");
          return;
        }

        setPreviewImage(imageUri);
        onImageChange?.(imageUri);

        try {
          // Create job immediately
          const jobId = mediaUploadManager.createJob(
            imageUri,
            supabaseUser.id,
            uploadType,
            {}
          );

          setCurrentJobId(jobId);

          // Start upload in background
          mediaUploadManager.startUpload(jobId, (progress) => {
            log.debug(`${uploadType} upload progress: ${progress}%`);
          });
        } catch (error) {
          Alert.alert("Error", "Failed to process image");
          log.error("Image processing error:", error);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      log.error("Image picker error:", error);
    }
  }, [aspectRatio, supabaseUser, uploadType, onImageChange]);

  const getPhotoData = useCallback(() => {
    if (!currentJobId) return undefined;

    try {
      const job = mediaUploadManager.getJob(currentJobId);
      if (job && job.status === "uploaded" && job.uploadResult) {
        return {
          [photoDataKey.imagePath]: job.uploadResult.imagePath,
          [photoDataKey.thumbnailPath]: job.uploadResult.thumbnailPath,
        };
      }
    } catch (error) {
      log.error("Failed to get photo data:", error);
    }
    return undefined;
  }, [currentJobId, photoDataKey]);

  const isUploadComplete = useCallback(() => {
    if (!currentJobId) return true; // No upload in progress
    return mediaUploadManager.isJobReady(currentJobId);
  }, [currentJobId]);

  const waitForUpload = useCallback(
    async (timeoutMs: number = 30000) => {
      if (!currentJobId) return;

      try {
        await waitForCompletion(timeoutMs);
      } catch (error) {
        log.error("Upload wait failed:", error);
        throw error;
      }
    },
    [currentJobId, waitForCompletion]
  );

  const cleanup = useCallback(() => {
    if (currentJobId) {
      mediaUploadManager.cleanupJob(currentJobId);
      setCurrentJobId(null);
    }
  }, [currentJobId]);

  const cancelJob = useCallback(async () => {
    if (currentJobId) {
      await mediaUploadManager.cancelJob(currentJobId);
      setCurrentJobId(null);
    }
  }, [currentJobId]);

  return {
    previewImage,
    currentJobId,
    isUploading,
    progress,
    isComplete,
    error,
    pickImage,
    getPhotoData,
    isUploadComplete,
    waitForUpload,
    cleanup,
    cancelJob,
  };
}
