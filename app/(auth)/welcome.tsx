import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useAuth } from "@/contexts/AuthContext";
import { PhoneValidationResult } from "@/utils/phoneValidation";
import WelcomeScreen from "@/components/auth/WelcomeScreen";
import PhoneScreen from "@/components/auth/PhoneScreen";

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
    return <WelcomeScreen onGetStarted={() => setCurrentScreen("phone")} />;
  }

  // Render phone screen
  return (
    <PhoneScreen
      phoneNumber={phoneNumber}
      validation={validation}
      phoneLoading={phoneLoading}
      isButtonEnabled={isButtonEnabled}
      onPhoneNumberChange={setPhoneNumber}
      onValidationChange={setValidation}
      onContinue={handleContinue}
    />
  );
}

export default React.memo(AuthScreen);
