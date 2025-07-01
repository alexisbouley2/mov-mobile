// app/(auth)/verify.tsx
import React from "react";
import {
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOTPTimer } from "@/hooks/otp/useOTPTimer";
import { useOTPResend } from "@/hooks/otp/useOTPResend";
import { useOTPVerification } from "@/hooks/otp/useOTPVerification";
import OTPInput from "@/components/auth/otp/OTPInput";
import OTPResendArea from "@/components/auth/otp/OTPResendArea";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import styles from "./verify.style";

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
