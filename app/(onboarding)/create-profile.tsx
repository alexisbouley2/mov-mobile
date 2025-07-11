// app/(onboarding)/create-profile.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import ProfileForm from "@/components/profile/ProfileForm";
import { useProfilePhoto } from "@/hooks/profile/useProfilePhoto";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import log from "@/utils/logger";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

export default function CreateProfileScreen() {
  useDebugLifecycle("CreateProfileScreen");

  const router = useRouter();
  const { createUserProfile, profileError, clearProfileError } =
    useUserProfile();
  const { pendingCountryCode } = useAuth();

  const { username, setUsername, loading, setLoading, validateUsername } =
    useProfileForm();
  const {
    previewImage,
    pickImage,
    getPhotoData,
    isUploading,
    waitForUpload,
    cleanup,
  } = useProfilePhoto();
  // Handle profile errors
  useEffect(() => {
    if (profileError) {
      Alert.alert("Profile Error", profileError, [
        { text: "OK", onPress: clearProfileError },
      ]);
    }
  }, [profileError, clearProfileError]);

  const handleCreateAccount = async () => {
    if (!validateUsername()) {
      return;
    }

    setLoading(true);

    try {
      // If there's an upload in progress, wait for it to complete
      if (isUploading) {
        await waitForUpload();
      }

      let photoData = undefined;

      // If there's a completed photo job, get the upload result
      const photoResult = getPhotoData();
      if (photoResult) {
        photoData = photoResult;
        cleanup();
      }

      // Create user profile with or without photo
      const { error: profileError } = await createUserProfile(
        username.trim(),
        pendingCountryCode || "+33", // Default to France if not provided
        photoData
      );

      if (profileError) {
        throw new Error(profileError);
      }

      log.info("Profile created successfully");

      // Navigate to the root index which will handle routing to the main app
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ProfileForm
        username={username}
        onUsernameChange={setUsername}
        previewImage={previewImage}
        onImagePress={pickImage}
        onSubmit={handleCreateAccount}
        loading={loading}
        submitButtonText="Create Account"
        loadingButtonText={
          isUploading ? "Waiting for upload..." : "Creating Account..."
        }
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
