import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface User {
  id: string;
  username: string;
  profileThumbnailUrl?: string | null | undefined;
}

interface ParticipantAvatarProps {
  user: User;
  size?: number;
}

export default function ParticipantAvatar({
  user,
  size = 40,
}: ParticipantAvatarProps) {
  if (user.profileThumbnailUrl) {
    return (
      <Image
        source={{ uri: user.profileThumbnailUrl }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.placeholderText, { fontSize: size * 0.35 }]}>
        {user.username.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
