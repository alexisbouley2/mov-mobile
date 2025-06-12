import CameraControls from "@/components/camera/CameraControls";
import MediaPreview from "@/components/camera/MediaPreview";
import type { CameraView as CameraViewType } from "expo-camera";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraScreen() {
  const MAX_VIDEO_DURATION: number = 6;
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);

  const cameraRef = useRef<CameraViewType>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (!microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [cameraPermission, microphonePermission]);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    recordingStartTime.current = Date.now();

    recordingTimer.current = setInterval(() => {
      if (!recordingStartTime.current) return;
      const elapsed = (Date.now() - recordingStartTime.current) / 1000;
      setRecordingDuration(elapsed);
      if (elapsed >= MAX_VIDEO_DURATION) {
        stopRecording();
      }
    }, 20); // smoother updates every 50ms

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_VIDEO_DURATION,
      });
      setCapturedMedia(video?.uri || null);
    } catch {
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!cameraRef.current) return;
    setIsRecording(false);
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    recordingStartTime.current = null;
    cameraRef.current.stopRecording();
  };

  const toggleCameraType = () => {
    if (isRecording) return; // TODO: check undo it, Prevent flipping camera during recording
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlashMode((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "off";
        default:
          return "off";
      }
    });
  };

  const dismissPreview = () => {
    setCapturedMedia(null);
  };

  if (!cameraPermission || !microphonePermission)
    return <View style={styles.container} />;
  if (!cameraPermission.granted) return <View style={styles.container} />;

  if (capturedMedia) {
    return (
      <MediaPreview
        mediaUri={capturedMedia}
        onDismiss={dismissPreview}
        onSave={dismissPreview}
      />
    );
  }

  const recordingProgress = Math.min(recordingDuration / MAX_VIDEO_DURATION, 1);
  console.log("recordingProgress", recordingProgress);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.cameraWrapper}>
        <StatusBar hidden />
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          enableTorch={isRecording && flashMode === "on"} // torch for video
          mode="video"
        />

        <CameraControls
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onToggleCamera={toggleCameraType}
          onToggleFlash={toggleFlash}
          isRecording={isRecording}
          flashMode={flashMode}
          recordingProgress={recordingProgress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  cameraWrapper: {
    flex: 1,
    marginBottom: 80,
  },
});
