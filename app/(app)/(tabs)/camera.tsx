// app/(tabs)/index.tsx

import CameraControls from "@/components/camera/CameraControls";
import { Camera } from "react-native-vision-camera";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useCamera } from "@/hooks/media/useCamera";
import { useTab } from "@/contexts/TabContext";
import log from "@/utils/logger";

export default function CameraScreen() {
  useDebugLifecycle("CameraScreen");

  const { user } = useUserProfile();
  const { isTabActive } = useTab();
  const isCameraTabActive = isTabActive(1); // Camera tab is at index 1

  const {
    hasCameraPermission,
    hasMicrophonePermission,
    cameraPosition: _cameraPosition,
    flash,
    isRecording,
    isCameraActive,
    recordingProgress,
    device,
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

  if (!hasCameraPermission || !hasMicrophonePermission)
    return <View style={styles.container} />;
  if (!hasCameraPermission) return <View style={styles.container} />;
  if (!device) return <View style={styles.container} />;

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
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={isCameraActive}
          video={true}
          audio={true}
          torch={isRecording && flash === "on" ? "on" : "off"}
          // Performance optimizations
          videoStabilizationMode="auto"
          videoHdr={false}
          photoHdr={false}
          lowLightBoost={false}
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
          flashMode={flash}
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
