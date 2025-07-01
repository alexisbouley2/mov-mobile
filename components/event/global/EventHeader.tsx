// components/event/EventHeader.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CachedImage } from "@/components/ui/CachedImage";
import { EventDetail } from "@/contexts/EventContext";
import { Ionicons } from "@expo/vector-icons";

interface EventHeaderProps {
  event: EventDetail;
  onBack: () => void;
}

const { width } = Dimensions.get("window");

export default function EventHeader({ event, onBack }: EventHeaderProps) {
  // Calculate height based on 16:9 aspect ratio using full screen width
  const containerHeight = (width * 9) / 16;

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

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Background Image */}
      {event.coverImageUrl ? (
        <CachedImage
          uri={event.coverImageUrl}
          cachePolicy="cover-image"
          style={styles.backgroundImage}
          fallbackSource={require("@/assets/images/react-logo.png")}
          showLoading={true}
          loadingColor="#666"
        />
      ) : (
        <View style={[styles.backgroundImage, styles.fallbackBackground]} />
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

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={32} color="#007AFF" />
        </TouchableOpacity>

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.name}</Text>
          <Text style={styles.eventDate}>{formatEventDate(event.date)}</Text>
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
  fallbackBackground: {
    backgroundColor: "#000",
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
  contentOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 5,
    top: 15,
    zIndex: 1,
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
