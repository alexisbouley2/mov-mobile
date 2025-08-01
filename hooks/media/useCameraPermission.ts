// hooks/media/useCamera.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Camera, CameraPermissionStatus } from "react-native-vision-camera";
import log from "@/utils/logger";

export type PermissionStatus =
  | "granted"
  | "not-determined"
  | "denied"
  | "restricted";

export interface PermissionState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
  canAskAgain: boolean;
}

export const useCameraPermission = () => {
  // Permission states
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>("not-determined");
  const [microphonePermissionStatus, setMicrophonePermissionStatus] =
    useState<CameraPermissionStatus>("not-determined");

  // Check permissions on mount and when focused
  const checkPermissions = useCallback(async () => {
    try {
      const cameraStatus = await Camera.getCameraPermissionStatus();
      const microphoneStatus = await Camera.getMicrophonePermissionStatus();

      setCameraPermissionStatus(cameraStatus);
      setMicrophonePermissionStatus(microphoneStatus);

      log.debug("Permission status:", {
        camera: cameraStatus,
        microphone: microphoneStatus,
      });
    } catch (error) {
      log.error("Error checking permissions:", error);
    }
  }, []);

  // Check permissions when component mounts or comes into focus
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  // Convenience getters
  const hasAllPermissions = useMemo(
    () =>
      cameraPermissionStatus === "granted" &&
      microphonePermissionStatus === "granted",
    [cameraPermissionStatus, microphonePermissionStatus]
  );

  const canRequestCameraPermissions = useMemo(
    () => cameraPermissionStatus === "not-determined",
    [cameraPermissionStatus]
  );

  const canRequestMicrophonePermissions = useMemo(
    () => microphonePermissionStatus === "not-determined",
    [microphonePermissionStatus]
  );

  const canRequestPermissions = useMemo(
    () =>
      cameraPermissionStatus === "not-determined" ||
      microphonePermissionStatus === "not-determined",
    [cameraPermissionStatus, microphonePermissionStatus]
  );

  // Request camera permission
  const requestCameraPermission = useCallback(async () => {
    try {
      const status = await Camera.requestCameraPermission();
      setCameraPermissionStatus(status);
      return status;
    } catch (error) {
      log.error("Error requesting camera permission:", error);
      return "denied";
    }
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      const status = await Camera.requestMicrophonePermission();
      setMicrophonePermissionStatus(status);
      return status;
    } catch (error) {
      log.error("Error requesting microphone permission:", error);
      return "denied";
    }
  }, []);

  // Sequential permission request function
  const requestPermissionsSequentially = useCallback(async () => {
    try {
      // Request camera permission first
      if (canRequestCameraPermissions) {
        await requestCameraPermission();
      }

      // Then request microphone permission
      if (canRequestMicrophonePermissions) {
        await requestMicrophonePermission();
      }
    } catch (error) {
      log.error("Error requesting permissions:", error);
    }
  }, [
    requestCameraPermission,
    requestMicrophonePermission,
    canRequestCameraPermissions,
    canRequestMicrophonePermissions,
  ]);

  return {
    hasAllPermissions,
    canRequestPermissions,
    requestPermissionsSequentially,
  };
};
