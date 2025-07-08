// app/(tabs)/index.tsx

import CameraControls from "@/components/camera/CameraControls";
import { CameraView } from "expo-camera";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useCamera } from "@/hooks/media/useCamera";
import { useTabContext } from "@/hooks/tab/useTabContext";
import log from "@/utils/logger";

export default function CameraScreen() {
  useDebugLifecycle("CameraScreen");

  const { user } = useUserProfile();
  const { isTabActive } = useTabContext();
  const isCameraTabActive = isTabActive(1); // Camera tab is at index 1

  const {
    cameraPermission,
    microphonePermission,
    cameraType,
    flashMode,
    isRecording,
    isCameraActive,
    recordingProgress,
    cameraRef,
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlash,
    activateCamera,
    deactivateCamera,
  } = useCamera(user?.id);

  // Activate/deactivate camera based on tab visibility
  useEffect(() => {
    if (isCameraTabActive) {
      log.info("Camera tab became active - activating camera");
      activateCamera();
    } else {
      log.info("Camera tab became inactive - deactivating camera");
      deactivateCamera();
    }
  }, [isCameraTabActive, activateCamera, deactivateCamera]);

  if (!cameraPermission || !microphonePermission)
    return <View style={styles.container} />;
  if (!cameraPermission.granted) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.CTAContainer}>
        <Image
          source={require("@/assets/images/logo/start-a-pov.png")}
          style={styles.CTAImage}
        />
      </View>

      {/* Only render camera when this tab is active */}
      {isCameraTabActive && isCameraActive ? (
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

      {/* Only show camera controls when this tab is active */}
      {isCameraTabActive && (
        <CameraControls
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onToggleCamera={toggleCameraType}
          onToggleFlash={toggleFlash}
          isRecording={isRecording}
          flashMode={flashMode}
          recordingProgress={recordingProgress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
