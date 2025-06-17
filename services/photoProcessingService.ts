import * as ImageManipulator from "expo-image-manipulator";

export interface ProcessedPhoto {
  thumbnail: string; // Different sizes based on entity type
  full: string; // Different sizes based on entity type
}

export class PhotoProcessingService {
  /**
   * Process image for user profile: thumbnail (200x200) and full (800x800)
   */
  static async processUserImage(imageUri: string): Promise<ProcessedPhoto> {
    try {
      console.log("Processing user image:", imageUri);

      // Process thumbnail version (200x200)
      const thumbnailResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 200, height: 200 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      // Process full version (800x800)
      const fullResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800, height: 800 } }],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      console.log("User image processing completed");
      return {
        thumbnail: thumbnailResult.uri,
        full: fullResult.uri,
      };
    } catch (error) {
      console.error("Error processing user image:", error);
      throw new Error("Failed to process user image");
    }
  }

  /**
   * Process image for event: thumbnail (200x200) and full (1600x900) - 16:9 aspect ratio
   */
  static async processEventImage(imageUri: string): Promise<ProcessedPhoto> {
    try {
      console.log("Processing event image:", imageUri);

      // Process thumbnail version (200x200) - 16:9 aspect ratio
      const thumbnailResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 200, height: 200 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      // Process full version (1600x900) - 16:9 aspect ratio
      const fullResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1600, height: 900 } }],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      console.log("Event image processing completed");
      return {
        thumbnail: thumbnailResult.uri,
        full: fullResult.uri,
      };
    } catch (error) {
      console.error("Error processing event image:", error);
      throw new Error("Failed to process event image");
    }
  }

  /**
   * Generic process image method that delegates to specific processing based on context
   * @deprecated Use processUserImage or processEventImage directly
   */
  static async processImage(imageUri: string): Promise<ProcessedPhoto> {
    // Default to user image processing for backward compatibility
    return this.processUserImage(imageUri);
  }
}
