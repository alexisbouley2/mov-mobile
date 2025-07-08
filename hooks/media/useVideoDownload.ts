import { useState } from "react";
import { Alert, Linking } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { VideoItem } from "@/contexts/EventVideosContext";
import { videoCacheService } from "@/services/videoCacheService";
import log from "@/utils/logger";

export function useVideoDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadVideo = async (video: VideoItem) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need permission to save videos to your photo library. Please enable it in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      // Get the video file (either from cache or download it)
      let videoUri: string;

      // Check if video is already cached
      const cachedVideo = videoCacheService.getCachedVideo(video.id);
      if (cachedVideo?.isReady) {
        videoUri = cachedVideo.localUri;
      } else {
        // Download the video first
        log.info(`Downloading video for saving: ${video.id}`);
        videoUri = await videoCacheService.preloadVideo(video);
      }

      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        throw new Error("Video file not found");
      }

      // Save to media library
      log.info(`Saving video to media library: ${videoUri}`);
      const asset = await MediaLibrary.createAssetAsync(videoUri);

      // Create an album for the app (optional)
      const album = await MediaLibrary.getAlbumAsync("MOV");
      if (album === null) {
        await MediaLibrary.createAlbumAsync("MOV", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      log.info(`Video saved successfully: ${asset.id}`);
      Alert.alert("Success", "Video saved to your photo library!");
    } catch (error) {
      log.error("Failed to download video:", error);
      Alert.alert(
        "Download Failed",
        "Failed to save video to your photo library. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadVideo,
    isDownloading,
  };
}
