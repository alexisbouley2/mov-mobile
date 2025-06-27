import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface SubmitButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  submitText: string;
  loadingText: string;
}

export default function SubmitButton({
  onPress,
  disabled = false,
  loading = false,
  submitText,
  loadingText,
}: SubmitButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text
        style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}
      >
        {loading ? loadingText : submitText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: "#666",
  },
});
