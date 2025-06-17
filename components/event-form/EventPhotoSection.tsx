import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { eventPhotoJobManager } from "@/services/eventPhotoJobService";

interface EventPhotoSectionProps {
  photo: string | null;
  onPhotoChange: (_photo: string | null) => void;
  onPhotoJobChange?: (_jobId: string | null) => void;
  isLoading?: boolean;
  uploadProgress?: number;
}

export default function EventPhotoSection({
  photo,
  onPhotoChange,
  onPhotoJobChange,
  isLoading = false,
  uploadProgress = 0,
}: EventPhotoSectionProps) {
  const { supabaseUser } = useAuth();

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need access to your photos to set an event image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Event photos use 16:9 aspect ratio instead of 1:1
        quality: 1,
      });

      if (!result.canceled && result.assets[0] && supabaseUser) {
        const imageUri = result.assets[0].uri;

        try {
          // Create and process the photo job
          const jobId = await eventPhotoJobManager.createAndProcessJob(
            imageUri,
            supabaseUser.id
          );

          // Get preview and update UI immediately
          const preview = eventPhotoJobManager.getPreview(jobId);
          if (preview) {
            onPhotoChange(preview);
            onPhotoJobChange?.(jobId);
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Event Photo</Text>

      <TouchableOpacity
        style={styles.photoContainer}
        onPress={pickImage}
        disabled={isLoading}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.eventPhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <IconSymbol name="camera" size={32} color="#666" />
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
          </View>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Processing... {Math.round(uploadProgress)}%
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                />
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.helperText}>
        Choose a photo that represents your event (16:9 aspect ratio)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  photoContainer: {
    width: "100%",
    height: 160, // 16:9 aspect ratio container
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  eventPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  progressText: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    width: 120,
    height: 3,
    backgroundColor: "#333",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});
