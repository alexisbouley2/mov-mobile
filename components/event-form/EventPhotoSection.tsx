import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useEventPhoto } from "@/hooks/event/useEventPhoto";

interface EventPhotoSectionProps {
  photo: string | null;
  onPhotoChange: (_photo: string | null) => void;
  onPhotoJobChange?: (_jobId: string | null) => void;
}

export default function EventPhotoSection({
  photo,
  onPhotoChange,
  onPhotoJobChange,
}: EventPhotoSectionProps) {
  const { previewImage, currentJobId, pickImage } = useEventPhoto({
    initialImageUrl: photo,
    onImageChange: (imageUri) => {
      onPhotoChange(imageUri);
      onPhotoJobChange?.(currentJobId);
    },
  });

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Event Photo</Text>

      <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
        {previewImage ? (
          <Image source={{ uri: previewImage }} style={styles.eventPhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <IconSymbol name="camera" size={32} color="#666" />
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
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
