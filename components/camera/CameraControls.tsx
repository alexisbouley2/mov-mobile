import { Ionicons } from "@expo/vector-icons";
import { FlashMode } from "expo-camera";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CameraControlsProps {
  onTakePicture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  isRecording: boolean;
  flashMode: FlashMode;
  recordingProgress: number;
}

export default function CameraControls({
  onTakePicture,
  onStartRecording,
  onStopRecording,
  onToggleCamera,
  onToggleFlash,
  isRecording,
  flashMode,
  recordingProgress,
}: CameraControlsProps) {
  const [pressAnimation] = React.useState(new Animated.Value(1));
  const [isLongPressing, setIsLongPressing] = React.useState(false);

  const handleCapturePress = () => {
    if (isRecording) {
      onStopRecording();
    } else if (!isLongPressing) {
      // Only take picture if it wasn't a long press
      onTakePicture();
    }
  };

  const handleCaptureLongPress = () => {
    if (!isRecording) {
      setIsLongPressing(true);
      // Animate button press
      Animated.timing(pressAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }).start();
      onStartRecording();
    }
  };

  const handlePressIn = () => {
    // Reset long press flag when starting a new press
    setIsLongPressing(false);
  };

  const handlePressOut = () => {
    // Only stop recording if we were actually recording and long pressing
    if (isRecording && isLongPressing) {
      Animated.timing(pressAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      // onStopRecording();
      setIsLongPressing(false);
    }
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case "on":
        return "flash";
      case "off":
      default:
        return "flash-off";
    }
  };

  // Calculate circle properties for progress
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - recordingProgress);

  return (
    <View style={styles.controlsContainer}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.topButton} onPress={onToggleFlash}>
          <Ionicons name={getFlashIcon()} size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Gallery/Stories placeholder */}
        <View style={styles.galleryButton}>
          {/* <TouchableOpacity style={styles.galleryButton}>
          <View style={styles.galleryThumbnail}>
            <Ionicons name="images" size={20} color="white" />
          </View>
        </TouchableOpacity> */}
        </View>

        {/* Capture Button */}
        <View style={styles.captureButtonContainer}>
          <View style={styles.captureButtonWrapper}>
            {/* Progress Circle - only show when recording */}
            {isRecording && (
              <Svg width="80" height="80" style={styles.progressCircle}>
                {/* Background circle */}
                <Circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="3"
                  fill="none"
                />
                {/* Progress circle */}
                <Circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#ff4444"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </Svg>
            )}

            <TouchableOpacity
              style={styles.captureButtonOuter}
              onPressIn={handlePressIn}
              onPress={handleCapturePress}
              onLongPress={handleCaptureLongPress}
              onPressOut={handlePressOut}
              delayLongPress={200}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.captureButtonInner,
                  {
                    transform: [{ scale: pressAnimation }],
                    backgroundColor: isRecording ? "#ff4444" : "white",
                  },
                ]}
              >
                {/* {isRecording && <View style={styles.recordingIndicator} />} */}
                {isRecording && (
                  <Svg width="65" height="65">
                    <Circle
                      cx="32.5"
                      cy="32.5"
                      r="30"
                      stroke="#ff4444"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={
                        2 * Math.PI * 30 * (1 - recordingProgress)
                      }
                      strokeLinecap="round"
                      transform="rotate(-90 32.5 32.5)"
                    />
                  </Svg>
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Hold for video hint */}
          {!isRecording && (
            <Text style={styles.captureHint}>Hold for video</Text>
          )}
        </View>

        {/* Camera Flip Button */}

        <TouchableOpacity style={styles.flipButton} onPress={onToggleCamera}>
          {!isRecording && (
            <Ionicons name="camera-reverse" size={32} color="white" />
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
    justifyContent: "space-between",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  galleryButton: {
    width: 44,
    height: 44,
  },
  galleryThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  captureButtonContainer: {
    alignItems: "center",
  },
  captureButtonWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  progressCircle: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "white",
  },
  captureHint: {
    color: "white",
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
  flipButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
