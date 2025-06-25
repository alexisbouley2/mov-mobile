import { Ionicons } from "@expo/vector-icons";
import { FlashMode } from "expo-camera";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface CameraControlsProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  isRecording: boolean;
  flashMode: FlashMode;
  recordingProgress: number;
}

export default function CameraControls({
  onStartRecording,
  onStopRecording,
  onToggleCamera,
  onToggleFlash,
  isRecording,
  flashMode,
  recordingProgress,
}: CameraControlsProps) {
  const getFlashIcon = () => {
    switch (flashMode) {
      case "on":
        return "flash";
      case "off":
      default:
        return "flash-off";
    }
  };

  // Calculate camembert (pie slice) for progress
  const outerRadius = 42;
  const centerX = 47;
  const centerY = 47;

  // Calculate angle in radians (0 to 2π)
  const angle = recordingProgress * 2 * Math.PI;

  // Create SVG path for the pie slice (camembert)
  const createPieSlicePath = (
    centerX: number,
    centerY: number,
    radius: number,
    angle: number
  ) => {
    if (angle === 0) return "";

    const startX = centerX;
    const startY = centerY - radius;
    const endX = centerX + radius * Math.sin(angle);
    const endY = centerY - radius * Math.cos(angle);
    const largeArcFlag = angle > Math.PI ? 1 : 0;

    return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  const pieSlicePath = createPieSlicePath(
    centerX,
    centerY,
    outerRadius - 2.5,
    angle
  );

  return (
    <View style={styles.controlsContainer}>
      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity onPress={onToggleCamera}>
          {!isRecording && (
            <Ionicons name="camera-reverse" size={32} color="white" />
          )}
        </TouchableOpacity>

        {/* Capture Button */}
        <View style={styles.captureButtonContainer}>
          <View style={styles.captureButtonWrapper}>
            {/* Base White Circle */}
            <Svg width="94" height="94" style={styles.progressCircle}>
              <Circle
                cx="47"
                cy="47"
                r={outerRadius}
                stroke="white"
                strokeWidth="5"
                fill="none"
              />
            </Svg>

            {/* Red Camembert (pie slice) inside the circle when recording */}
            {isRecording && recordingProgress > 0 && (
              <Svg width="94" height="94" style={styles.progressCircle}>
                <Path d={pieSlicePath} fill="#ff3333" />
              </Svg>
            )}

            {/* The touchable area */}
            <TouchableOpacity
              style={styles.captureButtonOuter}
              onPressIn={onStartRecording}
              onPressOut={onStopRecording}
              activeOpacity={0.8}
            />
          </View>
        </View>

        {/* Camera Toggle Flash Button */}
        <TouchableOpacity onPress={onToggleFlash}>
          {!isRecording && (
            <Ionicons name={getFlashIcon()} size={32} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },

  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 60,
  },

  captureButtonContainer: {
    alignItems: "center",
  },
  captureButtonWrapper: {
    position: "relative",
    width: 94,
    height: 94,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircle: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  captureButtonOuter: {
    width: 94,
    height: 94,
    borderRadius: 47,
    position: "absolute",
    top: 0,
    left: 0,
  },
});
