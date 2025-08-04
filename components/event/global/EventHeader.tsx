// components/event/EventHeader.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CachedImage } from "@/components/ui/CachedImage";
import { EventWithDetails } from "@movapp/types";
import { Ionicons } from "@expo/vector-icons";
import ThreeDotsButton from "@/components/ui/button/ThreeDotsButton";

interface EventHeaderProps {
  event: EventWithDetails;
  onBack: () => void;
  onLeave?: () => void;
  isAdmin?: boolean;
}

const { width } = Dimensions.get("window");

export default function EventHeader({
  event,
  onBack,
  onLeave,
  isAdmin = false,
}: EventHeaderProps) {
  // Calculate height based on 1:1 aspect ratio using full screen width
  const containerHeight = width;

  const formatEventDate = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffInHours =
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If event is happening now (within 24 hours from now)
    if (diffInHours > 0 && diffInHours <= 24) {
      return "NOW";
    }

    // Format date part
    const datePart = eventDate
      .toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replaceAll("/", ".");

    // Format time part
    const timePart = eventDate
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();

    return `${datePart} - ${timePart}`;
  };

  const handleLeavePress = () => {
    Alert.alert("Leave Event", "Are you sure you want to leave this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Leave",
        style: "destructive",
        onPress: onLeave,
      },
    ]);
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Background Image */}
      {event.coverImageUrl ? (
        <CachedImage
          uri={event.coverImageUrl}
          cachePolicy="cover-image"
          style={styles.backgroundImage}
          showLoading={true}
          loadingColor="#666"
        />
      ) : (
        <Image
          source={require("@/assets/images/logo/quick-mov-background-expanded.png")}
          style={styles.backgroundImage}
        />
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.1)",
          "rgba(0,0,0,0.2)",
          "rgba(0,0,0,0.3)",
          "rgba(0,0,0,0.4)",
          "rgba(0,0,0,0.5)",
          "rgba(0,0,0,0.6)",
          "rgba(0,0,0,0.7)",
          "rgba(0,0,0,0.8)",
          "rgba(0,0,0,0.9)",
          "rgba(0,0,0,1)",
        ]}
        locations={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]}
        style={styles.gradientOverlay}
      />

      {/* Header with buttons */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={36} color="#007AFF" />
        </TouchableOpacity>

        {/* Three Dots Button for non-admin users */}
        {!isAdmin && onLeave && (
          <ThreeDotsButton
            onPress={handleLeavePress}
            style={styles.threeDotsButton}
          />
        )}
      </View>

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.name}</Text>
          <Text style={styles.eventDate}>
            {formatEventDate(event.date.toISOString())}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  contentOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  threeDotsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    alignItems: "center",
    padding: 10,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  eventDate: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    opacity: 0.9,
  },
});
