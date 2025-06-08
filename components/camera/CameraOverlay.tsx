import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface CameraOverlayProps {
  isRecording: boolean;
  recordingDuration: number;
}

export default function CameraOverlay({
  isRecording,
  recordingDuration,
}: CameraOverlayProps) {
  const [pulseAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation for recording indicator
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(pulse);
      };
      pulse();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isRecording, pulseAnimation]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.overlay}>
      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingHeader}>
          <Animated.View
            style={[styles.recordingDot, { opacity: pulseAnimation }]}
          />
          <Text style={styles.recordingText}>REC</Text>
          <Text style={styles.recordingDuration}>
            {formatDuration(recordingDuration)}
          </Text>
        </View>
      )}

      {/* Grid Lines (optional) */}
      <View style={styles.gridContainer}>
        {/* Horizontal lines */}
        <View
          style={[styles.gridLine, styles.horizontalLine, { top: "33.33%" }]}
        />
        <View
          style={[styles.gridLine, styles.horizontalLine, { top: "66.66%" }]}
        />

        {/* Vertical lines */}
        <View
          style={[styles.gridLine, styles.verticalLine, { left: "33.33%" }]}
        />
        <View
          style={[styles.gridLine, styles.verticalLine, { left: "66.66%" }]}
        />
      </View>

      {/* Focus Ring (could be animated on tap) */}
      <View style={styles.focusRing} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },
  recordingHeader: {
    position: "absolute",
    top: 60,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4444",
    marginRight: 6,
  },
  recordingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  recordingDuration: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  flashIndicator: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0, // TODO: choose whether to toggle it or not. Hidden by default, could be toggled
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  focusRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "transparent",
    // This would be positioned dynamically based on tap location
  },
});
