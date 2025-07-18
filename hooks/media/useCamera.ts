import { useEffect, useRef, useState } from "react";
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
  const MAX_VIDEO_DURATION: number = 6;
  const router = useRouter();
  const { isRecording, setIsRecording } = useRecording();

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  const [cameraPosition, setCameraPosition] = useState<"back" | "front">(
    "back"
  );
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false); // Start with camera inactive

  const device = useCameraDevice(cameraPosition);
  const cameraRef = useRef<Camera>(null);
  const recordingStartTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!hasCameraPermission) {
      requestCameraPermission();
    }
    if (!hasMicrophonePermission) {
      requestMicrophonePermission();
    }
  }, [
    hasCameraPermission,
    hasMicrophonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
  ]);

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
        try {
          cameraRef.current.stopRecording();
        } catch (error) {
          log.warn("Error stopping recording:", error);
        }
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
  }, [isCameraActive, setIsRecording]);

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
    if (!cameraRef.current || !isCameraActive || !device) {
      log.warn(
        "Cannot start recording - camera not active, ref not available, or device not found"
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
      cameraRef.current.startRecording({
        flash: flash === "on" ? "on" : "off",
        onRecordingFinished: (video: any) => {
          log.info("Recording finished:", video.path);
          setCapturedMedia(video.path);
          setIsRecording(false);
          setRecordingDuration(0);
          if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
          }
          recordingStartTime.current = null;
        },
        onRecordingError: (error: any) => {
          log.error("Recording error:", error);
          setIsRecording(false);
          setRecordingDuration(0);
          if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
          }
          recordingStartTime.current = null;
        },
      });

      // Auto-stop after max duration
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, MAX_VIDEO_DURATION * 1000);
    } catch (error) {
      log.error("Error starting recording:", error);
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    log.info("Stopping recording");

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    try {
      await cameraRef.current.stopRecording();
    } catch (error) {
      log.warn("Error stopping recording:", error);
    }
  };

  const toggleCameraType = () => {
    if (isRecording) return; // Prevent flipping camera during recording
    setCameraPosition((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => {
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
    hasCameraPermission,
    hasMicrophonePermission,
    cameraPosition,
    flash,
    isRecording,
    recordingDuration,
    capturedMedia,
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
    dismissPreview,
    activateCamera,
    deactivateCamera,
  };
};
