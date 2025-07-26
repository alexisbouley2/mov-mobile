// hooks/media/useCamera.ts
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
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
  const DEACTIVATION_DELAY = 1000;
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
  const [isFocused, setIsFocused] = useState(false);

  // Refs
  const device = useCameraDevice(cameraPosition);
  const cameraRef = useRef<Camera>(null);
  const durationInterval = useRef<number | null>(null);
  const deactivationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastTapRef = useRef(0);

  // Helper function to check if resolution is 16:9
  const is16by9 = (width: number, height: number): boolean => {
    const aspectRatio = width / height;
    return Math.abs(aspectRatio - 16 / 9) < 0.01; // Allow small tolerance for floating point
  };

  // Get the best 16:9 format for video recording
  const format = useMemo(() => {
    if (!device) return undefined;

    const formats = device.formats.filter((format) => {
      // Filter for video formats that support 16:9 aspect ratio
      return (
        format.videoWidth &&
        format.videoHeight &&
        is16by9(format.videoWidth, format.videoHeight) &&
        format.supportsVideoHdr === false && // Avoid HDR for faster processing
        format.maxFps >= 30 &&
        format.videoWidth <= 1920 // Limit resolution for Android compatibility
      ); // Ensure good frame rate
    });

    if (formats.length === 0) {
      // Fallback: find any format with decent resolution
      log.warn("No 16:9 formats found, using best available format");
      return device.formats
        .filter((f) => f.videoWidth && f.videoHeight && f.maxFps >= 30)
        .sort(
          (a, b) =>
            b.videoWidth! * b.videoHeight! - a.videoWidth! * a.videoHeight!
        )[0];
    }

    // Sort by resolution (higher is better) and return the best one
    const bestFormat = formats.sort((a, b) => {
      const aPixels = a.videoWidth! * a.videoHeight!;
      const bPixels = b.videoWidth! * b.videoHeight!;
      return bPixels - aPixels;
    })[0];

    log.info(
      `Selected video format: ${bestFormat.videoWidth}x${bestFormat.videoHeight} @ ${bestFormat.maxFps}fps`
    );
    return bestFormat;
  }, [device]);

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
    if (deactivationTimeoutRef.current) {
      clearTimeout(deactivationTimeoutRef.current);
      deactivationTimeoutRef.current = null;
    }
    setIsCameraActive(true);
  }, []);

  const deactivateCamera = useCallback(() => {
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

  const scheduleDeactivation = useCallback(() => {
    if (deactivationTimeoutRef.current) {
      clearTimeout(deactivationTimeoutRef.current);
    }
    deactivationTimeoutRef.current = setTimeout(() => {
      deactivateCamera();
      deactivationTimeoutRef.current = null;
    }, DEACTIVATION_DELAY);
  }, [deactivateCamera]);

  const manageCameraLifecycle = useCallback(
    (isTabActive: boolean, isSwipingTowardsCamera: boolean = false) => {
      if (isTabActive && isFocused) {
        activateCamera();
      } else if (isSwipingTowardsCamera && isFocused) {
        activateCamera();
      } else if (!isFocused) {
        scheduleDeactivation();
      } else {
        scheduleDeactivation();
      }
    },
    [activateCamera, scheduleDeactivation, isCameraActive, isFocused]
  );

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || !isCameraActive || !device || isRecording) {
      log.warn("Cannot start recording - preconditions not met");
      return;
    }

    log.info(
      "Starting recording with format:",
      format ? `${format.videoWidth}x${format.videoHeight}` : "default"
    );
    setIsRecording(true);
    setRecordingDuration(0);

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
        videoCodec: "h264",
        fileType: "mp4",
        onRecordingFinished: (video) => {
          log.info("Recording finished:", video.path);
          log.info("Video dimensions should be 16:9");

          setHasVideoCaptured(true);
          setIsRecording(false);
          setIsProcessing(false);
          setRecordingDuration(0);

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
  }, [
    cameraRef,
    isCameraActive,
    device,
    isRecording,
    flash,
    userId,
    router,
    format,
  ]);

  const stopRecording = useCallback(async () => {
    if (!cameraRef.current || !isRecording) return;

    log.info("Stopping recording");
    setIsProcessing(true);

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

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

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
    format, // Export format for Camera component

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
