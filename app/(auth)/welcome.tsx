import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneValidationResult } from "@/utils/phoneValidation";
import PhoneInput from "@/components/auth/phone/PhoneInput";
import { styles } from "./welcome.style";

type ScreenState = "welcome" | "phone";

function AuthScreen() {
  useDebugLifecycle("WelcomeScreen");

  const router = useRouter();
  const { signInWithOtp } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("welcome");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [validation, setValidation] = useState<PhoneValidationResult>({
    isValid: false,
  });
  const [phoneLoading, setPhoneLoading] = useState(false);

  const handleContinue = async () => {
    if (!validation.isValid || !validation.formattedNumber) {
      Alert.alert(
        "Error",
        validation.error || "Please enter a valid phone number"
      );
      return;
    }

    setPhoneLoading(true);
    const { error } = await signInWithOtp(validation.formattedNumber);
    setPhoneLoading(false);

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
    validation.isValid && phoneNumber.length > 0 && !phoneLoading;

  // Render welcome screen
  if (currentScreen === "welcome") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo/mov-logo.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to MOV</Text>
            <Text style={styles.subtitle}>
              MOV lets you capture and share moments with your friends in a
              unique, event-based way. Get started to join the fun!
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => setCurrentScreen("phone")}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render phone screen
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
            onChangeText={setPhoneNumber}
            onValidationChange={setValidation}
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
              !isButtonEnabled && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
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

export default React.memo(AuthScreen);
