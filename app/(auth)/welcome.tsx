import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useAuth } from "@/contexts/AuthContext";
import PhoneInput from "@/components/phone/PhoneInput";
import { PhoneValidationResult } from "@/utils/phoneValidation";
import { CommonStyles } from "@/styles/common";
import { ButtonStyles } from "@/styles/buttons";

type ScreenState = "welcome" | "phone";

function AuthScreen() {
  useDebugLifecycle("WelcomeScreen");

  const router = useRouter();
  const { signInWithOtp } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenState>("welcome");

  // Phone screen state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [validation, setValidation] = useState<PhoneValidationResult>({
    isValid: false,
  });
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Phone screen handlers
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
          <View style={styles.header}>
            <Text style={styles.logo}>POV</Text>
            <Text style={styles.title}>Welcome to POV</Text>
            <Text style={styles.subtitle}>
              POV lets you capture and share moments with your friends in a
              unique, event-based way. Get started to join the fun!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setCurrentScreen("phone");
            }}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render phone screen
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
            {phoneLoading ? "Sending..." : "Continue"}
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

export default React.memo(AuthScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    backgroundClip: "text",
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
