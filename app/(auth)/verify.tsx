import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Keyboard,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { CommonStyles } from "@/styles/common";
import { ButtonStyles } from "@/styles/buttons";

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { verifyOtp, signInWithOtp } = useAuth();
  const inputRef = useRef<TextInput | null>(null);

  const [countdown, setCountdown] = useState(10);
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Computed value instead of state
  const canResend =
    countdown === 0 && resendCount < 3 && !loading && !isResending;

  // Timer effect - simplified
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]); // Only depend on countdown

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleResend = async () => {
    if (!canResend || !phone) return;

    setIsResending(true);
    setLoading(true);
    const { error } = await signInWithOtp(phone);

    if (error) {
      setLoading(false);
      setIsResending(false);
      Alert.alert("Error", error.message || "Failed to resend code.");
    } else {
      setOtp("");
      inputRef.current?.focus();
      setResendCount(resendCount + 1);
      setCountdown(20);
      setLoading(false);
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert(
        "Error",
        `Please enter the complete ${OTP_LENGTH}-digit code`
      );
      return;
    }

    if (!phone) {
      Alert.alert("Error", "Phone number not found");
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message || "Invalid verification code");
      setOtp("");
      inputRef.current?.focus();
    }
  };

  const handleOtpChange = (text: string) => {
    // Only keep numbers and limit to 6 digits
    const numericText = text.replace(/[^0-9]/g, "").substring(0, OTP_LENGTH);
    setOtp(numericText);
  };

  const renderResendArea = () => {
    if (resendCount >= 3) {
      return (
        <Text style={styles.supportText}>
          Having trouble? Contact our support at: contact@mov.com
        </Text>
      );
    }

    if (canResend) {
      return (
        <TouchableOpacity onPress={handleResend} disabled={loading}>
          <Text style={styles.resendButtonText}>Resend code</Text>
        </TouchableOpacity>
      );
    }

    // Show nothing during resend process for cleaner UX
    if (isResending || (countdown === 0 && loading)) {
      return null;
    }

    return <Text style={styles.resendText}>Resend code in {countdown}s</Text>;
  };

  return (
    <SafeAreaView style={CommonStyles.container}>
      <Pressable
        style={CommonStyles.contentWithTopPadding}
        onPress={Keyboard.dismiss}
      >
        <Text style={CommonStyles.title}>Enter the code you received</Text>
        <Text style={CommonStyles.subtitle}>We sent a code to {phone}</Text>

        <View style={styles.otpContainer}>
          {/* Hidden input that handles all the logic */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            caretHidden
          />

          {/* Visual boxes */}
          <Pressable
            style={styles.boxesContainer}
            onPress={() => inputRef.current?.focus()}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  otp[index] && styles.otpBoxFilled,
                  index === otp.length && styles.otpBoxActive,
                ]}
              >
                <Text style={styles.otpText}>{otp[index] || ""}</Text>
              </View>
            ))}
          </Pressable>
        </View>

        <View style={styles.resendContainer}>{renderResendArea()}</View>

        <TouchableOpacity
          style={[
            ButtonStyles.primary,
            otp.length !== OTP_LENGTH && ButtonStyles.primaryDisabled,
          ]}
          onPress={handleVerify}
          disabled={otp.length !== OTP_LENGTH || loading}
        >
          <Text
            style={[
              ButtonStyles.primaryText,
              otp.length !== OTP_LENGTH && ButtonStyles.primaryTextDisabled,
            ]}
          >
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  otpContainer: {
    marginBottom: 40,
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    color: "transparent", // Hide the text
    backgroundColor: "transparent", // Hide background
    zIndex: 1,
  },
  boxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  otpBox: {
    width: 50,
    height: 50,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  otpBoxFilled: {
    backgroundColor: "#2C2C2E",
    borderColor: "#007AFF",
  },
  otpBoxActive: {
    borderColor: "#007AFF",
    backgroundColor: "#2C2C2E",
  },
  otpText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 30,
    minHeight: 40,
    justifyContent: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#666",
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
