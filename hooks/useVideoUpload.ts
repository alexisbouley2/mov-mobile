import { useState, useCallback } from "react";
import { MediaService } from "../services/mediaService";

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState<string>("");

  const uploadVideo = useCallback(async (videoUri: string, userId: string) => {
    console.log("=== useVideoUpload: Starting upload ===");

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep("Initializing...");

    try {
      const result = await MediaService.uploadVideo(
        videoUri,
        userId,
        (progress) => {
          setUploadProgress(progress);

          // Mettre à jour l'étape selon le progrès
          if (progress < 20) {
            setUploadStep("Getting upload URL...");
          } else if (progress < 80) {
            setUploadStep("Uploading to cloud...");
          } else if (progress < 100) {
            setUploadStep("Finalizing...");
          } else {
            setUploadStep("Complete!");
          }
        }
      );

      console.log("=== useVideoUpload: Upload successful ===");
      return result;
    } catch (error) {
      console.error("=== useVideoUpload: Upload failed ===", error);
      setUploadStep("Failed");
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStep("");
  }, []);

  return {
    uploadVideo,
    isUploading,
    uploadProgress,
    uploadStep,
    resetUpload,
  };
};
