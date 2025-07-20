import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CachedImage } from "@/components/ui/CachedImage";
import ThreeDotsButton from "@/components/ui/ThreeDotsButton";
import { useVideoDownload } from "@/hooks/media/useVideoDownload";
import { useEventVideos, VideoItem } from "@/contexts/event/EventVideosContext";

interface VideoOverlayProps {
  video: VideoItem;
  onClose?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
}

export default function VideoOverlay({
  video,
  onClose,
  isMuted = false,
  onMuteToggle,
}: VideoOverlayProps) {
  const { reportVideo } = useEventVideos();
  const { downloadVideo, isDownloading } = useVideoDownload();

  const formatTime = (date: string) => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Image
          source={require("@/assets/images/icon/cross.png")}
          style={styles.closeButtonIcon}
        />
      </TouchableOpacity>

      {/* User Info Overlay */}
      <View style={styles.userOverlay}>
        <CachedImage
          uri={video.user.profileThumbnailUrl || ""}
          cachePolicy="profile-thumbnail"
          style={styles.userAvatar}
          fallbackSource={undefined}
          showLoading={true}
          loadingColor="#666"
        />

        <View>
          <Text style={styles.username}>{video.user.username}</Text>
          <Text style={styles.timestamp}>
            {formatTime(video.createdAt.toISOString())}
          </Text>
        </View>
      </View>

      {/* Three Dots Button */}
      <ThreeDotsButton
        onPress={() => reportVideo(video.id)}
        style={styles.deleteButton}
      />

      {/* Mute/Unmute Button */}
      <TouchableOpacity style={styles.muteButton} onPress={onMuteToggle}>
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={36}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Download/Share Button */}
      <TouchableOpacity
        style={styles.shareSection}
        onPress={() => downloadVideo(video)}
        disabled={isDownloading}
      >
        <Image
          source={require("@/assets/images/icon/white-share.png")}
          style={styles.shareIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: "box-none", // Allow touches to pass through to video
  },
  closeButton: {
    width: 36,
    height: 36,
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 100,
  },
  closeButtonIcon: {
    width: "100%",
    height: "100%",
  },
  userOverlay: {
    position: "absolute",
    top: 60,
    left: 30,
    flexDirection: "row",
    zIndex: 100,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  username: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  timestamp: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  shareSection: {
    position: "absolute",
    bottom: 60,
    right: 30,
    zIndex: 100,
    width: 36,
    height: 38,
  },
  shareIcon: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    bottom: 60,
    left: 30,
    zIndex: 100,
    width: 36,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
  },
  muteButton: {
    position: "absolute",
    bottom: 120,
    right: 30,
    zIndex: 100,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
