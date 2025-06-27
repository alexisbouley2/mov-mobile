import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import AvatarPicker from "./AvatarPicker";
import SubmitButton from "../ui/SubmitButton";
import { typography } from "@/styles";

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
        style={[
          typography.profileTextInput,
          { marginTop: 40, marginBottom: 60 },
        ]}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={20}
      />

      <SubmitButton
        onPress={onSubmit}
        disabled={!isFormValid}
        loading={loading}
        submitText={submitButtonText}
        loadingText={loadingButtonText}
      />
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
});
