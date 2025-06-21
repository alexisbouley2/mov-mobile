// app/(auth)/phone.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import PhoneInput from "@/components/phone/PhoneInput";
import { PhoneValidationResult } from "@/utils/phoneValidation";
import log from "@/utils/logger";

export default function PhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [validation, setValidation] = useState<PhoneValidationResult>({
    isValid: false,
  });
  const [loading, setLoading] = useState(false);
  const { signInWithOtp } = useAuth();

  const handleContinue = async () => {
    if (!validation.isValid || !validation.formattedNumber) {
      Alert.alert(
        "Error",
        validation.error || "Please enter a valid phone number"
      );
      return;
    }

    setLoading(true);
    log.info("sign in with otp", validation.formattedNumber);
    const { error } = await signInWithOtp(validation.formattedNumber);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message || "Failed to send OTP");
    } else {
      router.push({
        pathname: "/(auth)/verify",
        params: { phone: validation.formattedNumber },
      });
    }
  };

  const isButtonEnabled =
    validation.isValid && phoneNumber.length > 0 && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter your phone number</Text>

        <Text style={styles.subtitle}>
          We&apos;ll send you a verification code to confirm your number
        </Text>

        <PhoneInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onValidationChange={setValidation}
          autoFocus={true}
        />

        {!validation.isValid && phoneNumber.length > 0 && validation.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validation.error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, !isButtonEnabled && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!isButtonEnabled}
        >
          <Text
            style={[
              styles.buttonText,
              !isButtonEnabled && styles.buttonTextDisabled,
            ]}
          >
            {loading ? "Sending..." : "Continue"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to receive SMS messages from us. Message and
          data rates may apply.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: "#2d1b1b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#ff4444",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: "#666",
  },
  disclaimer: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },
});
