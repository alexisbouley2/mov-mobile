import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { photoJobManager } from "@/services/photoJobService";
import AvatarPicker from "@/components/profile/AvatarPicker";

export default function CreateProfileScreen() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [_selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { createUserProfile, supabaseUser } = useAuth();

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need camera roll permissions to select photos"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0] && supabaseUser) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);

        // Immediately process image and show preview
        try {
          const jobId = await photoJobManager.createAndProcessJob(
            imageUri,
            supabaseUser.id,
            "user",
            supabaseUser.id
          );

          setCurrentJobId(jobId);

          // Get and show preview immediately
          const preview = photoJobManager.getPreview(jobId);
          if (preview) {
            setPreviewImage(preview);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to process image");
          console.error("Image processing error:", error);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error("Image picker error:", error);
    }
  };

  const handleCreateAccount = async () => {
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

      // If there's a photo job, upload it first
      if (currentJobId) {
        try {
          console.log("Uploading photo...");
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

          // Clean up the job
          photoJobManager.cleanupJob(currentJobId);
          setCurrentJobId(null);
        } catch (uploadError) {
          console.error("Photo upload failed:", uploadError);
          // Continue without photo
          Alert.alert(
            "Warning",
            "Photo upload failed. Creating profile without photo."
          );
        }
      }

      // Create user profile with or without photo
      const { error: profileError } = await createUserProfile(
        username.trim(),
        photoData
      );

      if (profileError) {
        throw new Error(profileError.message || "Failed to create profile");
      }

      console.log("Profile created successfully");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create profile"
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
      setPreviewImage(null);
      setUploadProgress(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AvatarPicker imageUri={previewImage} onPress={pickImage} />

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
          autoFocus
        />

        <TouchableOpacity
          style={[
            styles.button,
            (!username.trim() || loading) && styles.buttonDisabled,
          ]}
          onPress={handleCreateAccount}
          disabled={!username.trim() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Create Account"}
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
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
