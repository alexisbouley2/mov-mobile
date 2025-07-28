import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CachedImage } from "@/components/ui/CachedImage";

interface AvatarPickerProps {
  imageUri?: string | null;
  onPress: () => void;
  size?: number;
  shouldCache?: boolean;
}

export default function AvatarPicker({
  imageUri,
  onPress,
  size = 100,
  shouldCache = true,
}: AvatarPickerProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {imageUri ? (
        <CachedImage
          uri={imageUri}
          cachePolicy="profile-image"
          fallbackSource={undefined}
          showLoading={true}
          loadingSize="small"
          loadingColor="#666"
          shouldCache={shouldCache}
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={styles.avatarText}>+</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {},
  avatar: {
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#666",
    fontSize: 32,
    fontWeight: "300",
  },
});
