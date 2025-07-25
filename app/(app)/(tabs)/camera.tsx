// app/(tabs)/index.tsx
import React, { useEffect } from "react";
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { Camera } from "react-native-vision-camera";
import { useFocusEffect } from "@react-navigation/native";
import CameraControls from "@/components/camera/CameraControls";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useCamera } from "@/hooks/media/useCamera";
import { useTab } from "@/contexts/TabContext";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

export default function CameraScreen() {
  const { user } = useUserProfile();
  const { isTabActive, isSwipingTowardsCamera } = useTab();
  const isCameraTabActive = isTabActive(1);

  useDebugLifecycle("CameraScreen");

  const {
    hasCameraPermission,
    hasMicrophonePermission,
    flash,
    isRecording,
    isProcessing,
    hasVideoCaptured,
    isCameraActive,
    recordingProgress,
    device,
    format, // Get the 16:9 format
    cameraRef,
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlash,
    resetVideoCaptured,
    manageCameraLifecycle,
    handleCameraPress,
  } = useCamera(user?.id);

  // Smart camera lifecycle management
  useEffect(() => {
    manageCameraLifecycle(isCameraTabActive, isSwipingTowardsCamera);
  }, [isCameraTabActive, isSwipingTowardsCamera, manageCameraLifecycle]);

  // Reset video captured state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetVideoCaptured();
    }, [resetVideoCaptured])
  );

  if (!hasCameraPermission || !hasMicrophonePermission || !device) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* CTA Image */}
      {!isRecording && !isProcessing && !hasVideoCaptured && (
        <View style={styles.CTAContainer}>
          <Image
            source={require("@/assets/images/logo/start-a-pov.png")}
            style={styles.CTAImage}
          />
        </View>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.processingText}>Processing video...</Text>
        </View>
      )}

      {/* Camera View */}
      <TouchableOpacity
        style={styles.camera}
        onPress={handleCameraPress}
        activeOpacity={1}
        disabled={isProcessing}
      >
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          format={format} // Apply the 16:9 format
          isActive={isCameraActive}
          video={true}
          audio={true}
          torch={isRecording && flash === "on" ? "on" : "off"}
          videoStabilizationMode="auto"
          photoHdr={false}
          lowLightBoost={false}
          outputOrientation="preview"
        />
      </TouchableOpacity>

      {/* Camera Controls */}
      {isCameraTabActive && !isProcessing && !hasVideoCaptured && (
        <CameraControls
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onToggleCamera={toggleCameraType}
          onToggleFlash={toggleFlash}
          isRecording={isRecording}
          flashMode={flash}
          recordingProgress={recordingProgress}
          hasVideoCaptured={hasVideoCaptured}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  CTAContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  CTAImage: {
    width: 150,
    height: 150,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  processingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
});
