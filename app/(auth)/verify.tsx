// app/(auth)/verify.tsx
import React from "react";
import {
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOTPTimer } from "@/hooks/otp/useOTPTimer";
import { useOTPResend } from "@/hooks/otp/useOTPResend";
import { useOTPVerification } from "@/hooks/otp/useOTPVerification";
import OTPInput from "@/components/auth/otp/OTPInput";
import OTPResendArea from "@/components/auth/otp/OTPResendArea";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  useDebugLifecycle("VerifyScreen");

  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const { countdown, isTimerFinished, resetTimer } = useOTPTimer({
    initialCountdown: 30,
    resendCountdown: 60,
  });

  const { isResending, canResend, hasReachedMaxResends, handleResend } =
    useOTPResend({
      phone: phone || "",
      onResendSuccess: () => {
        resetTimer();
      },
    });

  const { otp, isVerifying, isOtpComplete, handleOtpChange, handleVerify } =
    useOTPVerification({
      phone: phone || "",
      otpLength: OTP_LENGTH,
      onVerificationSuccess: () => {
        // Navigate to the root index which will handle routing based on auth state
        router.replace("/");
      },
      onVerificationError: () => {
        // Focus will be handled by the OTPInput component
      },
    });

  const finalCanResend = canResend && isTimerFinished && !isResending;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Enter the code you received</Text>
          <Text style={styles.subtitle}>We sent a code to {phone}</Text>

          <OTPInput
            value={otp}
            onChangeText={handleOtpChange}
            length={OTP_LENGTH}
          />

          <View style={styles.resendContainer}>
            <OTPResendArea
              countdown={countdown}
              canResend={finalCanResend}
              isResending={isResending}
              hasReachedMaxResends={hasReachedMaxResends}
              onResend={handleResend}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isOtpComplete && styles.continueButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={!isOtpComplete || isVerifying}
          >
            <Text
              style={[
                styles.continueButtonText,
                !isOtpComplete && styles.continueButtonTextDisabled,
              ]}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  resendContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 48,
    paddingBottom: 48,
  },
  continueButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: "#333",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
  continueButtonTextDisabled: {
    color: "#666",
  },
});
