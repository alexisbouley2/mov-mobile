import * as VideoThumbnails from "expo-video-thumbnails";
import log from "@/utils/logger";
import { UploadProcessor } from "./baseProcessor";
import { UploadOptions } from "./types";
import { videosApi } from "@/services/api";
import { ConfirmUploadRequest } from "@movapp/types";

// Video upload processor
export class VideoUploadProcessor extends UploadProcessor {
  async processFiles(
    originalUri: string,
    options: UploadOptions
  ): Promise<{ thumbnail: string; originalUri: string }> {
    try {
      log.info("Processing video:", originalUri);

      const { time = 1000, quality = 0.8 } = options;

      // Generate thumbnail
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        originalUri,
        { time, quality }
      );

      // Process thumbnail
      const processedThumbnail = await this.processThumbnail(thumbnailUri);

      // Clean up original thumbnail
      if (thumbnailUri !== processedThumbnail) {
        await this.safeDeleteFile(thumbnailUri);
      }

      return { thumbnail: processedThumbnail, originalUri };
    } catch (error) {
      log.error("Error processing video:", error);
      throw new Error("Failed to process video");
    }
  }

  async uploadToR2(
    processedFiles: { thumbnail: string; originalUri: string },
    userId: string,
    onProgress?: (_progress: number) => void
  ): Promise<{ videoPath: string; thumbnailPath: string }> {
    try {
      log.info("Uploading video to R2");

      // Get upload URLs for video and thumbnail
      const { urls } = await this.getUploadUrls(userId, "video");

      const videoUrl = urls.find((u) => u.type === "video");
      const thumbnailUrl = urls.find((u) => u.type === "thumbnail");

      if (!videoUrl || !thumbnailUrl) {
        throw new Error("Failed to get upload URLs");
      }

      // Upload video and thumbnail
      await Promise.all([
        this.uploadFile(
          processedFiles.originalUri,
          videoUrl.uploadUrl,
          "video/mp4"
        ),
        this.uploadFile(
          processedFiles.thumbnail,
          thumbnailUrl.uploadUrl,
          "image/jpeg"
        ),
      ]);

      await VideoUploadProcessor.confirmUpload(
        videoUrl.fileName,
        thumbnailUrl.fileName,
        userId
      );

      onProgress?.(100);

      return {
        videoPath: videoUrl.fileName,
        thumbnailPath: thumbnailUrl.fileName,
      };
    } catch (error) {
      log.error("Error uploading video to R2:", error);
      throw error;
    }
  }

  static async confirmUpload(
    videoPath: string,
    thumbnailPath: string,
    userId: string
  ) {
    try {
      const uploadData: ConfirmUploadRequest = {
        videoPath: videoPath,
        thumbnailPath: thumbnailPath,
        userId,
      };

      const response = await videosApi.confirmUpload(uploadData);
      log.info("Upload confirmed:", response.video.id);

      return response;
    } catch (error) {
      log.error("Error confirming upload:", error);
      throw error;
    }
  }
}
