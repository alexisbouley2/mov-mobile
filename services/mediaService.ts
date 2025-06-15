import * as FileSystem from "expo-file-system";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface PresignedUrlResponse {
  uploadUrl: string;
  fileName: string;
  expiresIn: number;
}

interface UploadConfirmResponse {
  success: boolean;
  video: {
    id: string;
    storagePath: string;
    userId: string;
    eventId: string;
    createdAt: string;
  };
  message: string;
}

export class MediaService {
  /**
   * Step 1: Demander une presigned URL au backend
   */
  static async getUploadUrl(userId: string): Promise<PresignedUrlResponse> {
    try {
      console.log("Requesting presigned URL from backend...");

      const response = await fetch(`${API_BASE_URL}/videos/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          contentType: "video/mp4",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get upload URL: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Received presigned URL:", data.fileName);

      return data;
    } catch (error) {
      console.error("Error getting upload URL:", error);
      throw error;
    }
  }

  /**
   * Step 2: Upload direct vers Cloudflare R2 avec presigned URL
   */
  static async uploadToR2(
    videoUri: string,
    uploadUrl: string,
    onProgress?: (_progress: number) => void
  ): Promise<void> {
    try {
      console.log("Starting direct upload to R2...");

      // Vérifier que le fichier existe
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        throw new Error("Video file does not exist");
      }

      console.log("File info:", {
        exists: fileInfo.exists,
        size: fileInfo.size,
        uri: videoUri,
      });

      // Lire le fichier comme blob
      const response = await fetch(videoUri);
      const blob = await response.blob();

      console.log("File blob created, size:", blob.size);

      // Upload direct vers R2
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "video/mp4",
        },
      });

      console.log("R2 upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `R2 upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      // Simuler le progrès pour l'instant (100% quand terminé)
      onProgress?.(100);

      console.log("Upload to R2 successful!");
    } catch (error) {
      console.error("Error uploading to R2:", error);
      throw error;
    }
  }

  /**
   * Step 3: Confirmer l'upload au backend (sauver en base)
   */
  static async confirmUpload(
    fileName: string,
    userId: string
  ): Promise<UploadConfirmResponse> {
    try {
      console.log("Confirming upload with backend...");

      const response = await fetch(`${API_BASE_URL}/videos/confirm-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
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
   * Méthode principale qui orchestre tout le flow
   */
  static async uploadVideo(
    videoUri: string,
    userId: string,
    onProgress?: (_progress: number) => void
  ): Promise<UploadConfirmResponse> {
    try {
      console.log("=== Starting video upload flow ===");

      // Step 1: Demander presigned URL
      onProgress?.(10);
      const { uploadUrl, fileName } = await this.getUploadUrl(userId);

      // Step 2: Upload direct vers R2
      onProgress?.(20);
      await this.uploadToR2(videoUri, uploadUrl, (r2Progress) => {
        // Mapper le progrès R2 (20% -> 80%)
        const mappedProgress = 20 + r2Progress * 0.6;
        onProgress?.(mappedProgress);
      });

      // Step 3: Confirmer au backend
      onProgress?.(90);
      const result = await this.confirmUpload(fileName, userId);

      onProgress?.(100);
      console.log("=== Video upload flow completed ===");

      return result;
    } catch (error) {
      console.error("=== Video upload flow failed ===", error);
      throw error;
    }
  }
}
