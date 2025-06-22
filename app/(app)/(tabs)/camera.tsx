// app/(tabs)/index.tsx

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
import { useFocusEffect } from "@react-navigation/native";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useUserProfile } from "@/contexts/UserProfileContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraScreen() {
  useDebugLifecycle("CameraScreen");

  const MAX_VIDEO_DURATION: number = 6;
  const { user } = useUserProfile();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const cameraRef = useRef<CameraViewType>(null);
  const recordingStartTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (!microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [cameraPermission, microphonePermission]);

  // Cleanup when screen loses focus (tab switch)
  useFocusEffect(
    React.useCallback(() => {
      // When screen gains focus, activate camera
      setIsCameraActive(true);

      return () => {
        // Use refs to get current values instead of closure
        if (cameraRef.current) {
          cameraRef.current.stopRecording();
        }
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        // Reset state
        setIsRecording(false);
        setRecordingDuration(0);
        recordingStartTime.current = null;

        // Deactivate camera when screen loses focus
        setIsCameraActive(false);
      };
    }, [])
  );

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    recordingStartTime.current = Date.now();

    const updateProgress = () => {
      if (!recordingStartTime.current) return;

      const elapsed = (Date.now() - recordingStartTime.current) / 1000;
      setRecordingDuration(elapsed);

      if (elapsed >= MAX_VIDEO_DURATION) {
        stopRecording();
        return;
      }

      rafId.current = requestAnimationFrame(updateProgress);
    };

    rafId.current = requestAnimationFrame(updateProgress);

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

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
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
        userId={user?.id || ""}
      />
    );
  }

  const recordingProgress = Math.min(recordingDuration / MAX_VIDEO_DURATION, 1);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.cameraWrapper}>
        <StatusBar hidden />
        {isCameraActive ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
            flash={flashMode}
            enableTorch={isRecording && flashMode === "on"} // torch for video
            mode="video"
          />
        ) : (
          <View style={styles.camera} />
        )}

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
