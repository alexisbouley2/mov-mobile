import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AvatarPicker from "./AvatarPicker";

interface ProfileFormProps {
  username: string;
  onUsernameChange: (_username: string) => void;
  previewImage: string | null;
  onImagePress: () => void;
  onSubmit: () => void;
  loading: boolean;
  submitButtonText: string;
  loadingButtonText: string;
  avatarSize?: number;
  autoFocus?: boolean;
}

export default function ProfileForm({
  username,
  onUsernameChange,
  previewImage,
  onImagePress,
  onSubmit,
  loading,
  submitButtonText,
  loadingButtonText,
  avatarSize = 100,
  autoFocus,
}: ProfileFormProps) {
  const isFormValid = username.trim().length >= 3;

  return (
    <View style={styles.content}>
      <AvatarPicker
        imageUri={previewImage}
        onPress={onImagePress}
        size={avatarSize}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={20}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (!isFormValid || loading) && styles.buttonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!isFormValid || loading}
      >
        <Text
          style={[
            styles.buttonText,
            (!isFormValid || loading) && styles.buttonTextDisabled,
          ]}
        >
          {loading ? loadingButtonText : submitButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 64,
  },
  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
    marginTop: 40,
    textAlign: "center",
  },
  button: {
    marginTop: 70,
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: "#666",
  },
});
