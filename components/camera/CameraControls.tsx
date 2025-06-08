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

interface CameraControlsProps {
  onTakePicture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  isRecording: boolean;
  flashMode: FlashMode;
}

export default function CameraControls({
  onTakePicture,
  onStartRecording,
  onStopRecording,
  onToggleCamera,
  onToggleFlash,
  isRecording,
  flashMode,
}: CameraControlsProps) {
  const [pressAnimation] = React.useState(new Animated.Value(1));

  const handleCapturePress = () => {
    if (isRecording) {
      console.log("Stop recording");
      onStopRecording();
    } else {
      onTakePicture();
    }
  };

  const handleCaptureLongPress = () => {
    if (!isRecording) {
      // Animate button press
      Animated.sequence([
        Animated.timing(pressAnimation, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      onStartRecording();
    }
  };

  const handleCaptureRelease = () => {
    if (isRecording) {
      Animated.timing(pressAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      onStopRecording();
    }
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case "on":
        return "flash";
      case "auto":
        return "flash-outline";
      case "off":
      default:
        return "flash-off";
    }
  };

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
        <TouchableOpacity style={styles.galleryButton}>
          <View style={styles.galleryThumbnail}>
            <Ionicons name="images" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {/* Capture Button */}
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity
            style={styles.captureButtonOuter}
            onPress={handleCapturePress}
            onLongPress={handleCaptureLongPress}
            onPressOut={handleCaptureRelease}
            delayLongPress={200}
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
              {isRecording && <View style={styles.recordingIndicator} />}
            </Animated.View>
          </TouchableOpacity>

          {/* Hold for video hint */}
          {!isRecording && (
            <Text style={styles.captureHint}>Hold for video</Text>
          )}
        </View>

        {/* Camera Flip Button */}
        <TouchableOpacity style={styles.flipButton} onPress={onToggleCamera}>
          <Ionicons name="camera-reverse" size={32} color="white" />
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
