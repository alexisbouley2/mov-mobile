import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Participant {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    photoThumbnailUrl: string | null | undefined;
  };
  joinedAt: string;
}

interface EventParticipantsBottomSheetProps {
  visible: boolean;
  participants: Participant[];
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export default function EventParticipantsBottomSheet({
  visible,
  participants,
  onClose,
}: EventParticipantsBottomSheetProps) {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  // Pan responder pour le geste de swipe
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Active le pan responder si le mouvement vertical est significatif
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // Arrête toute animation en cours
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        // Limite le mouvement vers le haut (pas au-delà de la position fermée)
        const newValue = Math.max(0, gestureState.dy);
        translateY.setValue(newValue);
        lastGestureDy.current = gestureState.dy;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        // Ferme si on dépasse le seuil ou si la vélocité est suffisante
        if (dy > SWIPE_THRESHOLD || vy > SWIPE_VELOCITY_THRESHOLD) {
          closeSheet();
        } else {
          // Retour à la position ouverte
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Animation d'ouverture plus fluide
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
    }
  }, [visible, translateY, opacity]);

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

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderParticipantAvatar = (
    participant: Participant,
    size: number = 50
  ) => {
    if (participant.user.photoThumbnailUrl) {
      return (
        <Image
          source={{ uri: participant.user.photoThumbnailUrl }}
          style={[
            styles.participantImage,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      );
    }
    return (
      <View
        style={[
          styles.avatarPlaceholder,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
          {participant.user.username.charAt(0).toUpperCase()}
        </Text>
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
        {/* Backdrop avec animation d'opacité */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={closeSheet}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              Participants ({participants.length})
            </Text>
            <TouchableOpacity onPress={closeSheet} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Participants List */}
          <ScrollView
            style={styles.participantsList}
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={styles.scrollContent}
          >
            {participants.map((participant, index) => (
              <View key={participant.id} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  {renderParticipantAvatar(participant, 50)}
                  <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>
                      {participant.user.username}
                    </Text>
                    <Text style={styles.participantJoinDate}>
                      Joined {formatJoinedDate(participant.joinedAt)}
                    </Text>
                  </View>
                </View>
                {index < participants.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </ScrollView>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    height: BOTTOM_SHEET_HEIGHT,
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
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  participantsList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  participantItem: {
    paddingVertical: 12,
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  participantDetails: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  participantJoinDate: {
    fontSize: 14,
    color: "#999",
  },
  separator: {
    height: 1,
    backgroundColor: "#333",
    marginTop: 12,
  },
});
