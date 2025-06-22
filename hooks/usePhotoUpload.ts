import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { mediaUploadManager } from "@/services/upload";
import { useUploadStatus } from "@/hooks/useUploadStatus";
import { UploadType } from "@/services/upload/types";
import log from "@/utils/logger";

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

  const pickImage = async () => {
    console.log("in pickImage");
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need camera roll permissions to select photos"
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

          console.log("jobId", jobId);

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
  };

  const getPhotoData = () => {
    console.log("currentJobId", currentJobId);
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
  };

  const isUploadComplete = () => {
    if (!currentJobId) return true; // No upload in progress
    return mediaUploadManager.isJobReady(currentJobId);
  };

  const waitForUpload = async (timeoutMs: number = 30000) => {
    if (!currentJobId) return;

    try {
      await waitForCompletion(timeoutMs);
    } catch (error) {
      log.error("Upload wait failed:", error);
      throw error;
    }
  };

  const cleanup = () => {
    if (currentJobId) {
      mediaUploadManager.cleanupJob(currentJobId);
      setCurrentJobId(null);
    }
  };

  const cancelJob = () => {
    if (currentJobId) {
      mediaUploadManager.cancelJob(currentJobId);
      setCurrentJobId(null);
    }
  };

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
