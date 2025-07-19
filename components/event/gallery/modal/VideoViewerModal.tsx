import React from "react";
import { View, StyleSheet, Modal } from "react-native";
import VideoCarousel from "./VideoCarousel";
import { useEventVideos, VideoItem } from "@/contexts/EventVideosContext";

interface VideoViewerModalProps {
  visible: boolean;
  videos: VideoItem[];
}

export default function VideoViewerModal({
  visible,
  videos,
}: VideoViewerModalProps) {
  const { currentVideoIndex, setCurrentVideoIndex, closeVideoModal } =
    useEventVideos();

  const handleIndexChange = (index: number) => {
    setCurrentVideoIndex(index);
  };

  if (!visible || videos.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={closeVideoModal}
    >
      <View style={styles.container}>
        <VideoCarousel
          videos={videos}
          initialIndex={currentVideoIndex}
          onIndexChange={handleIndexChange}
          onClose={closeVideoModal}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
