import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { config } from "@/lib/config";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useProfilePhoto } from "@/hooks/profile/useProfilePhoto";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import log from "@/utils/logger";

export default function EditProfileScreen() {
  const { user, supabaseUser, refreshUserProfile } = useAuth();

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

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user, setUsername]);

  const handleSave = async () => {
    if (!validateUsername()) {
      return;
    }

    if (!supabaseUser) {
      Alert.alert("Error", "No authenticated user");
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

      // Update user profile
      const API_BASE_URL = config.EXPO_PUBLIC_API_URL;
      const updateData: any = {
        username: username.trim(),
      };

      if (photoData) {
        updateData.profileImagePath = photoData.profileImagePath;
        updateData.profileThumbnailPath = photoData.profileThumbnailPath;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/${supabaseUser!.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      log.info("we are here 1");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update profile: ${response.status} - ${errorText}`
        );
      }

      await refreshUserProfile();

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
        loading={loading}
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
