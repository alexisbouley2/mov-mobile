import React, { useState, useEffect } from "react";
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
import { config } from "@/lib/config";

const { width } = Dimensions.get("window");
const GRID_PADDING = 15; // Increased padding from screen edges
const ITEM_SPACING = 10; // Spacing between thumbnails
const ITEM_SIZE = (width - GRID_PADDING * 2 - ITEM_SPACING * 2) / 3; // 3 columns with proper spacing

interface VideoItem {
  id: string;
  videoPath: string;
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

interface VideoFeedResponse {
  success: boolean;
  videos: VideoItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface EventVideoFeedProps {
  eventId: string;
  userId: string;
  filterByUser?: boolean; // If true, show only current user's videos
}

const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

export default function EventVideoFeed({
  eventId,
  userId,
  filterByUser = false,
}: EventVideoFeedProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  const fetchVideos = async (cursor?: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(null);
      } else if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams({
        limit: "20",
        ...(cursor && { cursor }),
        ...(filterByUser && { userId }),
      });

      const response = await fetch(
        `${API_BASE_URL}/videos/feed/${eventId}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data: VideoFeedResponse = await response.json();

      if (isRefresh) {
        setVideos(data.videos);
      } else {
        setVideos((prev) => (cursor ? [...prev, ...data.videos] : data.videos));
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch videos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [eventId, filterByUser]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchVideos(nextCursor);
    }
  };

  const handleRefresh = () => {
    fetchVideos(undefined, true);
  };

  const handleVideoPress = (index: number) => {
    setSelectedVideoIndex(index);
    setModalVisible(true);
  };

  const renderVideoItem = ({
    item,
    index,
  }: {
    item: VideoItem;
    index: number;
  }) => {
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

          {/* Play indicator */}
          <View style={styles.playIndicator}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
        </View>

        {/* User info */}
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
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {filterByUser
            ? "You haven't uploaded any videos yet"
            : "No videos in this event yet"}
        </Text>
      </View>
    );
  };

  if (loading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchVideos()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />

      {/* Full Screen Video Modal */}
      <VideoViewerModal
        visible={modalVisible}
        videos={videos}
        initialIndex={selectedVideoIndex}
        onClose={() => setModalVisible(false)}
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
