import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { config } from "@/lib/config";
import log from "@/utils/logger";
import { UploadOptions } from "./types";

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

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
        [{ resize: { width: 300, height: 300 } }],
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
    entityType: "video" | "user" | "event"
  ): Promise<{
    urls: Array<{
      uploadUrl: string;
      fileName: string;
      type: "thumbnail" | "image" | "video";
    }>;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/media/upload-urls?userId=${userId}&entityType=${entityType}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get upload URLs: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  }

  protected async safeDeleteFile(fileUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      log.error("Could not delete temporary file:", fileUri, error);
    }
  }
}
