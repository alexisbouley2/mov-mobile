import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import PhoneInput from "@/components/auth/phone/PhoneInput";
import { countries } from "@/data/countries";
import { PhoneValidationResult } from "@/utils/phoneValidation";

function PhoneScreen() {
  const router = useRouter();
  const { signInWithOtp, setPendingCountryCode } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [validation, setValidation] = useState<PhoneValidationResult>({
    isValid: false,
    formattedNumber: "",
    error: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.code === "FR") || countries[0]
  );

  const handleContinue = async () => {
    if (!validation.isValid || !validation.formattedNumber) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    const { error } = await signInWithOtp(validation.formattedNumber);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message || "Failed to send OTP");
    } else {
      setPendingCountryCode(selectedCountry.dialCode);
      router.push({
        pathname: "/(auth)/verify",
        params: { phone: validation.formattedNumber },
      });
    }
  };

  return (
    <View style={styles.phoneContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <View style={styles.phoneContent}>
          <Text style={styles.phoneTitle}>Enter your phone number</Text>
          <Text style={styles.phoneSubtitle}>
            We'll send you a verification code to confirm your number
          </Text>

          <PhoneInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onValidationChange={setValidation}
            onCountryChange={setSelectedCountry}
            autoFocus={true}
          />

          {!validation.isValid &&
            phoneNumber.length > 0 &&
            validation.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{validation.error}</Text>
              </View>
            )}
        </View>

        <View style={styles.phoneButtonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!validation.isValid || loading) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!validation.isValid || loading}
          >
            <Text
              style={[
                styles.continueButtonText,
                (!validation.isValid || loading) &&
                  styles.continueButtonTextDisabled,
              ]}
            >
              {"Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  phoneContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  phoneContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  phoneTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  phoneSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    textAlign: "center",
  },
  phoneButtonContainer: {
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

export default PhoneScreen;
