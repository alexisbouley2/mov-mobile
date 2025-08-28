import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ContactsPermissionDeniedProps {
  canAskAgain: boolean;
  onRequestPermission?: () => void;
  isUndetermined?: boolean;
}

export default function ContactsPermissionDenied({
  canAskAgain,
  onRequestPermission,
  isUndetermined = false,
}: ContactsPermissionDeniedProps) {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleRequestPermission = () => {
    if (onRequestPermission) {
      onRequestPermission();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="people-outline" size={64} color="#666" />
      </View>

      <Text style={styles.title}>Contacts Access Required</Text>

      <Text style={styles.description}>
        {isUndetermined
          ? "MOV uses your contacts to help you invite friends to MOV events and connect with people you know in the app. Access is only requested when you want to find or invite friends."
          : "MOV uses your contacts to help you invite friends to MOV events and connect with people you know in the app. Access is only requested when you want to find or invite friends. Please enable it in Settings."}
      </Text>

      <View style={styles.buttonContainer}>
        {canAskAgain && onRequestPermission ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleOpenSettings}>
            <Text style={styles.buttonText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.note}>
        You can also invite friends by sharing the event link directly
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
