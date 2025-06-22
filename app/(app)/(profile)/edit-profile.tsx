// app/(app)/(profile)/edit-profile.tsx
import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useUserProfile } from "@/contexts/UserProfileContext";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useProfilePhoto } from "@/hooks/profile/useProfilePhoto";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import log from "@/utils/logger";

export default function EditProfileScreen() {
  const {
    user,
    updateUserProfile,
    profileLoading,
    profileError,
    clearProfileError,
  } = useUserProfile();

  const { username, setUsername, loading, setLoading, validateUsername } =
    useProfileForm({
      initialUsername: user?.username || "",
    });

  const {
    previewImage,
    pickImage,
    getPhotoData,
    isUploading,
    waitForUpload,
    cleanup,
    cancelJob,
  } = useProfilePhoto({
    initialImageUrl: user?.profileImageUrl || null,
  });

  // Update username when user data changes
  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user, setUsername]);

  // Handle profile errors
  useEffect(() => {
    if (profileError) {
      Alert.alert("Profile Error", profileError, [
        { text: "OK", onPress: clearProfileError },
      ]);
    }
  }, [profileError, clearProfileError]);

  const handleSave = async () => {
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

      // Update user profile using the context method
      const { error } = await updateUserProfile(
        { username: username.trim() },
        photoData
      );

      if (error) {
        throw new Error(error);
      }

      log.info("Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    cancelJob();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader title="Edit Profile" onBack={handleBack} />

      <ProfileForm
        username={username}
        onUsernameChange={setUsername}
        previewImage={previewImage}
        onImagePress={pickImage}
        onSubmit={handleSave}
        loading={loading || profileLoading}
        submitButtonText="Save"
        loadingButtonText={isUploading ? "Waiting for upload..." : "Saving..."}
        avatarSize={120}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
