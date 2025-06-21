import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import PhoneInput from "@/components/phone/PhoneInput";
import { PhoneValidationResult } from "@/utils/phoneValidation";
import { CommonStyles } from "@/styles/common";
import { ButtonStyles } from "@/styles/buttons";

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
    <SafeAreaView style={CommonStyles.container}>
      <View style={CommonStyles.contentWithTopPadding}>
        <Text style={CommonStyles.title}>Enter your phone number</Text>

        <Text style={CommonStyles.subtitle}>
          We'll send you a verification code to confirm your number
        </Text>

        <PhoneInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onValidationChange={setValidation}
          autoFocus={true}
        />

        {!validation.isValid && phoneNumber.length > 0 && validation.error && (
          <View style={CommonStyles.errorContainer}>
            <Text style={CommonStyles.errorText}>{validation.error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            ButtonStyles.primary,
            !isButtonEnabled && ButtonStyles.primaryDisabled,
            { marginTop: 20 },
          ]}
          onPress={handleContinue}
          disabled={!isButtonEnabled}
        >
          <Text
            style={[
              ButtonStyles.primaryText,
              !isButtonEnabled && ButtonStyles.primaryTextDisabled,
            ]}
          >
            {loading ? "Sending..." : "Continue"}
          </Text>
        </TouchableOpacity>

        <Text style={CommonStyles.disclaimer}>
          By continuing, you agree to receive SMS messages from us. Message and
          data rates may apply.
        </Text>
      </View>
    </SafeAreaView>
  );
}
