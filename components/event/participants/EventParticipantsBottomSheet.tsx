// Updated components/event/EventParticipantsBottomSheet.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEventParticipants } from "@/contexts/EventParticipantsContext";
import ParticipantListItem from "@/components/event/participants/ParticipantListItem";

interface EventParticipantsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.61;

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

  // Simple animation values
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Open animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(BOTTOM_SHEET_HEIGHT);
      opacity.setValue(0);
    }
  }, [visible, translateY, opacity]);

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

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: BOTTOM_SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

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
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={[styles.backdrop, { opacity }]}
          activeOpacity={1}
          onPress={closeSheet}
        />

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: BOTTOM_SHEET_HEIGHT,
              transform: [{ translateY }],
            },
          ]}
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
        </Animated.View>
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
  },
  bottomSheet: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
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
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    padding: 8,
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
