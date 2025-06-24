// app/(auth)/verify.tsx
import React from "react";
import {
  Text,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CommonStyles } from "@/styles/common";
import { ButtonStyles } from "@/styles/buttons";
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
    <SafeAreaView style={CommonStyles.container}>
      <Pressable
        style={CommonStyles.contentWithTopPadding}
        onPress={Keyboard.dismiss}
      >
        <Text style={CommonStyles.title}>Enter the code you received</Text>
        <Text style={CommonStyles.subtitle}>We sent a code to {phone}</Text>

        <OTPInput
          value={otp}
          onChangeText={handleOtpChange}
          length={OTP_LENGTH}
        />

        <OTPResendArea
          countdown={countdown}
          canResend={finalCanResend}
          isResending={isResending}
          hasReachedMaxResends={hasReachedMaxResends}
          onResend={handleResend}
        />

        <TouchableOpacity
          style={[
            ButtonStyles.primary,
            !isOtpComplete && ButtonStyles.primaryDisabled,
          ]}
          onPress={handleVerify}
          disabled={!isOtpComplete || isVerifying}
        >
          <Text
            style={[
              ButtonStyles.primaryText,
              !isOtpComplete && ButtonStyles.primaryTextDisabled,
            ]}
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </Pressable>
    </SafeAreaView>
  );
}
