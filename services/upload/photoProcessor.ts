import * as ImageManipulator from "expo-image-manipulator";
import log from "@/utils/logger";
import { UploadProcessor } from "./baseProcessor";
import { UploadOptions } from "./types";

// Photo upload processor (base class for user and event photos)
export abstract class PhotoUploadProcessor extends UploadProcessor {
  abstract getEntityType(): "user" | "event";
  abstract getImageDimensions(): {
    thumbnail: { width: number; height: number };
    full: { width: number; height: number };
  };

  async processFiles(
    originalUri: string,
    _options: UploadOptions
  ): Promise<{ thumbnail: string; image: string }> {
    try {
      log.info(`Processing ${this.getEntityType()} photo:`, originalUri);

      const dimensions = this.getImageDimensions();

      const [thumbnailResult, imageResult] = await Promise.all([
        ImageManipulator.manipulateAsync(
          originalUri,
          [
            {
              resize: {
                width: dimensions.thumbnail.width,
                height: dimensions.thumbnail.height,
              },
            },
          ],
          {
            compress: 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false,
          }
        ),
        ImageManipulator.manipulateAsync(
          originalUri,
          [
            {
              resize: {
                width: dimensions.full.width,
                height: dimensions.full.height,
              },
            },
          ],
          {
            compress: 0.9,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false,
          }
        ),
      ]);

      return {
        thumbnail: thumbnailResult.uri,
        image: imageResult.uri,
      };
    } catch (error) {
      log.error(`Error processing ${this.getEntityType()} photo:`, error);
      throw new Error(`Failed to process ${this.getEntityType()} photo`);
    }
  }

  async uploadToR2(
    processedFiles: { thumbnail: string; image: string },
    userId: string,
    onProgress?: (_progress: number) => void
  ): Promise<{ thumbnailPath: string; imagePath: string }> {
    try {
      log.info(`Uploading ${this.getEntityType()} photo to R2`);

      // Get upload URLs for photos
      const { urls } = await this.getUploadUrls(userId, this.getEntityType());

      const thumbnailUrl = urls.find((u) => u.type === "thumbnail");
      const imageUrl = urls.find((u) => u.type === "image");

      if (!thumbnailUrl || !imageUrl) {
        throw new Error("Failed to get upload URLs");
      }

      // Upload both photos
      await Promise.all([
        this.uploadFile(
          processedFiles.thumbnail,
          thumbnailUrl.uploadUrl,
          "image/jpeg"
        ),
        this.uploadFile(processedFiles.image, imageUrl.uploadUrl, "image/jpeg"),
      ]);

      onProgress?.(100);

      return {
        thumbnailPath: thumbnailUrl.fileName,
        imagePath: imageUrl.fileName,
      };
    } catch (error) {
      log.error(`Error uploading ${this.getEntityType()} photo to R2:`, error);
      throw error;
    }
  }
}

// User photo upload processor
export class UserPhotoUploadProcessor extends PhotoUploadProcessor {
  getEntityType(): "user" | "event" {
    return "user";
  }

  getImageDimensions(): {
    thumbnail: { width: number; height: number };
    full: { width: number; height: number };
  } {
    return {
      thumbnail: { width: 200, height: 200 },
      full: { width: 800, height: 800 },
    };
  }
}

// Event photo upload processor
export class EventPhotoUploadProcessor extends PhotoUploadProcessor {
  getEntityType(): "user" | "event" {
    return "event";
  }

  getImageDimensions(): {
    thumbnail: { width: number; height: number };
    full: { width: number; height: number };
  } {
    return {
      thumbnail: { width: 200, height: 200 },
      full: { width: 1600, height: 900 }, // 16:9 aspect ratio
    };
  }
}
