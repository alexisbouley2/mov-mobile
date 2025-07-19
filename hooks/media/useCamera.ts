// hooks/media/useCamera.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
import log from "@/utils/logger";
import { useRecording } from "@/contexts/RecordingContext";

export const useCamera = (userId?: string) => {
  const MAX_VIDEO_DURATION = 6;
  const router = useRouter();
  const { isRecording, setIsRecording } = useRecording();
  // Permissions
  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  // Camera state
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">(
    "back"
  );
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasVideoCaptured, setHasVideoCaptured] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Refs
  const device = useCameraDevice(cameraPosition);
  const cameraRef = useRef<Camera>(null);
  const durationInterval = useRef<number | null>(null);

  // Request permissions on mount
  useEffect(() => {
    if (!hasCameraPermission) requestCameraPermission();
    if (!hasMicrophonePermission) requestMicrophonePermission();
  }, [hasCameraPermission, hasMicrophonePermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current)
        cancelAnimationFrame(durationInterval.current);
    };
  }, []);

  const activateCamera = useCallback(() => {
    log.info("Activating camera");
    setIsCameraActive(true);
  }, []);

  const deactivateCamera = useCallback(() => {
    log.info("Deactivating camera");
    setIsCameraActive(false);

    if (durationInterval.current) {
      cancelAnimationFrame(durationInterval.current);
      durationInterval.current = null;
    }

    setIsRecording(false);
    setIsProcessing(false);
    setHasVideoCaptured(false);
    setRecordingDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || !isCameraActive || !device || isRecording) {
      log.warn("Cannot start recording - preconditions not met");
      return;
    }

    log.info("Starting recording");
    setIsRecording(true);
    setRecordingDuration(0);

    // Update duration at 60fps for smooth animation
    const startTime = Date.now();
    const updateDuration = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRecordingDuration(elapsed);

      if (elapsed >= MAX_VIDEO_DURATION) {
        stopRecording();
      } else {
        durationInterval.current = requestAnimationFrame(updateDuration);
      }
    };
    durationInterval.current = requestAnimationFrame(updateDuration);

    try {
      await cameraRef.current.startRecording({
        flash: flash === "on" ? "on" : "off",
        // Optimized settings for faster processing
        videoCodec: "h264",
        // videoBitRate: "high",
        fileType: "mp4",
        onRecordingFinished: (video) => {
          log.info("Recording finished:", video.path);

          // Set video captured state to prevent UI flicker
          setHasVideoCaptured(true);

          // Clear state
          setIsRecording(false);
          setIsProcessing(false);
          setRecordingDuration(0);

          // Navigate with the actual video path
          if (userId) {
            router.push({
              pathname: "/(app)/(media)/preview",
              params: {
                mediaUri: video.path,
                userId: userId,
              },
            });
          }
        },
        onRecordingError: (error) => {
          log.error("Recording error:", error);

          setIsRecording(false);
          setIsProcessing(false);
          setRecordingDuration(0);
        },
      });
    } catch (error) {
      log.error("Error starting recording:", error);
      setIsRecording(false);
      setRecordingDuration(0);
    }
  }, [cameraRef, isCameraActive, device, isRecording, flash, userId, router]);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecording) return;

    log.info("Stopping recording");

    // Show processing state immediately
    setIsProcessing(true);

    // Clear animation frame
    if (durationInterval.current) {
      cancelAnimationFrame(durationInterval.current);
      durationInterval.current = null;
    }

    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      log.warn("Error stopping recording:", error);
      setIsProcessing(false);
    }
  }, [isRecording]);

  const toggleCameraType = useCallback(() => {
    if (isRecording || isProcessing) return;
    setCameraPosition((current) => (current === "back" ? "front" : "back"));
  }, [isRecording, isProcessing]);

  const toggleFlash = useCallback(() => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }, []);

  const resetVideoCaptured = useCallback(() => {
    setHasVideoCaptured(false);
  }, []);

  const recordingProgress = Math.min(recordingDuration / MAX_VIDEO_DURATION, 1);

  return {
    // State
    hasCameraPermission,
    hasMicrophonePermission,
    cameraPosition,
    flash,
    isRecording,
    isProcessing,
    hasVideoCaptured,
    recordingDuration,
    isCameraActive,
    recordingProgress,
    device,

    // Refs
    cameraRef,

    // Actions
    startRecording,
    stopRecording,
    toggleCameraType,
    toggleFlash,
    activateCamera,
    deactivateCamera,
    resetVideoCaptured,
  };
};
