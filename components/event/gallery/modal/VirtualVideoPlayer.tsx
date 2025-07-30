import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
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
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!video) {
      setVideoSource(null);
      return;
    }

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
  }, [video?.id, isActive]);

  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  const handleVideoLoad = () => {
    log.info(`[VirtualVideoPlayer] Video loaded: ${video?.id}`);
    onLoad?.();
  };

  const handleVideoError = (error: any) => {
    log.error(
      `[VirtualVideoPlayer] Video playback error for ${video?.id}:`,
      error
    );
    onError?.(error);
  };

  const handleLoadStart = () => {
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
            // Add buffer config to reduce memory usage
            bufferConfig={{
              minBufferMs: 2000,
              maxBufferMs: 5000,
              bufferForPlaybackMs: 1000,
              bufferForPlaybackAfterRebufferMs: 1000,
            }}
            // Reduce max bit rate to save memory
            maxBitRate={2000000} // 2 Mbps
          />

          <Pressable style={styles.tapOverlay} onPress={handleVideoPress} />
        </View>
      </TapGestureHandler>

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

  tapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
