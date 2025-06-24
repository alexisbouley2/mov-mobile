// First install: npx expo install react-native-otp-entry

// components/otp/OTPInput.tsx
import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { OtpInput } from "react-native-otp-entry";

interface OTPInputProps {
  value: string;
  onChangeText: (_text: string) => void;
  length?: number;
  autoFocus?: boolean;
}

const OTPInput = ({
  value,
  onChangeText,
  length = 6,
  autoFocus = true,
}: OTPInputProps) => {
  const otpRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        otpRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Clear OTP when value is reset (after error)
  useEffect(() => {
    if (value === "" && otpRef.current) {
      otpRef.current.clear();
    }
  }, [value]);

  return (
    <View style={styles.container}>
      <OtpInput
        ref={otpRef}
        numberOfDigits={length}
        onTextChange={onChangeText}
        autoFocus={autoFocus}
        focusColor="#007AFF"
        focusStickBlinkingDuration={500}
        onFilled={(_text) => {
          // The text is already handled by onTextChange
          // This is just for any additional logic if needed
        }}
        textInputProps={{
          accessibilityLabel: "One time passcode input",
        }}
        theme={{
          containerStyle: styles.otpContainer,
          inputsContainerStyle: styles.inputsContainer,
          pinCodeContainerStyle: styles.otpBox,
          pinCodeTextStyle: styles.otpText,
          focusStickStyle: styles.focusStick,
          focusedPinCodeContainerStyle: styles.otpBoxActive,
          filledPinCodeContainerStyle: styles.otpBoxFilled,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  otpContainer: {
    width: "100%",
  },
  inputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  focusStick: {
    backgroundColor: "#007AFF",
    height: 2,
    width: 20,
  },
});

export default OTPInput;
