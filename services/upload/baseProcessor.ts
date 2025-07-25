import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { mediaApi } from "@/services/api";
import log from "@/utils/logger";
import { UploadOptions } from "./types";
import { GetUploadUrlsResponse, MediaEntityType } from "@movapp/types";

// Abstract base class for upload processors
export abstract class UploadProcessor {
  abstract processFiles(
    _originalUri: string,
    _options: UploadOptions
  ): Promise<{ thumbnail?: string; image?: string; originalUri?: string }>;

  abstract uploadToR2(
    _processedFiles: {
      thumbnail?: string;
      image?: string;
      originalUri?: string;
    },
    _userId: string,
    _onProgress?: (_progress: number) => void
  ): Promise<{
    thumbnailPath?: string;
    imagePath?: string;
    videoPath?: string;
  }>;

  protected async processThumbnail(thumbnailUri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        thumbnailUri,
        [{ resize: { width: 333 } }], // Only specify width, height scales automatically
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );
      return result.uri;
    } catch (error) {
      log.error("Error processing thumbnail:", error);
      return thumbnailUri;
    }
  }

  protected async uploadFile(
    fileUri: string,
    uploadUrl: string,
    contentType: string
  ): Promise<void> {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    const response = await fetch(fileUri);
    const blob = await response.blob();

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": contentType },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `R2 upload failed: ${uploadResponse.status} - ${errorText}`
      );
    }
  }

  protected async getUploadUrls(
    userId: string,
    entityType: MediaEntityType
  ): Promise<GetUploadUrlsResponse> {
    return await mediaApi.getUploadUrls(userId, entityType);
  }

  protected async safeDeleteFile(fileUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      log.error("Could not delete temporary file:", fileUri, error);
    }
  }
}
