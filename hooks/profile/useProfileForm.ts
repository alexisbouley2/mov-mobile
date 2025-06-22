import { useState } from "react";
import { Alert } from "react-native";

interface UseProfileFormProps {
  initialUsername?: string;
}

export function useProfileForm({
  initialUsername = "",
}: UseProfileFormProps = {}) {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);

  const validateUsername = (): boolean => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return false;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long");
      return false;
    }

    return true;
  };

  const isFormValid = username.trim().length >= 3;

  return {
    username,
    setUsername,
    loading,
    setLoading,
    validateUsername,
    isFormValid,
  };
}
