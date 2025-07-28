import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import VideoCarousel from "@/components/event/gallery/modal/VideoCarousel";
import { useEventVideos } from "@/contexts/event/EventVideosContext";

export default function VideoViewerScreen() {
  const router = useRouter();
  const { initialIndex } = useLocalSearchParams<{ initialIndex: string }>();
  const { videos, currentVideoIndex, setCurrentVideoIndex } = useEventVideos();

  const handleIndexChange = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleClose = () => {
    router.back();
  };

  if (videos.length === 0) {
    return null;
  }

  const startIndex = initialIndex
    ? parseInt(initialIndex, 10)
    : currentVideoIndex;

  return (
    <View style={styles.container}>
      <VideoCarousel
        videos={videos}
        initialIndex={startIndex}
        onIndexChange={handleIndexChange}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
