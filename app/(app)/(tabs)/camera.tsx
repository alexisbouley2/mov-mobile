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
  console.log("=== CAMERA SCREEN COMPONENT CALLED ===");

  const { user } = useUserProfile();
  const { isTabActive, isSwipingTowardsCamera } = useTab();
  const isCameraTabActive = isTabActive(1);

  useDebugLifecycle("CameraScreen");

  console.log(
    `CameraScreen: RENDERING - isTabActive(1)=${isCameraTabActive}, isSwipingTowardsCamera=${isSwipingTowardsCamera}`
  );

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
    cameraRef,
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlash,
    resetVideoCaptured,
    manageCameraLifecycle,
  } = useCamera(user?.id);

  useEffect(() => {
    console.log("isCameraActive", isCameraActive);
  }, [isCameraActive]);

  useEffect(() => {
    console.log("isCameraTabActive", isCameraTabActive);
  }, [isCameraTabActive]);

  useEffect(() => {
    console.log("isSwipingTowardsCamera", isSwipingTowardsCamera);
  }, [isSwipingTowardsCamera]);

  console.log(
    `CameraScreen: Permissions and device - hasCameraPermission=${hasCameraPermission}, hasMicrophonePermission=${hasMicrophonePermission}, device=${!!device}`
  );

  // Track context value changes
  useEffect(() => {
    console.log(
      `CameraScreen: Context values changed - isCameraTabActive=${isCameraTabActive}, isSwipingTowardsCamera=${isSwipingTowardsCamera}`
    );
  }, [isCameraTabActive, isSwipingTowardsCamera]);

  // Smart camera lifecycle management
  useEffect(() => {
    console.log(
      `Camera screen effect: isCameraTabActive=${isCameraTabActive}, isSwipingTowardsCamera=${isSwipingTowardsCamera}`
    );
    manageCameraLifecycle(isCameraTabActive, isSwipingTowardsCamera);
  }, [isCameraTabActive, isSwipingTowardsCamera, manageCameraLifecycle]);

  // Reset video captured state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetVideoCaptured();
    }, [resetVideoCaptured])
  );

  // Handle double tap
  const lastTapRef = React.useRef(0);
  const handleCameraPress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      toggleCameraType();
    }
    lastTapRef.current = now;
  };

  if (!hasCameraPermission || !hasMicrophonePermission || !device) {
    console.log(
      `CameraScreen: EARLY RETURN - hasCameraPermission=${hasCameraPermission}, hasMicrophonePermission=${hasMicrophonePermission}, device=${!!device}`
    );
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
      {/* {isCameraActive ? ( */}
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
          isActive={isCameraActive}
          video={true}
          audio={true}
          torch={isRecording && flash === "on" ? "on" : "off"}
          // fps={30}
          videoStabilizationMode="auto"
          photoHdr={false}
          lowLightBoost={false}
          // format={device.formats.find(
          //   (
          //     f //f.videoHeight <= 1080 //&& // Lower resolution for faster processing
          //   ) => f.maxFps >= 30 // Ensure it supports at least 30fps
          // )}
        />
      </TouchableOpacity>
      {/* ) : (
        <View style={styles.camera} />
      )} */}

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
