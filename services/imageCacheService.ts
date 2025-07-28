// services/imageCacheService.ts
import * as FileSystem from "expo-file-system";
import log from "@/utils/logger";

export type CachePolicy =
  | "profile-image"
  | "profile-thumbnail"
  | "cover-image"
  | "cover-thumbnail"
  | "video-thumbnail";

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Max cache size in bytes (approximate)
}

const CACHE_POLICIES: Record<CachePolicy, CacheConfig> = {
  "profile-image": {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxSize: 30 * 1024 * 1024, // 30MB
  },
  "profile-thumbnail": {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  "cover-image": {
    ttl: 3 * 24 * 60 * 60 * 1000, // 3 days
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  "cover-thumbnail": {
    ttl: 3 * 24 * 60 * 60 * 1000, // 3 days
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  "video-thumbnail": {
    ttl: 1 * 24 * 60 * 60 * 1000, // 1 day
    maxSize: 200 * 1024 * 1024, // 200MB
  },
};

interface CacheEntry {
  localPath: string;
  cachedAt: number;
  policy: CachePolicy;
  size: number;
  lastAccessedAt: number;
}

interface CacheMetadata {
  [r2Path: string]: CacheEntry;
}

class ImageCacheService {
  private cacheDir: string;
  private metadataFile: string;
  private metadata: CacheMetadata = {};
  private metadataLoaded = false;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Create cache directory path
    this.cacheDir = `${FileSystem.cacheDirectory}images/`;
    this.metadataFile = `${this.cacheDir}metadata.json`;

    // Initialize directory and start cleanup (fire-and-forget)
    this.initializeCacheDirectory();
    this.startPeriodicCleanup();
    this.getCacheStats();
  }

  private async initializeCacheDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, {
          intermediates: true,
        });
        log.info("Image cache directory created");
      }
    } catch (error) {
      log.error("Failed to create image cache directory:", error);
    }
  }

  private startPeriodicCleanup() {
    // Run cleanup every 6 hours
    this.cleanupInterval = setInterval(() => {
      this.performMaintenance().catch((error) => {
        log.error("Periodic image cache cleanup failed:", error);
      });
    }, 6 * 60 * 60 * 1000);

    // Run initial cleanup after 30 seconds (let app start first)
    setTimeout(() => {
      this.performMaintenance().catch((error) => {
        log.error("Initial image cache cleanup failed:", error);
      });
    }, 30000);
  }

  private async loadMetadata(): Promise<void> {
    if (this.metadataLoaded) return;

    try {
      const metadataInfo = await FileSystem.getInfoAsync(this.metadataFile);
      if (metadataInfo.exists) {
        const metadataContent = await FileSystem.readAsStringAsync(
          this.metadataFile
        );
        this.metadata = JSON.parse(metadataContent);
        log.info(
          `Loaded ${Object.keys(this.metadata).length} cached image entries`
        );
      }
      this.metadataLoaded = true;
    } catch (error) {
      log.error("Failed to load image cache metadata:", error);
      this.metadata = {};
      this.metadataLoaded = true;
    }
  }

  private async saveMetadata(): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(
        this.metadataFile,
        JSON.stringify(this.metadata, null, 2)
      );
    } catch (error) {
      log.error("Failed to save image cache metadata:", error);
    }
  }

  // FIXED: Generate deterministic cache key based on R2 path only
  private generateCacheKey(r2Path: string): string {
    // Create a hash-like key from the R2 path that's always the same
    const sanitized = r2Path.replace(/[^a-zA-Z0-9]/g, "_");

    // Generate a simple hash to keep filename reasonable length
    let hash = 0;
    for (let i = 0; i < r2Path.length; i++) {
      const char = r2Path.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `${sanitized.substring(0, 50)}_${Math.abs(hash)}`;
  }

  private extractR2Path(presignedUrl: string): string {
    try {
      const url = new URL(presignedUrl);
      return url.pathname.substring(1); // Remove leading slash
    } catch {
      log.error("Failed to extract R2 path from URL:", presignedUrl);
      return presignedUrl.replace(/[^a-zA-Z0-9]/g, "_");
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    const config = CACHE_POLICIES[entry.policy];
    return Date.now() - entry.cachedAt > config.ttl;
  }

  /**
   * Get cached image path if available and not expired
   */
  async getCached(presignedUrl: string): Promise<string | null> {
    await this.loadMetadata();

    const r2Path = this.extractR2Path(presignedUrl);
    const entry = this.metadata[r2Path];

    if (!entry) return null;

    if (this.isExpired(entry)) {
      // Clean up expired entry
      try {
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(entry.localPath);
        }
      } catch (error) {
        log.error("Failed to delete expired image file:", error);
      }
      delete this.metadata[r2Path];
      this.saveMetadata(); // Don't await
      return null;
    }

    // Check if file still exists
    try {
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (fileInfo.exists) {
        // Update last accessed time
        entry.lastAccessedAt = Date.now();
        this.saveMetadata(); // Don't await - save in background
        return entry.localPath;
      } else {
        // File was deleted externally
        delete this.metadata[r2Path];
        this.saveMetadata(); // Don't await
        return null;
      }
    } catch (error) {
      log.error("Failed to check cached image file:", error);
      return null;
    }
  }

  /**
   * Download and cache an image
   */
  async cache(
    presignedUrl: string,
    policy: CachePolicy
  ): Promise<string | null> {
    try {
      const r2Path = this.extractR2Path(presignedUrl);

      // Check if already cached first
      const cached = await this.getCached(presignedUrl);
      if (cached) {
        return cached;
      }

      // Generate cache path (now deterministic)
      const cacheKey = this.generateCacheKey(r2Path);
      const extension = r2Path.split(".").pop()?.split("?")[0] || "jpg";
      const localPath = `${this.cacheDir}${cacheKey}.${extension}`;

      // Download file
      log.info(`Caching image: ${r2Path}`);
      const downloadResult = await FileSystem.downloadAsync(
        presignedUrl,
        localPath
      );

      if (downloadResult.status !== 200) {
        log.error(`Failed to download image: ${downloadResult.status}`);
        return null;
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      const size = (fileInfo as any).size || 0;

      // Load metadata if not loaded yet
      await this.loadMetadata();

      // Update metadata
      this.metadata[r2Path] = {
        localPath,
        cachedAt: Date.now(),
        lastAccessedAt: Date.now(),
        policy,
        size,
      };

      // Save in background
      this.saveMetadata();

      // Cleanup if needed (in background)
      this.cleanupBySize(policy);

      log.info(`Image cached successfully: ${localPath}`);
      return localPath;
    } catch (error) {
      log.error("Failed to cache image:", error);
      return null;
    }
  }

  private async cleanupExpired(): Promise<void> {
    await this.loadMetadata();

    const expiredPaths: string[] = [];
    for (const [r2Path, entry] of Object.entries(this.metadata)) {
      if (this.isExpired(entry)) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(entry.localPath);
          }
          expiredPaths.push(r2Path);
        } catch (error) {
          log.error("Failed to delete expired cache file:", error);
          expiredPaths.push(r2Path);
        }
      }
    }

    expiredPaths.forEach((path) => delete this.metadata[path]);
    if (expiredPaths.length > 0) {
      await this.saveMetadata();
      log.info(`Cleaned up ${expiredPaths.length} expired image cache entries`);
    }
  }

  private async cleanupBySize(policy: CachePolicy): Promise<void> {
    await this.loadMetadata();

    const config = CACHE_POLICIES[policy];
    const entriesForPolicy = Object.entries(this.metadata)
      .filter(([, entry]) => entry.policy === policy)
      .sort(([, a], [, b]) => a.lastAccessedAt - b.lastAccessedAt);

    let totalSize = entriesForPolicy.reduce(
      (sum, [, entry]) => sum + entry.size,
      0
    );
    let deletedCount = 0;

    while (totalSize > config.maxSize && entriesForPolicy.length > 0) {
      const [r2Path, entry] = entriesForPolicy.shift()!;

      try {
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(entry.localPath);
        }
        delete this.metadata[r2Path];
        totalSize -= entry.size;
        deletedCount++;
      } catch (error) {
        log.error("Failed to delete cache file for size cleanup:", error);
      }
    }

    if (deletedCount > 0) {
      await this.saveMetadata();
      log.info(
        `Size cleanup: removed ${deletedCount} image files for ${policy}`
      );
    }
  }

  /**
   * Perform maintenance (cleanup expired files and size limits)
   */
  async performMaintenance(): Promise<void> {
    log.info("Starting image cache maintenance...");
    await this.cleanupExpired();

    for (const policy of Object.keys(CACHE_POLICIES) as CachePolicy[]) {
      await this.cleanupBySize(policy);
    }

    log.info("Image cache maintenance completed");
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    policiesStats: Record<CachePolicy, { files: number; size: number }>;
  }> {
    await this.loadMetadata();

    const stats = {
      totalFiles: 0,
      totalSize: 0,
      policiesStats: {} as Record<CachePolicy, { files: number; size: number }>,
    };

    for (const policy of Object.keys(CACHE_POLICIES) as CachePolicy[]) {
      stats.policiesStats[policy] = { files: 0, size: 0 };
    }

    for (const entry of Object.values(this.metadata)) {
      stats.totalFiles++;
      stats.totalSize += entry.size;
      stats.policiesStats[entry.policy].files++;
      stats.policiesStats[entry.policy].size += entry.size;
    }

    log.info("cache stats: ", stats);

    return stats;
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();
