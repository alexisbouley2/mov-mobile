import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import VideoViewerModal from "./VideoViewerModal";
import VideoGridItem from "./VideoGridItem";
import {
  LoadingState,
  LoadingFooter,
  ErrorState,
  EmptyState,
} from "./VideoFeedStates";
import { useEventVideos } from "@/contexts/EventVideosContext";

const GRID_PADDING = 15;

export default function EventVideoFeed() {
  const {
    allVideos,
    userVideos,
    allVideosLoading,
    userVideosLoading,
    allVideosLoadingMore,
    userVideosLoadingMore,
    loadMoreAllVideos,
    loadMoreUserVideos,
    refreshAllVideos,
    refreshUserVideos,
    openVideoModal,
    modalVisible,
    activeTab,
    error,
  } = useEventVideos();

  // Get current videos based on active tab from context
  const currentVideos = activeTab === "all" ? allVideos : userVideos;
  const isLoading = activeTab === "all" ? allVideosLoading : userVideosLoading;
  const isLoadingMore =
    activeTab === "all" ? allVideosLoadingMore : userVideosLoadingMore;

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

  const renderVideoItem = ({ item, index }: { item: any; index: number }) => (
    <VideoGridItem item={item} index={index} onPress={handleVideoPress} />
  );

  const renderFooter = () => {
    return isLoadingMore ? <LoadingFooter /> : null;
  };

  const renderEmpty = () => {
    return isLoading ? null : <EmptyState activeTab={activeTab} />;
  };

  // Early returns for loading and error states
  if (isLoading && currentVideos.length === 0) {
    return <LoadingState />;
  }

  if (error && currentVideos.length === 0) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
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
        onClose={() => {}}
        onIndexChange={() => {}}
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
});
