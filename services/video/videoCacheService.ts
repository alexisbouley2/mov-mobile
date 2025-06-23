import * as FileSystem from "expo-file-system";
import { VideoItem } from "@/contexts/EventVideosContext";
import log from "@/utils/logger";

export interface CachedVideo {
  id: string;
  localUri: string;
  downloadPromise?: Promise<string>;
  isDownloading: boolean;
  isReady: boolean;
  fileSize?: number;
  downloadedAt: number;
}

class VideoCacheService {
  private cache = new Map<string, CachedVideo>();
  private maxCacheSize = 7; // Keep max 7 videos cached
  private cacheDirectory: string;

  constructor() {
    // Create cache directory path
    this.cacheDirectory = `${FileSystem.cacheDirectory}video_cache/`;
    this.initializeCacheDirectory();
  }

  private async initializeCacheDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDirectory, {
          intermediates: true,
        });
        log.info("Video cache directory created");
      }
    } catch (error) {
      log.error("Failed to create cache directory:", error);
    }
  }

  private getLocalFilePath(videoId: string): string {
    // Create a safe filename from video ID
    const safeVideoId = videoId.replace(/[^a-zA-Z0-9]/g, "_");
    return `${this.cacheDirectory}${safeVideoId}.mp4`;
  }

  async preloadVideo(video: VideoItem): Promise<string> {
    if (this.cache.has(video.id)) {
      const cached = this.cache.get(video.id)!;
      if (cached.isReady) {
        // Verify file still exists
        const fileExists = await this.verifyFileExists(cached.localUri);
        if (fileExists) {
          return cached.localUri;
        } else {
          // File was deleted, remove from cache and re-download
          this.cache.delete(video.id);
        }
      }
      if (cached.downloadPromise) {
        return cached.downloadPromise;
      }
    }

    // Add to cache with downloading state
    const downloadPromise = this.downloadVideo(video);
    this.cache.set(video.id, {
      id: video.id,
      localUri: "",
      downloadPromise,
      isDownloading: true,
      isReady: false,
      downloadedAt: Date.now(),
    });

    try {
      const localUri = await downloadPromise;
      const fileInfo = await FileSystem.getInfoAsync(localUri);

      this.cache.set(video.id, {
        id: video.id,
        localUri,
        isDownloading: false,
        isReady: true,
        fileSize: fileInfo.exists ? (fileInfo as any).size : undefined,
        downloadedAt: Date.now(),
      });

      log.info(`Video cached successfully: ${video.id}`);
      return localUri;
    } catch (error) {
      this.cache.delete(video.id);
      log.error(`Failed to cache video ${video.id}:`, error);
      // Return original URL as fallback
      return video.videoUrl;
    }
  }

  private async downloadVideo(video: VideoItem): Promise<string> {
    const localFilePath = this.getLocalFilePath(video.id);

    try {
      log.info(`Starting download for video: ${video.id}`);

      // Download the video file
      const downloadResult = await FileSystem.downloadAsync(
        video.videoUrl,
        localFilePath
      );

      if (downloadResult.status === 200) {
        log.info(
          `Video downloaded successfully: ${video.id} -> ${localFilePath}`
        );
        return localFilePath;
      } else {
        throw new Error(
          `Download failed with status: ${downloadResult.status}`
        );
      }
    } catch (error) {
      log.error(`Failed to download video ${video.id}:`, error);

      // Clean up any partial download
      try {
        const fileInfo = await FileSystem.getInfoAsync(localFilePath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(localFilePath);
        }
      } catch (cleanupError) {
        log.error("Failed to cleanup partial download:", cleanupError);
      }

      throw error;
    }
  }

  private async verifyFileExists(localUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      return fileInfo.exists;
    } catch {
      return false;
    }
  }

  getCachedVideo(videoId: string): CachedVideo | null {
    return this.cache.get(videoId) || null;
  }

  isVideoCached(videoId: string): boolean {
    const cached = this.cache.get(videoId);
    return cached?.isReady || false;
  }

  preloadVideosAround(videos: VideoItem[], currentIndex: number) {
    const indicesToPreload = [];

    // Preload 2 before and 3 after current video
    for (
      let i = Math.max(0, currentIndex - 2);
      i <= Math.min(videos.length - 1, currentIndex + 3);
      i++
    ) {
      indicesToPreload.push(i);
    }

    indicesToPreload.forEach((index) => {
      const video = videos[index];
      if (video && !this.cache.has(video.id)) {
        this.queueForPreload(video);
      }
    });

    this.cleanupOldCache(videos, currentIndex);
  }

  private queueForPreload(video: VideoItem) {
    // Directly preload instead of queueing since we have the video object here
    this.preloadVideo(video).catch((error) => {
      log.error(`Failed to preload video ${video.id}:`, error);
    });
  }

  private async cleanupOldCache(videos: VideoItem[], currentIndex: number) {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    const keepRange = 5;
    const videosToKeep = new Set<string>();

    // Mark videos to keep (within range of current)
    for (
      let i = Math.max(0, currentIndex - keepRange);
      i <= Math.min(videos.length - 1, currentIndex + keepRange);
      i++
    ) {
      if (videos[i]) {
        videosToKeep.add(videos[i].id);
      }
    }

    // Remove videos outside keep range
    const videosToRemove: string[] = [];
    for (const [videoId, cachedVideo] of this.cache) {
      if (!videosToKeep.has(videoId)) {
        videosToRemove.push(videoId);

        // Delete the local file
        if (cachedVideo.isReady && cachedVideo.localUri) {
          try {
            await FileSystem.deleteAsync(cachedVideo.localUri);
            log.info(`Deleted cached video file: ${videoId}`);
          } catch (error) {
            log.error(`Failed to delete cached video file ${videoId}:`, error);
          }
        }
      }
    }

    // Remove from cache map
    videosToRemove.forEach((videoId) => {
      this.cache.delete(videoId);
    });

    if (videosToRemove.length > 0) {
      log.info(`Cleaned up ${videosToRemove.length} cached videos`);
    }
  }

  async clearCache() {
    // Delete all cached files
    for (const [videoId, cachedVideo] of this.cache) {
      if (cachedVideo.isReady && cachedVideo.localUri) {
        try {
          await FileSystem.deleteAsync(cachedVideo.localUri);
        } catch (error) {
          log.error(`Failed to delete cached video file ${videoId}:`, error);
        }
      }
    }

    this.cache.clear();

    // Optionally, delete the entire cache directory
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.cacheDirectory);
        await FileSystem.makeDirectoryAsync(this.cacheDirectory, {
          intermediates: true,
        });
      }
    } catch (error) {
      log.error("Failed to clear cache directory:", error);
    }

    log.info("Video cache cleared");
  }

  // Utility method to get cache stats
  getCacheStats() {
    const totalVideos = this.cache.size;
    const readyVideos = Array.from(this.cache.values()).filter(
      (v) => v.isReady
    ).length;
    const downloadingVideos = Array.from(this.cache.values()).filter(
      (v) => v.isDownloading
    ).length;
    const totalSize = Array.from(this.cache.values())
      .filter((v) => v.fileSize)
      .reduce((sum, v) => sum + (v.fileSize || 0), 0);

    return {
      totalVideos,
      readyVideos,
      downloadingVideos,
      totalSize,
      cachePath: this.cacheDirectory,
    };
  }
}

export const videoCacheService = new VideoCacheService();
