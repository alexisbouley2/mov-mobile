import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Video from "react-native-video";
import { VideoItem } from "@/contexts/event/EventVideosContext";
import { videoCacheService } from "@/services/videoCacheService";
import VideoOverlay from "./VideoOverlay";
import log from "@/utils/logger";

interface VirtualVideoPlayerProps {
  video: VideoItem | null;
  isActive: boolean;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  style?: any;
  onLoad?: () => void;
  onError?: (_error: any) => void;
  onClose?: () => void;
}

export default function VirtualVideoPlayer({
  video,
  isActive,
  isMuted = false,
  onMuteToggle,
  style,
  onLoad,
  onError,
  onClose,
}: VirtualVideoPlayerProps) {
  const videoRef = useRef<any>(null);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize video source ONCE when component mounts - never change it
  useEffect(() => {
    if (!video) return;

    const initializeVideoSource = async () => {
      // Check if video is cached
      const cached = videoCacheService.getCachedVideo(video.id);

      if (cached?.isReady) {
        // Use cached version immediately
        setVideoSource(cached.localUri);
      } else {
        // Use original URL and start preloading in background
        setVideoSource(video.videoUrl);

        // Preload for future use (don't switch source here to avoid re-initialization)
        videoCacheService.preloadVideo(video).catch((error) => {
          log.error("Failed to preload video:", error);
        });
      }
    };

    initializeVideoSource();
  }, [video?.id]); // Only run when video ID changes (component creation)

  // Update playing state based on isActive prop
  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  const handleVideoLoad = () => {
    setIsVideoReady(true);
    log.info(`[VirtualVideoPlayer] Video loaded: ${video?.id}`);
    onLoad?.();
  };

  const handleVideoError = (error: any) => {
    log.error(
      `[VirtualVideoPlayer] Video playback error for ${video?.id}:`,
      error
    );
    setIsVideoReady(false);
    onError?.(error);
  };

  const handleLoadStart = () => {
    setIsVideoReady(false);
    log.info(`[VirtualVideoPlayer] Video load started: ${video?.id}`);
  };

  const handleVideoPress = () => {
    setIsPlaying(!isPlaying);
    log.info(
      `[VirtualVideoPlayer] Video ${video?.id} ${
        !isPlaying ? "PLAYING" : "PAUSED"
      } via tap`
    );
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
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoSource }}
          style={styles.video}
          paused={!isPlaying}
          repeat={true}
          resizeMode="cover"
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          onLoadStart={handleLoadStart}
          controls={false}
          muted={isMuted}
          playWhenInactive={false}
          playInBackground={false}
          ignoreSilentSwitch="ignore"
          // Keep video decoded in GPU memory even when paused
          preventsDisplaySleepDuringVideoPlayback={false}
        />
      </TouchableOpacity>

      {!isVideoReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Add overlay with user info, three dots button, download button, close button, and mute button */}
      <VideoOverlay
        video={video}
        onClose={onClose}
        isMuted={isMuted}
        onMuteToggle={onMuteToggle}
      />
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
  videoContainer: {
    width: "100%",
    height: "100%",
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
