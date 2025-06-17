// components/event/EventHeader.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { EventDetail } from "@/hooks/useEventDetail";

interface EventHeaderProps {
  event: EventDetail;
  onBack: () => void;
}

const { width } = Dimensions.get("window");

export default function EventHeader({ event, onBack }: EventHeaderProps) {
  const formatEventDate = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffInHours =
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If event is happening now (within 24 hours from now)
    if (diffInHours > 0 && diffInHours <= 24) {
      return "NOW";
    }

    // If event is in the past or future, show the date
    return eventDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={
          event.photoUrl
            ? { uri: event.photoUrl }
            : require("@/assets/images/react-logo.png") // Default placeholder
        }
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Event Info Overlay */}
        <View style={styles.overlay}>
          <Text style={styles.eventTitle}>{event.name}</Text>
          <Text style={styles.eventDate}>{formatEventDate(event.date)}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: width,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageStyle: {
    backgroundColor: "#333", // Fallback color
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
  },
});
