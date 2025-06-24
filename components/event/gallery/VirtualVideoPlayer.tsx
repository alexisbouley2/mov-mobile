import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { VideoItem } from "@/contexts/EventVideosContext";
import { videoCacheService } from "@/services/videoCacheService";
import log from "@/utils/logger";

interface VirtualVideoPlayerProps {
  video: VideoItem | null;
  isActive: boolean;
  style?: any;
  onLoad?: () => void;
  onError?: (_error: any) => void;
}

export default function VirtualVideoPlayer({
  video,
  isActive,
  style,
  onLoad,
  onError,
}: VirtualVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoSource, setVideoSource] = useState<string | null>(null);

  // Update video source when video prop changes
  useEffect(() => {
    if (!video) {
      setVideoSource(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Check if video is cached
    const cached = videoCacheService.getCachedVideo(video.id);

    if (cached?.isReady) {
      // Use cached version immediately
      setVideoSource(cached.localUri);
      setIsLoading(false);
    } else {
      // Use original URL while downloading in background
      setVideoSource(video.videoUrl);

      // Start preloading for next time
      videoCacheService
        .preloadVideo(video)
        .then((localUri) => {
          // Switch to cached version when ready
          if (localUri !== video.videoUrl) {
            setVideoSource(localUri);
          }
        })
        .catch((error) => {
          log.error("Failed to preload video:", error);
        });
    }
  }, [video?.id]);

  // Handle play/pause based on active state
  useEffect(() => {
    if (videoRef.current && videoSource) {
      if (isActive) {
        videoRef.current.playAsync().catch((error) => {
          log.error("Failed to play video:", error);
        });
      } else {
        videoRef.current.pauseAsync().catch((error) => {
          log.error("Failed to pause video:", error);
        });
      }
    }
  }, [isActive, videoSource]);

  const handleVideoLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleVideoError = (error: any) => {
    log.error("Video playback error:", error);
    setIsLoading(false);
    onError?.(error);
  };

  if (!video || !videoSource) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={{ uri: videoSource }}
        style={styles.video}
        shouldPlay={isActive}
        isLooping={true}
        resizeMode={ResizeMode.COVER} // Changed to COVER for better full-screen experience
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        onLoadStart={() => {
          setIsLoading(true);
        }}
        useNativeControls={false} // Hide native controls for cleaner look
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    flex: 1,
    backgroundColor: "#111",
    width: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
