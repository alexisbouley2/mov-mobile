import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";

interface EventSubmitButtonProps {
  onSubmit: () => void;
  loading: boolean;
  text: string;
}

export default function EventSubmitButton({
  onSubmit,
  loading,
  text,
}: EventSubmitButtonProps) {
  return (
    <View style={styles.createButtonContainer}>
      <TouchableOpacity
        style={[styles.createButton, loading && styles.createButtonDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>{text}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  createButtonContainer: {
    marginTop: 32,
    marginBottom: Platform.OS === "ios" ? 20 : 16,
  },
  createButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  createButtonDisabled: {
    backgroundColor: "#666",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
