// components/otp/OTPResendArea.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface OTPResendAreaProps {
  countdown: number;
  canResend: boolean;
  isResending: boolean;
  hasReachedMaxResends: boolean;
  onResend: () => void;
}

const OTPResendArea = ({
  countdown,
  canResend,
  isResending,
  hasReachedMaxResends,
  onResend,
}: OTPResendAreaProps) => {
  const renderContent = () => {
    if (hasReachedMaxResends) {
      return (
        <Text style={styles.supportText}>
          Having trouble? Contact our support at: hellomovapp@gmail.com
        </Text>
      );
    }

    if (canResend && countdown === 0) {
      return (
        <TouchableOpacity onPress={onResend} disabled={isResending}>
          <Text style={styles.resendButtonText}>Resend code</Text>
        </TouchableOpacity>
      );
    }

    // Show nothing during resend process for cleaner UX
    if (isResending || (countdown === 0 && isResending)) {
      return null;
    }

    return <Text style={styles.resendText}>Resend code in {countdown}s</Text>;
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#007AFF",
  },
  resendButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  supportText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

export default OTPResendArea;
