// components/otp/OTPInput.tsx
import React, { useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

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
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <View style={styles.container}>
      {/* Hidden input that handles all the logic */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        caretHidden
      />

      {/* Visual boxes */}
      <Pressable
        style={styles.boxesContainer}
        onPress={() => inputRef.current?.focus()}
      >
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.otpBox,
              value[index] && styles.otpBoxFilled,
              index === value.length && styles.otpBoxActive,
            ]}
          >
            <Text style={styles.otpText}>{value[index] || ""}</Text>
          </View>
        ))}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    color: "transparent",
    backgroundColor: "transparent",
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
});

export default OTPInput;
