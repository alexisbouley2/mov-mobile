import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const currentVideo = videos[currentVideoIndex];

  if (!visible || videos.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header - Fixed at top with proper z-index */}
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {currentVideoIndex + 1} of {videos.length}
            </Text>

            <View style={styles.spacer} />
          </View>
        </SafeAreaView>

        {/* Video Carousel Container */}
        <View style={styles.carouselContainer}>
          <VideoCarousel
            videos={videos}
            initialIndex={currentVideoIndex}
            onIndexChange={handleIndexChange}
          />

          {/* User Info Overlay - Fixed at bottom */}
          {currentVideo && (
            <View style={styles.userOverlay}>
              <View style={styles.userInfo}>
                <CachedImage
                  uri={currentVideo.user.profileThumbnailUrl || ""}
                  cachePolicy="profile-thumbnail"
                  style={styles.userAvatar}
                  fallbackSource={undefined}
                  showLoading={true}
                  loadingColor="#666"
                />

                <Text style={styles.username}>
                  {currentVideo.user.username}
                </Text>
              </View>

              <Text style={styles.timestamp}>
                {new Date(currentVideo.createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
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
  headerSafeArea: {
    backgroundColor: "#000",
    zIndex: 100, // Ensure header stays on top
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  spacer: {
    width: 44, // Same width as close button for balance
  },
  carouselContainer: {
    flex: 1,
    position: "relative",
  },
  userOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 30,
    zIndex: 10,
    backgroundColor: "linear-gradient(transparent, rgba(0,0,0,0.8))", // Gradient background
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "white",
  },
  username: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
