// components/event-form/EventPhotoSection.tsx
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

interface EventPhotoSectionProps {
  photo: string | null;
  onPhotoChange: (_photo: string | null) => void;
}

export default function EventPhotoSection({
  photo,
  onPhotoChange,
}: EventPhotoSectionProps) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Event Photo</Text>
      <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.eventPhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <IconSymbol name="camera" size={32} color="#666" />
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
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
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  eventPhoto: {
    width: "100%",
    height: "100%",
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
});
