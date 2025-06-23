// Updated components/event/EventParticipantsBottomSheet.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEventParticipants } from "@/contexts/EventParticipantsContext";
import { useBottomSheet } from "@/hooks/event/useBottomSheet";
import ParticipantListItem from "../ParticipantListItem";

interface EventParticipantsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function EventParticipantsBottomSheet({
  visible,
  onClose,
}: EventParticipantsBottomSheetProps) {
  const {
    bottomSheetParticipants,
    bottomSheetLoading,
    hasMore,
    totalCount,
    loadBottomSheetParticipants,
    loadMoreParticipants,
    currentEventId,
  } = useEventParticipants();

  const { translateY, opacity, panResponder, closeSheet, BOTTOM_SHEET_HEIGHT } =
    useBottomSheet(visible, onClose);

  // Load participants when bottom sheet opens
  useEffect(() => {
    if (visible && currentEventId && bottomSheetParticipants.length === 0) {
      loadBottomSheetParticipants(currentEventId);
    }
  }, [
    visible,
    currentEventId,
    bottomSheetParticipants.length,
    loadBottomSheetParticipants,
  ]);

  const renderParticipant = ({ item, index }: { item: any; index: number }) => (
    <ParticipantListItem
      participant={item}
      isLast={index === bottomSheetParticipants.length - 1}
    />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#666" />
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={[styles.backdrop, { opacity }]}
          activeOpacity={1}
          onPress={closeSheet}
        />

        <View
          style={[
            styles.bottomSheet,
            { height: BOTTOM_SHEET_HEIGHT, transform: [{ translateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Participants ({totalCount})</Text>
            <TouchableOpacity onPress={closeSheet} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {bottomSheetLoading && bottomSheetParticipants.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading participants...</Text>
            </View>
          ) : (
            <FlatList
              data={bottomSheetParticipants}
              renderItem={renderParticipant}
              keyExtractor={(item) => item.id}
              style={styles.participantsList}
              contentContainerStyle={styles.scrollContent}
              onEndReached={loadMoreParticipants}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              showsVerticalScrollIndicator={false}
              bounces={true}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
    alignSelf: "center",
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    marginTop: 10,
    fontSize: 14,
  },
  participantsList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
});
