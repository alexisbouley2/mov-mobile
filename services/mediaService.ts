import * as FileSystem from "expo-file-system";
import { ThumbnailGenerator } from "./ThumbnailGenerator";
import { config } from "@/lib/config";

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

interface PresignedUrlResponse {
  uploadUrl: string;
  fileName: string;
  expiresIn: number;
}

interface ThumbnailUploadResponse {
  uploadUrl: string;
  fileName: string;
  expiresIn: number;
}

interface UploadConfirmResponse {
  success: boolean;
  video: {
    id: string;
    storagePath: string;
    thumbnailPath: string;
    userId: string;
    createdAt: string;
  };
  message: string;
}

export class MediaService {
  /**
   * Generate thumbnail from video file with smart extraction
   */
  static async generateThumbnail(videoUri: string): Promise<string> {
    return ThumbnailGenerator.generateThumbnail(videoUri, {
      quality: 0.8, // Good balance between quality and file size
    });
  }

  /**
   * Step 1: Get upload URLs for both video and thumbnail
   */
  static async getUploadUrls(userId: string): Promise<{
    video: PresignedUrlResponse;
    thumbnail: ThumbnailUploadResponse;
  }> {
    try {
      console.log("userId", userId);
      console.log("Requesting presigned URLs from backend...");

      const videoResponse = await fetch(
        `${API_BASE_URL}/videos/upload-url?userId=${userId}&size=full`
      );

      if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        throw new Error(
          `Failed to get video upload URL: ${videoResponse.status} - ${errorText}`
        );
      }
      const videoData = await videoResponse.json();

      // Get thumbnail upload URL
      const thumbnailResponse = await fetch(
        `${API_BASE_URL}/videos/upload-url?userId=${userId}&size=thumbnail`
      );

      if (!thumbnailResponse.ok) {
        const errorText = await thumbnailResponse.text();
        throw new Error(
          `Failed to get thumbnail upload URL: ${thumbnailResponse.status} - ${errorText}`
        );
      }

      const thumbnailData = await thumbnailResponse.json();

      console.log("Received presigned URLs for video and thumbnail");

      return {
        video: videoData,
        thumbnail: thumbnailData,
      };
    } catch (error) {
      console.error("Error getting upload URLs:", error);
      throw error;
    }
  }

  /**
   * Step 2: Upload file to R2 with presigned URL
   */
  static async uploadToR2(
    fileUri: string,
    uploadUrl: string,
    contentType: string,
    onProgress?: (_progress: number) => void
  ): Promise<void> {
    try {
      console.log(`Starting upload to R2: ${contentType}`);

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      console.log("File info:", {
        exists: fileInfo.exists,
        size: fileInfo.size,
        uri: fileUri,
      });

      // Read file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      console.log("File blob created, size:", blob.size);

      // Upload to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": contentType,
        },
      });

      console.log("R2 upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `R2 upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      onProgress?.(100);
      console.log(`Upload to R2 successful for ${contentType}!`);
    } catch (error) {
      console.error("Error uploading to R2:", error);
      throw error;
    }
  }

  /**
   * Step 3: Confirm upload with both video and thumbnail paths
   */
  static async confirmUpload(
    videoFileName: string,
    thumbnailFileName: string,
    userId: string
  ): Promise<UploadConfirmResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/confirm-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoFileName: videoFileName,
          thumbnailFileName,
          userId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to confirm upload: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Upload confirmed:", data.video.id);

      return data;
    } catch (error) {
      console.error("Error confirming upload:", error);
      throw error;
    }
  }

  /**
   * Main upload method that handles both video and thumbnail
   */
  static async uploadVideo(
    videoUri: string,
    userId: string,
    onProgress?: (_progress: number) => void
  ): Promise<UploadConfirmResponse> {
    try {
      console.log("=== Starting video upload flow with thumbnail ===");

      // Step 1: Generate thumbnail
      onProgress?.(5);
      const thumbnailUri = await this.generateThumbnail(videoUri);

      // Step 2: Get presigned URLs for both video and thumbnail
      onProgress?.(10);
      const { video: videoUpload, thumbnail: thumbnailUpload } =
        await this.getUploadUrls(userId);

      // Step 3: Upload video to R2
      onProgress?.(20);
      await this.uploadToR2(
        videoUri,
        videoUpload.uploadUrl,
        "video/mp4",
        (progress) => {
          // Map video progress to 20% -> 60%
          const mappedProgress = 20 + progress * 0.4;
          onProgress?.(mappedProgress);
        }
      );

      // Step 4: Upload thumbnail to R2
      onProgress?.(60);
      await this.uploadToR2(
        thumbnailUri,
        thumbnailUpload.uploadUrl,
        "image/jpeg",
        (progress) => {
          // Map thumbnail progress to 60% -> 80%
          const mappedProgress = 60 + progress * 0.2;
          onProgress?.(mappedProgress);
        }
      );

      // Step 5: Confirm upload with backend
      onProgress?.(90);
      const result = await this.confirmUpload(
        videoUpload.fileName,
        thumbnailUpload.fileName,
        userId
      );

      onProgress?.(100);
      console.log("=== Video upload flow with thumbnail completed ===");

      return result;
    } catch (error) {
      console.error("=== Video upload flow failed ===", error);
      throw error;
    }
  }
}
