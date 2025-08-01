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
      let normalizedUri = originalUri;
      if (!originalUri.startsWith("file://")) {
        normalizedUri = `file://${originalUri}`;
      }

      const { time = 1000, quality = 1 } = options;

      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        normalizedUri,
        { time, quality }
      );

      const processedThumbnail = await this.processThumbnail(thumbnailUri);

      if (thumbnailUri !== processedThumbnail) {
        await this.safeDeleteFile(thumbnailUri);
      }

      return { thumbnail: processedThumbnail, originalUri: normalizedUri };
    } catch (error) {
      log.error("💥 Error processing video:", error);
      throw new Error(`Failed to process video: ${error}`);
    }
  }

  async uploadToR2(
    processedFiles: { thumbnail: string; originalUri: string },
    userId: string,
    onProgress?: (_progress: number) => void
  ): Promise<{ videoPath: string; thumbnailPath: string }> {
    try {
      const { urls } = await this.getUploadUrls(userId, "video");

      const videoUrl = urls.find((u) => u.type === "video");
      const thumbnailUrl = urls.find((u) => u.type === "thumbnail");

      if (!videoUrl || !thumbnailUrl) {
        log.error("❌ Missing upload URLs:", { videoUrl, thumbnailUrl });
        throw new Error("Failed to get upload URLs");
      }

      onProgress?.(10);

      const uploadPromises = [
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
      ];

      await Promise.all(uploadPromises);

      // Track uploaded files
      this.trackUploadedFile(videoUrl.fileName);
      this.trackUploadedFile(thumbnailUrl.fileName);

      onProgress?.(80);

      await VideoUploadProcessor.confirmUpload(
        videoUrl.fileName,
        thumbnailUrl.fileName,
        userId
      );

      onProgress?.(100);
      log.info("🎉 R2 upload completed successfully");

      return {
        videoPath: videoUrl.fileName,
        thumbnailPath: thumbnailUrl.fileName,
      };
    } catch (error) {
      log.error("💥 Error uploading video to R2:", error);
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

      return response;
    } catch (error) {
      log.error("❌ Error confirming upload:", error);
      throw error;
    }
  }
}
