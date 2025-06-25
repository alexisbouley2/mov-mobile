// components/otp/OTPInput.tsx
import React, { useRef, useEffect, useState } from "react";
import { View, TextInput, StyleSheet, Text, Pressable } from "react-native";

interface OTPInputProps {
  value: string;
  onChangeText: (_text: string) => void;
  length?: number;
  autoFocus?: boolean;
  placeholder?: string;
}

const OTPInput = ({
  value,
  onChangeText,
  length = 6,
  autoFocus = true,
  placeholder = "Enter OTP",
}: OTPInputProps) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      // Longer delay to ensure iOS has time to register the field
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        // Additional focus call after a brief moment
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Function to focus the input when container is pressed
  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  // Format the display value to show individual digits
  const formatDisplayValue = (text: string) => {
    const digits = text.split("");
    const formattedDigits = [];

    for (let i = 0; i < length; i++) {
      formattedDigits.push(digits[i] || "");
    }

    return formattedDigits;
  };

  const displayDigits = formatDisplayValue(value);

  return (
    <View style={styles.container}>
      {/* Invisible TextInput for actual input handling */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode" // Critical for iOS SMS autofill
        autoComplete="one-time-code" // Cross-platform support
        autoFocus={autoFocus}
        maxLength={length}
        caretHidden={true} // Hide cursor since we show custom UI
        style={styles.hiddenInput}
        placeholder={placeholder}
        placeholderTextColor="transparent"
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        returnKeyType="done"
        // This is crucial for iOS autofill timing
        blurOnSubmit={false}
        // Important: Don't use secureTextEntry as it can interfere with autofill
        accessibilityLabel="One time passcode input"
      />

      {/* Visual representation of OTP boxes */}
      <Pressable
        style={styles.otpContainer}
        onPress={handleContainerPress}
        accessibilityRole="button"
        accessibilityLabel="Tap to enter OTP"
      >
        {displayDigits.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.otpBox,
              digit ? styles.otpBoxFilled : {},
              isFocused && index === value.length ? styles.otpBoxActive : {},
            ]}
          >
            <Text style={styles.otpText}>{digit}</Text>
            {/* Show cursor indicator in the active box */}
            {isFocused && index === value.length && (
              <View style={styles.cursor} />
            )}
          </View>
        ))}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
    // Don't use display: 'none' as it can break autofill
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 300,
    gap: 12,
  },
  otpBox: {
    flex: 1,
    height: 50,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3A3A3C",
    position: "relative",
  },
  otpBoxFilled: {
    backgroundColor: "#2C2C2E",
    borderColor: "#007AFF",
  },
  otpBoxActive: {
    borderColor: "#007AFF",
    backgroundColor: "#1C1C1E",
    borderWidth: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cursor: {
    position: "absolute",
    width: 2,
    height: 24,
    backgroundColor: "#007AFF",
    opacity: 1,
  },
});

export default OTPInput;
