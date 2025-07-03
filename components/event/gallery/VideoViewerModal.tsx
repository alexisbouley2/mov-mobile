import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import VideoCarousel from "./VideoCarousel";
import { useEventVideos, VideoItem } from "@/contexts/EventVideosContext";
import { CachedImage } from "@/components/ui/CachedImage";

interface VideoViewerModalProps {
  visible: boolean;
  videos: VideoItem[];
  onClose: () => void;
  onIndexChange?: (_index: number) => void;
}

export default function VideoViewerModal({
  visible,
  videos,
  onClose,
  onIndexChange,
}: VideoViewerModalProps) {
  const { currentVideoIndex, setCurrentVideoIndex, closeVideoModal } =
    useEventVideos();

  const handleIndexChange = (index: number) => {
    setCurrentVideoIndex(index);
    onIndexChange?.(index);
  };

  const handleClose = () => {
    closeVideoModal();
    onClose();
  };

  const formatTime = (date: string) => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const currentVideo = videos[currentVideoIndex];

  if (!visible || videos.length === 0) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Image
            source={require("@/assets/images/icon/cross.png")}
            style={styles.closeButtonIcon}
          />
        </TouchableOpacity>

        {/* User Info Overlay */}
        {currentVideo && (
          <View style={styles.userOverlay}>
            <CachedImage
              uri={currentVideo.user.profileThumbnailUrl || ""}
              cachePolicy="profile-thumbnail"
              style={styles.userAvatar}
              fallbackSource={undefined}
              showLoading={true}
              loadingColor="#666"
            />

            <View>
              <Text style={styles.username}>{currentVideo.user.username}</Text>

              <Text style={styles.timestamp}>
                {formatTime(currentVideo.createdAt.toISOString())}
              </Text>
            </View>
          </View>
        )}

        <VideoCarousel
          videos={videos}
          initialIndex={currentVideoIndex}
          onIndexChange={handleIndexChange}
        />

        <View style={styles.shareSection}>
          <Image
            source={require("@/assets/images/icon/white-share.png")}
            style={styles.shareIcon}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
});
