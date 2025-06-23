import { VideoItem } from "@/contexts/EventVideosContext";
import log from "@/utils/logger";

export interface CachedVideo {
  id: string;
  localUri: string;
  downloadPromise?: Promise<string>;
  isDownloading: boolean;
  isReady: boolean;
}

class VideoCacheService {
  private cache = new Map<string, CachedVideo>();
  private downloadQueue: string[] = [];
  private maxCacheSize = 7; // Keep max 7 videos cached
  private isProcessingQueue = false;

  async preloadVideo(video: VideoItem): Promise<string> {
    if (this.cache.has(video.id)) {
      const cached = this.cache.get(video.id)!;
      if (cached.isReady) {
        return cached.localUri;
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
    });

    try {
      const localUri = await downloadPromise;
      this.cache.set(video.id, {
        id: video.id,
        localUri,
        isDownloading: false,
        isReady: true,
      });
      return localUri;
    } catch (error) {
      this.cache.delete(video.id);
      throw error;
    }
  }

  private async downloadVideo(video: VideoItem): Promise<string> {
    try {
      // For React Native, we'd use expo-file-system here
      // For now, return the original URL as we're not actually downloading
      // In a real implementation, you'd download to local storage
      return video.videoUrl;
    } catch (error) {
      log.error("Failed to download video:", error);
      throw error;
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

    this.processDownloadQueue();
    this.cleanupOldCache(videos, currentIndex);
  }

  private queueForPreload(video: VideoItem) {
    if (!this.downloadQueue.includes(video.id)) {
      this.downloadQueue.push(video.id);
    }
  }

  private async processDownloadQueue() {
    if (this.isProcessingQueue || this.downloadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    // Process up to 2 videos concurrently
    const concurrent = Math.min(2, this.downloadQueue.length);
    const promises = [];

    for (let i = 0; i < concurrent; i++) {
      const videoId = this.downloadQueue.shift();
      if (videoId) {
        // We'd need access to the video object here
        // For now, we'll handle this in the context
        promises.push(Promise.resolve());
      }
    }

    await Promise.allSettled(promises);
    this.isProcessingQueue = false;

    // Process remaining queue
    if (this.downloadQueue.length > 0) {
      setTimeout(() => this.processDownloadQueue(), 100);
    }
  }

  private cleanupOldCache(videos: VideoItem[], currentIndex: number) {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }

    const keepRange = 5;
    const videosToKeep = new Set();

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
    for (const [videoId] of this.cache) {
      if (!videosToKeep.has(videoId)) {
        this.cache.delete(videoId);
      }
    }
  }

  clearCache() {
    this.cache.clear();
    this.downloadQueue = [];
  }
}

export const videoCacheService = new VideoCacheService();
