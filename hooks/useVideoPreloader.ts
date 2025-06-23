// hooks/useVideoPreloader.ts - Utility hook for video preloading
import { useRef, useCallback } from "react";
import log from "@/utils/logger";

export interface PreloadableVideo {
  id: string;
  videoUrl: string;
}

export function useVideoPreloader() {
  const preloadCache = useRef<Map<string, HTMLVideoElement>>(new Map());

  const preloadVideo = useCallback(
    async (video: PreloadableVideo): Promise<boolean> => {
      return new Promise((resolve) => {
        // Check if already preloaded
        if (preloadCache.current.has(video.id)) {
          resolve(true);
          return;
        }

        // Create video element for preloading
        const videoElement = document.createElement("video");
        videoElement.crossOrigin = "anonymous";
        videoElement.preload = "auto";
        videoElement.muted = true;

        const handleCanPlay = () => {
          preloadCache.current.set(video.id, videoElement);
          cleanup();
          resolve(true);
        };

        const handleError = () => {
          log.error(`Failed to preload video: ${video.id}`);
          cleanup();
          resolve(false);
        };

        const cleanup = () => {
          videoElement.removeEventListener("canplay", handleCanPlay);
          videoElement.removeEventListener("error", handleError);
        };

        videoElement.addEventListener("canplay", handleCanPlay);
        videoElement.addEventListener("error", handleError);

        // Start preloading
        videoElement.src = video.videoUrl;
        videoElement.load();
      });
    },
    []
  );

  const isPreloaded = useCallback((videoId: string): boolean => {
    return preloadCache.current.has(videoId);
  }, []);

  const clearPreloadCache = useCallback(() => {
    preloadCache.current.forEach((videoElement) => {
      videoElement.src = "";
      videoElement.load();
    });
    preloadCache.current.clear();
  }, []);

  const removeFromCache = useCallback((videoId: string) => {
    const videoElement = preloadCache.current.get(videoId);
    if (videoElement) {
      videoElement.src = "";
      videoElement.load();
      preloadCache.current.delete(videoId);
    }
  }, []);

  return {
    preloadVideo,
    isPreloaded,
    clearPreloadCache,
    removeFromCache,
    getCacheSize: () => preloadCache.current.size,
  };
}
