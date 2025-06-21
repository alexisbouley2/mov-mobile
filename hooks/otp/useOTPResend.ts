// hooks/otp/useOTPResend.ts
import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

interface UseOTPResendProps {
  phone: string;
  maxResendCount?: number;
  onResendSuccess?: () => void;
}

export const useOTPResend = ({
  phone,
  maxResendCount = 3,
  onResendSuccess,
}: UseOTPResendProps) => {
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { signInWithOtp } = useAuth();

  const canResend = resendCount < maxResendCount && !isResending;
  const hasReachedMaxResends = resendCount >= maxResendCount;

  const handleResend = async () => {
    if (!canResend || !phone) return;

    setIsResending(true);
    const { error } = await signInWithOtp(phone);

    if (error) {
      setIsResending(false);
      Alert.alert("Error", error.message || "Failed to resend code.");
    } else {
      setResendCount((prev) => prev + 1);
      setIsResending(false);
      onResendSuccess?.();
    }
  };

  return {
    resendCount,
    isResending,
    canResend,
    hasReachedMaxResends,
    handleResend,
  };
};
