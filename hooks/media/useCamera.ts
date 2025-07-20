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
  const DEACTIVATION_DELAY = 4000; // 1000ms delay before deactivating camera
  const DOUBLE_TAP_DELAY = 300;
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
  const deactivationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastTapRef = useRef(0);

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
      if (deactivationTimeoutRef.current)
        clearTimeout(deactivationTimeoutRef.current);
    };
  }, []);

  const activateCamera = useCallback(() => {
    console.log("=== ACTIVATE CAMERA CALLED ===");

    // Clear any pending deactivation
    if (deactivationTimeoutRef.current) {
      console.log("Clearing pending deactivation timeout");
      clearTimeout(deactivationTimeoutRef.current);
      deactivationTimeoutRef.current = null;
    }

    setIsCameraActive(true);
    console.log("Camera active state set to true");
  }, []);

  const deactivateCamera = useCallback(() => {
    console.log("=== DEACTIVATE CAMERA CALLED ===");
    setIsCameraActive(false);
    console.log("Camera active state set to false");

    if (durationInterval.current) {
      cancelAnimationFrame(durationInterval.current);
      durationInterval.current = null;
    }

    setIsRecording(false);
    setIsProcessing(false);
    setHasVideoCaptured(false);
    setRecordingDuration(0);
  }, []);

  const scheduleDeactivation = useCallback(() => {
    console.log("=== SCHEDULING CAMERA DEACTIVATION ===");

    // Clear any existing timeout
    if (deactivationTimeoutRef.current) {
      console.log("Clearing existing deactivation timeout");
      clearTimeout(deactivationTimeoutRef.current);
    }

    // Schedule deactivation after delay
    console.log(`Setting deactivation timeout for ${DEACTIVATION_DELAY}ms`);
    deactivationTimeoutRef.current = setTimeout(() => {
      console.log("Deactivation timeout fired - calling deactivateCamera");
      deactivateCamera();
      deactivationTimeoutRef.current = null;
    }, DEACTIVATION_DELAY);
  }, [deactivateCamera]);

  // Smart camera lifecycle management
  const manageCameraLifecycle = useCallback(
    (isTabActive: boolean, isSwipingTowardsCamera: boolean = false) => {
      console.log(
        `Camera lifecycle called: tabActive=${isTabActive}, swipingTowards=${isSwipingTowardsCamera}, currentCameraActive=${isCameraActive}`
      );

      if (isTabActive) {
        // Camera tab is active - activate immediately
        console.log("Activating camera - tab is active");
        activateCamera();
      } else if (isSwipingTowardsCamera) {
        // User is swiping towards camera - activate immediately
        console.log("Activating camera - swiping towards camera");
        activateCamera();
      } else {
        // Camera tab is not active and not swiping towards it - schedule deactivation
        console.log("Scheduling camera deactivation");
        scheduleDeactivation();
      }
    },
    [activateCamera, scheduleDeactivation, isCameraActive]
  );

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

  const handleCameraPress = useCallback(() => {
    const now = Date.now();

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      toggleCameraType();
    }
    lastTapRef.current = now;
  }, [toggleCameraType]);

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
    manageCameraLifecycle,
    handleCameraPress,
  };
};
