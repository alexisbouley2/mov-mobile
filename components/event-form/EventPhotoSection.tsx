import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface EventPhotoSectionProps {
  pickImage: () => Promise<void>;
  previewImage: string | null;
}

export default function EventPhotoSection({
  pickImage,
  previewImage,
}: EventPhotoSectionProps) {
  return (
    <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
      {previewImage ? (
        <Image source={{ uri: previewImage }} style={styles.eventPhoto} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <IconSymbol name="camera" size={32} color="#666" />
          <Text style={styles.photoPlaceholderText}>Add Cover</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    width: "100%",
    height: 160, // 16:9 aspect ratio container
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#808080",
  },
  eventPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
});
