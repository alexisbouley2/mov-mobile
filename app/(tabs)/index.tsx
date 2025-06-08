import type { CameraView as CameraViewType } from "expo-camera";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraControls from "../../components/camera/CameraControls";
import CameraOverlay from "../../components/camera/CameraOverlay";
import MediaPreview from "../../components/camera/MediaPreview";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video" | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const cameraRef = useRef<CameraViewType | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedMedia(photo.uri);
        setMediaType("photo");
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60, // 60 seconds max like Snapchat
        });
        setCapturedMedia(video?.uri ?? null);
        setMediaType("video");
        setIsRecording(false);
      } catch (error) {
        console.error("Error recording video:", error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      console.log("here 1");
      cameraRef.current.stopRecording();
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlashMode((current) => {
      switch (current) {
        case "off":
          return "on";
        case "on":
          return "auto";
        case "auto":
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

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return <View style={styles.container} />;
  }

  if (capturedMedia) {
    return (
      <MediaPreview
        mediaUri={capturedMedia}
        mediaType={mediaType!}
        onDismiss={dismissPreview}
        onSave={() => {
          // Handle save logic here
          dismissPreview();
        }}
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
        >
          <CameraOverlay
            isRecording={isRecording}
            recordingDuration={recordingDuration}
          />

          <CameraControls
            onTakePicture={takePicture}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onToggleCamera={toggleCameraType}
            onToggleFlash={toggleFlash}
            isRecording={isRecording}
            flashMode={flashMode}
          />
        </CameraView>
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
    marginBottom: 80, // TODO: set this value into a constant, Adjust to stop before the tab bar (or use `paddingBottom` dynamically)
  },
});
