// components/camera/CameraControls.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface CameraControlsProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  isRecording: boolean;
  flashMode: "off" | "on";
  recordingProgress: number;
  disabled?: boolean;
  hasVideoCaptured?: boolean;
}

export default function CameraControls({
  onStartRecording,
  onStopRecording,
  onToggleCamera,
  onToggleFlash,
  isRecording,
  flashMode,
  recordingProgress,
  disabled = false,
  hasVideoCaptured = false,
}: CameraControlsProps) {
  // SVG dimensions
  const size = 94;
  const center = size / 2;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const progressRadius = radius - 2.5; // Slightly smaller radius for progress

  // Create pie slice path for progress
  const createProgressPath = () => {
    if (recordingProgress === 0) return "";

    const angle = recordingProgress * 2 * Math.PI - Math.PI / 2; // Start from top
    const startAngle = -Math.PI / 2;

    const x1 = center + progressRadius * Math.cos(startAngle);
    const y1 = center + progressRadius * Math.sin(startAngle);
    const x2 = center + progressRadius * Math.cos(angle);
    const y2 = center + progressRadius * Math.sin(angle);

    const largeArcFlag = recordingProgress > 0.5 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${progressRadius} ${progressRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={styles.controlsContainer}>
      <View style={styles.bottomControls}>
        {/* Camera Flip Button */}
        <TouchableOpacity
          onPress={onToggleCamera}
          disabled={isRecording || disabled || hasVideoCaptured}
          style={[
            styles.sideButton,
            (isRecording || hasVideoCaptured) && styles.hiddenButton,
          ]}
        >
          <Ionicons name="camera-reverse" size={32} color="white" />
        </TouchableOpacity>

        {/* Capture Button */}
        <View
          style={[
            styles.captureButtonContainer,
            (disabled || hasVideoCaptured) && styles.disabledButton,
          ]}
        >
          <Svg width={size} height={size} style={styles.svg}>
            {/* White border circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={
                disabled || hasVideoCaptured ? "rgba(255,255,255,0.3)" : "white"
              }
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Red progress indicator */}
            {isRecording && recordingProgress > 0 && (
              <Path d={createProgressPath()} fill="rgba(255, 51, 51, 0.8)" />
            )}
          </Svg>

          {/* Touchable area */}
          <TouchableOpacity
            style={styles.captureButton}
            onPressIn={onStartRecording}
            onPressOut={onStopRecording}
            activeOpacity={0.8}
            disabled={disabled || hasVideoCaptured}
          />
        </View>

        {/* Flash Toggle Button */}
        <TouchableOpacity
          onPress={onToggleFlash}
          disabled={isRecording || disabled || hasVideoCaptured}
          style={[
            styles.sideButton,
            (isRecording || hasVideoCaptured) && styles.hiddenButton,
          ]}
        >
          <Ionicons
            name={flashMode === "on" ? "flash" : "flash-off"}
            size={32}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  sideButton: {
    padding: 10,
  },
  hiddenButton: {
    opacity: 0,
  },
  captureButtonContainer: {
    position: "relative",
    width: 94,
    height: 94,
  },
  disabledButton: {
    opacity: 0.5,
  },
  svg: {
    position: "absolute",
  },
  captureButton: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
  },
});
