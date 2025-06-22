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
      />

      <TouchableOpacity
        style={[
          styles.button,
          (!isFormValid || loading) && styles.buttonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!isFormValid || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? loadingButtonText : submitButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
