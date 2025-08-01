import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CameraPermissionDeniedProps {
  canAskAgain: boolean;
  onRequestPermission: () => void;
}

export default function CameraPermissionDenied({
  canAskAgain,
  onRequestPermission,
}: CameraPermissionDeniedProps) {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleRequestPermission = () => {
    if (onRequestPermission) {
      onRequestPermission();
    }
  };

  const getDescription = () => {
    if (canAskAgain) {
      return `To record videos, we need access to your Camera & Microphone. This allows you to capture and share moments with your friends.`;
    }

    return `We need access to your Camera & Microphone to record videos. Please enable it in Settings.`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
      </View>

      <Text style={styles.title}>Camera & Microphone Access Required</Text>

      <Text style={styles.description}>{getDescription()}</Text>

      <View style={styles.buttonContainer}>
        {canAskAgain ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>Allow Access</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleOpenSettings}>
            <Text style={styles.buttonText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.note}>
        You can also view videos shared by others without recording
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#000000",
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#cccccc",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },
  buttonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
