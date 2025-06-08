import CameraControls from "@/components/camera/CameraControls";
import CameraOverlay from "@/components/camera/CameraOverlay";
import MediaPreview from "@/components/camera/MediaPreview";
import type { CameraView as CameraViewType } from "expo-camera";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video" | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const cameraRef = useRef<CameraViewType | null>(null);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingPromise = useRef<Promise<any> | null>(null);
  const isStoppingRef = useRef(false);
  const recordingRef = useRef(false); // NEW: mirrors isRecording immediately

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          setRecordingProgress(Math.min(newDuration / 60, 1)); // Progress from 0 to 1 over 60 seconds
          return newDuration;
        });
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setRecordingDuration(0);
      setRecordingProgress(0);
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
    if (cameraRef.current && !isRecording && !isStoppingRef.current) {
      try {
        setIsRecording(true);
        recordingRef.current = true;
        isStoppingRef.current = false;

        // Manual timeout to stop recording after 60s
        setTimeout(() => {
          if (recordingRef.current && !isStoppingRef.current) {
            stopRecording();
          }
        }, 60000);

        // Start recording and store the promise
        recordingPromise.current = cameraRef.current.recordAsync();

        const video = await recordingPromise.current;

        if (video?.uri) {
          setCapturedMedia(video.uri);
          setMediaType("video");
        }

        // Clean up state after natural completion
        recordingPromise.current = null;
        isStoppingRef.current = false;
        setIsRecording(false);
        recordingRef.current = false;
      } catch (error) {
        console.error("Error recording video:", error);
        recordingPromise.current = null;
        isStoppingRef.current = false;
        setIsRecording(false);
        recordingRef.current = false;
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && recordingRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;

      try {
        await cameraRef.current.stopRecording();
        // Cleanup
        recordingPromise.current = null;
        isStoppingRef.current = false;
        setIsRecording(false);
        recordingRef.current = false;
      } catch (error) {
        console.error("Error stopping recording:", error);
        recordingPromise.current = null;
        isStoppingRef.current = false;
        setIsRecording(false);
        recordingRef.current = false;
      }
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

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) return <View style={styles.container} />;

  if (capturedMedia) {
    return (
      <MediaPreview
        mediaUri={capturedMedia}
        mediaType={mediaType!}
        onDismiss={dismissPreview}
        onSave={() => dismissPreview()}
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
          enableTorch={isRecording && flashMode === "on"}
        />
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
    marginBottom: 80, // Adjust to fit above tab bar
  },
});
