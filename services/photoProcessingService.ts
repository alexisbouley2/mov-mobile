import * as ImageManipulator from "expo-image-manipulator";

export interface ProcessedPhoto {
  thumbnail: string; // 200x200
  full: string; // 800x800
}

export class PhotoProcessingService {
  /**
   * Process image into 2 formats: thumbnail (200x200) and full (800x800)
   */
  static async processImage(imageUri: string): Promise<ProcessedPhoto> {
    try {
      console.log("Processing image:", imageUri);

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

      console.log("Image processing completed");
      return {
        thumbnail: thumbnailResult.uri,
        full: fullResult.uri,
      };
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Failed to process image");
    }
  }
}
