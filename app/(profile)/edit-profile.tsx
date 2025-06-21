import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { photoJobManager } from "@/services/photoJobService";
import AvatarPicker from "@/components/profile/AvatarPicker";
import { config } from "@/lib/config";
import log from "@/utils/logger";

export default function EditProfileScreen() {
  const { user, supabaseUser, refreshUserProfile } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [_selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.photoUrl || null
  );
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setPreviewImage(user.photoUrl || null);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need camera roll permissions to select photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0] && supabaseUser) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);

        try {
          const jobId = await photoJobManager.createAndProcessJob(
            imageUri,
            supabaseUser.id,
            "user",
            supabaseUser.id
          );

          setCurrentJobId(jobId);

          const preview = photoJobManager.getPreview(jobId);
          if (preview) {
            setPreviewImage(preview);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to process image");
          log.error("Image processing error:", error);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      log.error("Image picker error:", error);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long");
      return;
    }

    if (!supabaseUser) {
      Alert.alert("Error", "No authenticated user");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let photoData = undefined;

      // If there's a new photo job, upload it
      if (currentJobId) {
        try {
          log.info("Uploading new photo...");
          const uploadResult = await photoJobManager.uploadJob(
            currentJobId,
            (progress: any) => {
              setUploadProgress(progress);
            }
          );

          photoData = {
            profileImagePath: uploadResult.imagePath,
            profileThumbnailPath: uploadResult.thumbnailPath,
          };

          photoJobManager.cleanupJob(currentJobId);
          setCurrentJobId(null);
        } catch (uploadError) {
          log.error("Photo upload failed:", uploadError);
          Alert.alert(
            "Warning",
            "Photo upload failed. Saving profile without new photo."
          );
        }
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

      const response = await fetch(`${API_BASE_URL}/users/${supabaseUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update profile: ${response.status} - ${errorText}`
        );
      }

      log.info("Profile updated successfully");
      await refreshUserProfile();
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const cancelUpload = () => {
    if (currentJobId) {
      photoJobManager.cancelJob(currentJobId);
      setCurrentJobId(null);
      setSelectedImage(null);
      setPreviewImage(user?.photoUrl || null);
      setUploadProgress(0);
    }
  };

  const handleBack = () => {
    if (currentJobId) {
      photoJobManager.cancelJob(currentJobId);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <AvatarPicker imageUri={previewImage} onPress={pickImage} size={120} />

        {loading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Uploading photo...</Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(uploadProgress)}%
            </Text>
            {currentJobId && (
              <TouchableOpacity
                onPress={cancelUpload}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[
            styles.button,
            (!username.trim() || loading) && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={!username.trim() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: "center",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  progressLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  progressText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#333",
    borderRadius: 16,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 12,
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
