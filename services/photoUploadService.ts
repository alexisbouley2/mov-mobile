import * as FileSystem from "expo-file-system";
import { config } from "@/lib/config";

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

export interface UploadUrls {
  urls: Array<{
    uploadUrl: string;
    fileName: string;
    type: "thumbnail" | "full";
  }>;
}

export interface PhotoUploadResult {
  thumbnailPath: string;
  fullPath: string;
}

export class PhotoUploadService {
  /**
   * Get presigned upload URLs from backend
   */
  static async getUploadUrls(
    userId: string,
    entityType: "user" | "event"
  ): Promise<UploadUrls> {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/upload-urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          entityType,
          count: 2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get upload URLs: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting upload URLs:", error);
      throw error;
    }
  }

  /**
   * Upload file directly to R2 using presigned URL
   */
  static async uploadToR2(
    fileUri: string,
    uploadUrl: string,
    onProgress?: (_progress: number) => void
  ): Promise<void> {
    try {
      console.log("Starting upload to R2");

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      // Read file as blob
      const response = await fetch(fileUri);
      const blob = await response.blob();

      console.log("File blob created, size:", blob.size);

      // Upload to R2
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `R2 upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      onProgress?.(100);
      console.log("Upload to R2 successful!");
    } catch (error) {
      console.error("Error uploading to R2:", error);
      throw error;
    }
  }

  /**
   * Upload both thumbnail and full size photos
   */
  static async uploadPhotos(
    thumbnailUri: string,
    fullUri: string,
    userId: string,
    entityType: "user" | "event",
    onProgress?: (_progress: number) => void
  ): Promise<PhotoUploadResult> {
    try {
      console.log("=== Starting photo upload flow ===");

      // Step 1: Get upload URLs
      onProgress?.(10);
      const { urls } = await this.getUploadUrls(userId, entityType);

      const thumbnailUrl = urls.find((u) => u.type === "thumbnail");
      const fullUrl = urls.find((u) => u.type === "full");

      if (!thumbnailUrl || !fullUrl) {
        throw new Error("Failed to get required upload URLs");
      }

      // Step 2: Upload thumbnail
      onProgress?.(20);
      await this.uploadToR2(
        thumbnailUri,
        thumbnailUrl.uploadUrl,
        (progress) => {
          // Map thumbnail progress to 20% -> 60%
          const mappedProgress = 20 + progress * 0.4;
          onProgress?.(mappedProgress);
        }
      );

      // Step 3: Upload full size
      onProgress?.(60);
      await this.uploadToR2(fullUri, fullUrl.uploadUrl, (progress) => {
        // Map full size progress to 60% -> 100%
        const mappedProgress = 60 + progress * 0.4;
        onProgress?.(mappedProgress);
      });

      onProgress?.(100);
      console.log("=== Photo upload flow completed ===");

      return {
        thumbnailPath: thumbnailUrl.fileName,
        fullPath: fullUrl.fileName,
      };
    } catch (error) {
      console.error("=== Photo upload flow failed ===", error);
      throw error;
    }
  }
}
