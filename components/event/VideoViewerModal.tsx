import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface VideoItem {
  id: string;
  storagePath: string;
  thumbnailPath: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    photo: string | null;
  };
}

interface VideoViewerModalProps {
  visible: boolean;
  videos: VideoItem[];
  initialIndex: number;
  onClose: () => void;
}

export default function VideoViewerModal({
  visible,
  videos,
  initialIndex,
  onClose,
}: VideoViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const videoRef = useRef<Video>(null);

  // Reset loading state when video changes
  useEffect(() => {
    setLoadingVideo(true);
  }, [currentIndex]);

  // Auto-scroll to initial video when modal opens
  useEffect(() => {
    if (visible && videos.length > 0) {
      setCurrentIndex(initialIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex, videos.length]);

  const handleVideoLoad = () => {
    setLoadingVideo(false);
  };

  const handleVideoError = (error: any) => {
    console.error("Video playback error:", error);
    setLoadingVideo(false);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderVideoItem = ({
    item,
    index,
  }: {
    item: VideoItem;
    index: number;
  }) => {
    const isActive = index === currentIndex;

    return (
      <View style={styles.videoContainer}>
        <View style={styles.videoWrapper}>
          {isActive ? (
            <>
              <Video
                ref={videoRef}
                source={{ uri: item.videoUrl }}
                style={styles.video}
                shouldPlay={true}
                isLooping={true}
                resizeMode={ResizeMode.CONTAIN}
                onLoad={handleVideoLoad}
                onError={handleVideoError}
                onLoadStart={() => setLoadingVideo(true)}
              />

              {/* Loading overlay */}
              {loadingVideo && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            </>
          ) : (
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={styles.video}
              contentFit="contain"
            />
          )}
        </View>

        {/* User info overlay - always visible */}
        <View style={styles.userOverlay}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  item.user.photo ||
                  "https://via.placeholder.com/32/666/666.png",
              }}
              style={styles.userAvatar}
              contentFit="cover"
            />
            <Text style={styles.username}>{item.user.username}</Text>
          </View>

          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {currentIndex + 1} of {videos.length}
          </Text>
        </View>

        {/* Video list */}
        <FlatList
          ref={flatListRef}
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          horizontal={false}
          pagingEnabled={true}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: height - 60, // Account for header height
            offset: (height - 60) * index,
            index,
          })}
          initialScrollIndex={initialIndex}
          onScrollToIndexFailed={(info) => {
            // Fallback if initial scroll fails
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }, 100);
          }}
          snapToInterval={height - 60}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  videoContainer: {
    width: width,
    height: height - 60, // Account for header
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },
  userOverlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "white",
  },
  username: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
