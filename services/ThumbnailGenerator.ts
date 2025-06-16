import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export interface ThumbnailOptions {
  time?: number; // Time in milliseconds to extract thumbnail from
  quality?: number; // Quality 0-1
  headers?: Record<string, string>; // For remote videos
}

export class ThumbnailGenerator {
  /**
   * Generate thumbnail from video file
   * Supports both local and remote video URIs
   */
  static async generateThumbnail(
    videoUri: string,
    options: ThumbnailOptions = {}
  ): Promise<string> {
    try {
      console.log("Generating thumbnail from video:", videoUri);

      const {
        time = 1000, // Extract frame at 1 second by default
        quality = 1, // Maximum quality
        headers = {},
      } = options;

      // Check if it's a local file
      if (videoUri.startsWith("file://")) {
        const fileInfo = await FileSystem.getInfoAsync(videoUri);
        if (!fileInfo.exists) {
          throw new Error("Video file does not exist");
        }
      }

      // Generate thumbnail using expo-video-thumbnails
      const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
        videoUri,
        {
          time,
          quality,
          headers,
        }
      );

      console.log("Raw thumbnail generated:", thumbnailUri);

      // Process the thumbnail (resize, compress, format)
      const processedThumbnail = await this.processThumbnail(thumbnailUri);

      // Clean up the original thumbnail if it was temporary
      if (thumbnailUri !== processedThumbnail) {
        await this.safeDeleteFile(thumbnailUri);
      }

      console.log("Processed thumbnail ready:", processedThumbnail);
      return processedThumbnail;
    } catch (error) {
      console.error("Error generating thumbnail:", error);

      // Fallback to placeholder if thumbnail generation fails
      console.log("Falling back to placeholder thumbnail");
      return this.createPlaceholderThumbnail();
    }
  }

  /**
   * Process thumbnail: resize, compress and optimize
   */
  private static async processThumbnail(thumbnailUri: string): Promise<string> {
    try {
      const result = await manipulateAsync(
        thumbnailUri,
        [
          // Resize to standard thumbnail size
          { resize: { width: 300, height: 300 } },
        ],
        {
          compress: 0.8, // Good balance between quality and size
          format: SaveFormat.JPEG,
          base64: false,
        }
      );

      return result.uri;
    } catch (error) {
      console.error("Error processing thumbnail:", error);
      return thumbnailUri; // Return original if processing fails
    }
  }

  /**
   * Create a placeholder thumbnail for when video thumbnail extraction fails
   */
  private static async createPlaceholderThumbnail(): Promise<string> {
    try {
      // Create a simple gradient placeholder
      const placeholderBase64 = this.generatePlaceholderBase64();

      // Save to temporary file
      const fileUri = `${
        FileSystem.documentDirectory
      }thumbnail_placeholder_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(fileUri, placeholderBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Process the placeholder to standard size
      const result = await manipulateAsync(
        fileUri,
        [{ resize: { width: 300, height: 300 } }],
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
          base64: false,
        }
      );

      // Clean up temporary file
      await this.safeDeleteFile(fileUri);

      return result.uri;
    } catch (error) {
      console.error("Error creating placeholder thumbnail:", error);
      throw new Error("Failed to create placeholder thumbnail");
    }
  }

  /**
   * Generate a base64 placeholder image
   */
  private static generatePlaceholderBase64(): string {
    // Simple dark gradient placeholder
    return `/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCADIAMgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==`;
  }

  /**
   * Safely delete a file without throwing errors
   */
  private static async safeDeleteFile(fileUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.error(error);
      console.log("Could not delete temporary file:", fileUri);
    }
  }

  /**
   * Clean up all thumbnail cache
   */
  static async clearThumbnailCache(): Promise<void> {
    try {
      const cacheDir = `${FileSystem.documentDirectory}thumbnails/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);

      if (dirInfo.exists) {
        await FileSystem.deleteAsync(cacheDir, { idempotent: true });
        console.log("Thumbnail cache cleared");
      }
    } catch (error) {
      console.error("Error clearing thumbnail cache:", error);
    }
  }
}
