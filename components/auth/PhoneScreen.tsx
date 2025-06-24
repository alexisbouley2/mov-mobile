import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import PhoneInput from "@/components/auth/phone/PhoneInput";
import { PhoneValidationResult } from "@/utils/phoneValidation";

interface PhoneScreenProps {
  phoneNumber: string;
  validation: PhoneValidationResult;
  phoneLoading: boolean;
  isButtonEnabled: boolean;
  onPhoneNumberChange: (_text: string) => void;
  onValidationChange: (_validation: PhoneValidationResult) => void;
  onContinue: () => void;
}

function PhoneScreen({
  phoneNumber,
  validation,
  phoneLoading,
  isButtonEnabled,
  onPhoneNumberChange,
  onValidationChange,
  onContinue,
}: PhoneScreenProps) {
  return (
    <SafeAreaView style={styles.phoneContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.phoneContent}>
          <Text style={styles.phoneTitle}>Enter your phone number</Text>

          <Text style={styles.phoneSubtitle}>
            We'll send you a verification code to confirm your number
          </Text>

          <PhoneInput
            value={phoneNumber}
            onChangeText={onPhoneNumberChange}
            onValidationChange={onValidationChange}
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isButtonEnabled && styles.continueButtonDisabled,
            ]}
            onPress={onContinue}
            disabled={!isButtonEnabled}
          >
            <Text
              style={[
                styles.continueButtonText,
                !isButtonEnabled && styles.continueButtonTextDisabled,
              ]}
            >
              {phoneLoading ? "Sending..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default React.memo(PhoneScreen);

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
  buttonContainer: {
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
