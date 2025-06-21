// hooks/otp/useOTPVerification.ts
import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

interface UseOTPVerificationProps {
  phone: string;
  otpLength?: number;
  onVerificationSuccess?: () => void;
  onVerificationError?: () => void;
}

export const useOTPVerification = ({
  phone,
  otpLength = 6,
  onVerificationSuccess,
  onVerificationError,
}: UseOTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { verifyOtp } = useAuth();

  const isOtpComplete = otp.length === otpLength;

  const handleOtpChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "").substring(0, otpLength);
    setOtp(numericText);
  };

  const clearOtp = () => {
    setOtp("");
  };

  const handleVerify = async () => {
    if (!isOtpComplete) {
      Alert.alert("Error", `Please enter the complete ${otpLength}-digit code`);
      return;
    }

    if (!phone) {
      Alert.alert("Error", "Phone number not found");
      return;
    }

    setIsVerifying(true);
    const { error } = await verifyOtp(phone, otp);
    setIsVerifying(false);

    if (error) {
      Alert.alert("Error", error.message || "Invalid verification code");
      clearOtp();
      onVerificationError?.();
    } else {
      onVerificationSuccess?.();
    }
  };

  return {
    otp,
    isVerifying,
    isOtpComplete,
    handleOtpChange,
    handleVerify,
    clearOtp,
  };
};
