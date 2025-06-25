import React, { useEffect, useRef, useState } from "react";
import {
  CameraType,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
import type { CameraView as CameraViewType } from "expo-camera";

export const useCamera = () => {
  const MAX_VIDEO_DURATION: number = 6;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

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

  // Cleanup when screen loses focus (tab switch)
  useFocusEffect(
    React.useCallback(() => {
      // When screen gains focus, activate camera
      setIsCameraActive(true);

      return () => {
        // Use refs to get current values instead of closure
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

        // Deactivate camera when screen loses focus
        setIsCameraActive(false);
      };
    }, [])
  );

  const startRecording = async () => {
    if (!cameraRef.current) return;

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
  };
};
