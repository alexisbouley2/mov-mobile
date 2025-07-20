import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useEventParticipants } from "@/contexts/EventParticipantsContext";
import ParticipantListItem from "@/components/event/participants/ParticipantListItem";
import ParticipantsHeader from "@/components/event/participants/ParticipantsHeader";
import ParticipantsTabHeader from "@/components/event/participants/ParticipantsTabHeader";
import { useParticipantsSwipe } from "@/hooks/event/useParticipantsSwipe";
import { Participant } from "@movapp/types";

const EDGE_THRESHOLD = 20; // Pixels from left edge to ignore gestures

export default function ParticipantsScreen() {
  const {
    confirmedParticipants,
    unconfirmedParticipants,
    confirmedLoading,
    unconfirmedLoading,
    confirmedHasMore,
    unconfirmedHasMore,
    loadMoreConfirmedParticipants,
    loadMoreUnconfirmedParticipants,
    loadBothParticipants,
    currentEventId,
  } = useEventParticipants();

  const {
    activeTab,
    handleTabPress,
    gestureHandler,
    animatedStyle,
    SCREEN_WIDTH: screenWidth,
  } = useParticipantsSwipe();

  // Load participants when screen opens
  useEffect(() => {
    if (currentEventId) {
      loadBothParticipants(currentEventId);
    }
  }, [currentEventId]);

  // Dynamic styles that depend on screenWidth
  const dynamicStyles = {
    swipeableContainer: {
      flex: 1,
      flexDirection: "row" as const,
      width: screenWidth * 2 - EDGE_THRESHOLD,
    },
    confirmedTabContent: {
      width: screenWidth - EDGE_THRESHOLD,
    },
    invitedTabContent: {
      width: screenWidth,
      paddingLeft: EDGE_THRESHOLD,
    },
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <ParticipantListItem participant={item} />
  );

  const renderFooter = (loading: boolean, hasMore: boolean) => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        {loading ? <ActivityIndicator size="small" color="#666" /> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ParticipantsHeader />

      {/* Tabs */}
      <ParticipantsTabHeader
        activeTab={activeTab}
        onTabPress={handleTabPress}
        confirmedCount={confirmedParticipants.length}
        unconfirmedCount={unconfirmedParticipants.length}
      />

      {/* Swipeable Content */}
      <View style={styles.swipeableWrapper}>
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          activeOffsetX={[-10, 10]} // Only activate for horizontal gestures
          failOffsetY={[-20, 20]} // Fail if vertical gesture is detected
          shouldCancelWhenOutside={true}
          enableTrackpadTwoFingerGesture={false}
        >
          <Animated.View
            style={[dynamicStyles.swipeableContainer, animatedStyle]}
          >
            {/* Confirmed Participants */}
            <View style={dynamicStyles.confirmedTabContent}>
              <FlatList
                data={confirmedParticipants}
                renderItem={renderParticipant}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMoreConfirmedParticipants}
                onEndReachedThreshold={0.1}
                ListFooterComponent={() =>
                  renderFooter(confirmedLoading, confirmedHasMore)
                }
                showsVerticalScrollIndicator={false}
                bounces={true}
                ListEmptyComponent={
                  !confirmedLoading ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        No confirmed participants yet
                      </Text>
                    </View>
                  ) : null
                }
              />
            </View>

            {/* Invited Participants */}
            <View style={dynamicStyles.invitedTabContent}>
              <FlatList
                data={unconfirmedParticipants}
                renderItem={renderParticipant}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMoreUnconfirmedParticipants}
                onEndReachedThreshold={0.1}
                ListFooterComponent={() =>
                  renderFooter(unconfirmedLoading, unconfirmedHasMore)
                }
                showsVerticalScrollIndicator={false}
                bounces={true}
                ListEmptyComponent={
                  !unconfirmedLoading ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        No invited participants yet
                      </Text>
                    </View>
                  ) : null
                }
              />
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  swipeableWrapper: {
    flex: 1,
    paddingLeft: EDGE_THRESHOLD,
    borderWidth: 0,
    borderColor: "red",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});
