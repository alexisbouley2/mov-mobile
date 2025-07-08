import { useEffect, useRef, useState } from "react";
import {
  CameraType,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useRouter } from "expo-router";
import type { CameraView as CameraViewType } from "expo-camera";
import log from "@/utils/logger";

export const useCamera = (userId?: string) => {
  const MAX_VIDEO_DURATION: number = 6;
  const router = useRouter();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false); // Start with camera inactive

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

  // Navigate to MediaPreview screen when media is captured
  useEffect(() => {
    if (capturedMedia && userId) {
      router.push({
        pathname: "/(app)/(media)/preview",
        params: {
          mediaUri: capturedMedia,
          userId: userId,
        },
      });
    }
  }, [capturedMedia, userId, router]);

  // Cleanup when camera becomes inactive
  useEffect(() => {
    log.info(`Camera active state changed to: ${isCameraActive}`);
    if (!isCameraActive) {
      log.info("Camera becoming inactive - cleaning up");
      // Stop recording if camera becomes inactive
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
    }
  }, [isCameraActive]);

  // Reset captured media when screen comes back into focus
  useEffect(() => {
    // Reset captured media when returning from preview screen
    if (capturedMedia) {
      setCapturedMedia(null);
    }
  }, [capturedMedia]);

  const activateCamera = () => {
    log.info("Activating camera");
    setIsCameraActive(true);
  };

  const deactivateCamera = () => {
    log.info("Deactivating camera");
    setIsCameraActive(false);
  };

  const startRecording = async () => {
    if (!cameraRef.current || !isCameraActive) {
      log.warn(
        "Cannot start recording - camera not active or ref not available"
      );
      return;
    }

    log.info("Starting recording");
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
    log.info("Stopping recording");
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

  const recordingProgress = Math.min(recordingDuration / MAX_VIDEO_DURATION, 1);

  return {
    // State
    cameraPermission,
    microphonePermission,
    cameraType,
    flashMode,
    isRecording,
    recordingDuration,
    capturedMedia,
    isCameraActive,
    recordingProgress,

    // Refs
    cameraRef,

    // Actions
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlash,
    dismissPreview,
    activateCamera,
    deactivateCamera,
  };
};
