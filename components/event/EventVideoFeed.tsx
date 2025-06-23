// Updated components/event/EventVideoFeed.tsx
import React from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import VideoViewerModal from "./VideoViewerModal";
import { useEventVideos } from "@/contexts/EventVideosContext";

const { width } = Dimensions.get("window");
const GRID_PADDING = 15;
const ITEM_SPACING = 10;
const ITEM_SIZE = (width - GRID_PADDING * 2 - ITEM_SPACING * 2) / 3;

export default function EventVideoFeed() {
  const {
    allVideos,
    userVideos,
    allVideosLoading,
    userVideosLoading,
    allVideosLoadingMore,
    userVideosLoadingMore,
    // allVideosHasMore,
    // userVideosHasMore,
    loadMoreAllVideos,
    loadMoreUserVideos,
    refreshAllVideos,
    refreshUserVideos,
    openVideoModal,
    modalVisible,
    currentVideoIndex,
    activeTab,
    error,
  } = useEventVideos();

  // Get current videos based on active tab from context
  const currentVideos = activeTab === "all" ? allVideos : userVideos;
  const isLoading = activeTab === "all" ? allVideosLoading : userVideosLoading;
  const isLoadingMore =
    activeTab === "all" ? allVideosLoadingMore : userVideosLoadingMore;
  // const hasMore = activeTab === "all" ? allVideosHasMore : userVideosHasMore;

  const handleLoadMore = () => {
    if (activeTab === "all") {
      loadMoreAllVideos();
    } else {
      loadMoreUserVideos();
    }
  };

  const handleRefresh = () => {
    if (activeTab === "all") {
      refreshAllVideos();
    } else {
      refreshUserVideos();
    }
  };

  const handleVideoPress = (index: number) => {
    openVideoModal(index, activeTab);
  };

  const renderVideoItem = ({ item, index }: { item: any; index: number }) => {
    const isLeftColumn = index % 3 === 0;
    const isRightColumn = index % 3 === 2;

    return (
      <TouchableOpacity
        style={[
          styles.videoItem,
          !isLeftColumn && !isRightColumn && styles.videoItemCenter,
        ]}
        onPress={() => handleVideoPress(index)}
        activeOpacity={0.8}
      >
        <View style={styles.videoContainer}>
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            transition={200}
          />

          <View style={styles.playIndicator}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                item.user.photo || "https://via.placeholder.com/24/666/666.png",
            }}
            style={styles.userAvatar}
            contentFit="cover"
          />
          <Text style={styles.username} numberOfLines={1}>
            {item.user.username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {activeTab === "you"
            ? "You haven't uploaded any videos yet"
            : "No videos in this event yet"}
        </Text>
      </View>
    );
  };

  if (isLoading && currentVideos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error && currentVideos.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currentVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />

      <VideoViewerModal
        visible={modalVisible}
        videos={currentVideos}
        initialIndex={currentVideoIndex}
        onClose={() => {}}
        onIndexChange={(_index) => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  videoItem: {
    width: ITEM_SIZE,
    marginBottom: 15,
  },
  videoItemCenter: {
    marginHorizontal: ITEM_SPACING / 2,
  },
  videoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#111",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 12,
    color: "#000",
    marginLeft: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  userAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  username: {
    flex: 1,
    fontSize: 12,
    color: "#ccc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#666",
    marginTop: 10,
    fontSize: 14,
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});
