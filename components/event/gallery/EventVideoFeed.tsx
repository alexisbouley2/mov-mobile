import React from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import { VideoViewerModal } from "./modal";
import VideoGridItem from "./VideoGridItem";
import {
  LoadingState,
  LoadingFooter,
  ErrorState,
  EmptyState,
} from "./VideoFeedStates";
import { useEventVideos } from "@/contexts/event/EventVideosContext";

interface EventVideoFeedProps {
  eventDate: Date;
}

export default function EventVideoFeed({ eventDate }: EventVideoFeedProps) {
  const {
    videos,
    loading,
    loadingMore,
    loadMoreVideos,
    refreshVideos,
    openVideoModal,
    modalVisible,
    error,
  } = useEventVideos();

  // Check if event is in the future (allow uploads)
  const isEventFuture = new Date() < eventDate;

  const handleLoadMore = () => {
    loadMoreVideos();
  };

  const handleRefresh = () => {
    refreshVideos();
  };

  const handleVideoPress = (index: number) => {
    openVideoModal(index);
  };

  const renderVideoItem = ({ item, index }: { item: any; index: number }) => (
    <VideoGridItem item={item} index={index} onPress={handleVideoPress} />
  );

  const renderFooter = () => {
    return loadingMore ? <LoadingFooter /> : null;
  };

  const renderEmpty = () => {
    return loading ? null : <EmptyState />;
  };

  // Show warning if event is in the future
  if (isEventFuture) {
    return (
      <View style={styles.container}>
        <Text style={styles.warningText}>
          Wait for the event to start to give your POV
        </Text>
      </View>
    );
  }

  // Early returns for loading and error states
  if (loading && videos.length === 0) {
    return <LoadingState />;
  }

  if (error && videos.length === 0) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />

      <VideoViewerModal visible={modalVisible} videos={videos} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  warningText: {
    fontSize: 24,
    color: "#808080",
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: "center",
    fontWeight: "600",
  },
});
