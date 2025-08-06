// app/(notification-setup)/permission.tsx
import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useNotifications } from "@/contexts/NotificationContext";
import messaging from "@react-native-firebase/messaging";
import log from "@/utils/logger";

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const { requestPermission, checkPermissionStatus } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<number | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkPermissionStatus();
      setPermissionStatus(status);
    };
    checkStatus();
  }, [checkPermissionStatus]);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      await requestPermission();
      router.replace("/(app)/(tabs)/camera");
    } catch (error) {
      log.error("Error requesting notification permission:", error);
      router.replace("/(app)/(tabs)/camera");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleSkip = () => {
    router.replace("/(app)/(tabs)/camera");
  };

  const isDenied = permissionStatus === messaging.AuthorizationStatus.DENIED;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Stay Updated</Text>
        <Text style={styles.subtitle}>
          Get notified when new videos are shared in your events and when you
          receive messages from other participants.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!isDenied ? (
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleEnableNotifications}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleOpenSettings}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>Open Settings</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingBottom: 48,
  },
  primaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#333",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
  },
  skipText: {
    color: "#666",
    fontSize: 16,
  },
});
