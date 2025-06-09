import CameraControls from "@/components/camera/CameraControls";
import CameraOverlay from "@/components/camera/CameraOverlay";
import MediaPreview from "@/components/camera/MediaPreview";
import type { CameraView as CameraViewType } from "expo-camera";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | undefined
  >();

  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaType, setMediaType] = useState<"photo" | "video" | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);

  const cameraRef = useRef<CameraViewType>(null);

  useEffect(() => {
    (async () => {
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (!microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [cameraPermission, microphonePermission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      setCapturedMedia(photo.uri);
      setMediaType("photo");
    } catch (err) {
      console.error("Error taking picture:", err);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
      setCapturedMedia(video?.uri || null);
      setMediaType("video");
    } catch (err) {
      console.error("Recording failed:", err);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!cameraRef.current) return;
    setIsRecording(false);
    cameraRef.current.stopRecording();
  };

  const toggleCameraType = () => {
    if (isRecording) return; // Prevent flipping camera during recording
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
    setMediaType(null);
  };

  if (!cameraPermission || !microphonePermission)
    return <View style={styles.container} />;
  if (!cameraPermission.granted) return <View style={styles.container} />;

  if (capturedMedia) {
    return (
      <MediaPreview
        mediaUri={capturedMedia}
        mediaType={mediaType!}
        onDismiss={dismissPreview}
        onSave={dismissPreview}
      />
    );
  }

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
        <CameraOverlay isRecording={isRecording} recordingDuration={0} />
        <CameraControls
          onTakePicture={takePicture}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onToggleCamera={toggleCameraType}
          onToggleFlash={toggleFlash}
          isRecording={isRecording}
          flashMode={flashMode}
          recordingProgress={0}
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
