// Alternative fix for VirtualVideoPlayer if the gesture handler solution doesn't work
// Import TapGestureHandler from react-native-gesture-handler

import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import Video from "react-native-video";
import { TapGestureHandler, State } from "react-native-gesture-handler";
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

  useEffect(() => {
    if (!video) return;

    const initializeVideoSource = async () => {
      const cached = videoCacheService.getCachedVideo(video.id);

      if (cached?.isReady) {
        setVideoSource(cached.localUri);
      } else {
        setVideoSource(video.videoUrl);
        videoCacheService.preloadVideo(video).catch((error) => {
          log.error("Failed to preload video:", error);
        });
      }
    };

    initializeVideoSource();
  }, [video?.id]);

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

  const handleTapGesture = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      handleVideoPress();
    }
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
      <TapGestureHandler onHandlerStateChange={handleTapGesture}>
        <View style={styles.videoContainer}>
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
            preventsDisplaySleepDuringVideoPlayback={false}
          />

          {/* Alternative: Use Pressable with absolute positioning */}
          <Pressable style={styles.tapOverlay} onPress={handleVideoPress} />
        </View>
      </TapGestureHandler>

      {!isVideoReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

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
  tapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
