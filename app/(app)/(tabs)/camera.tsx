// app/(tabs)/index.tsx

import CameraControls from "@/components/camera/CameraControls";
import MediaPreview from "@/components/camera/MediaPreview";
import { CameraView } from "expo-camera";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useCamera } from "@/hooks/camera/useCamera";
import { TAB_BAR_HEIGHT } from "./_layout";

export default function CameraScreen() {
  useDebugLifecycle("CameraScreen");

  const { user } = useUserProfile();
  const {
    cameraPermission,
    microphonePermission,
    cameraType,
    flashMode,
    isRecording,
    capturedMedia,
    isCameraActive,
    recordingProgress,
    cameraRef,
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlash,
    dismissPreview,
  } = useCamera();

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

  return (
    <View style={styles.container}>
      <View style={styles.CTAContainer}>
        <Image
          source={require("@/assets/images/logo/start-a-pov.png")}
          style={styles.CTAImage}
        />
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: TAB_BAR_HEIGHT,
  },
  camera: {
    flex: 1,
  },
  CTAContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 30,
  },
  CTAImage: {
    width: 150,
    height: 150,
    zIndex: 1000,
  },
});
