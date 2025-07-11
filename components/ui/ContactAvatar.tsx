import React from "react";
import { View, StyleSheet } from "react-native";
import { CachedImage } from "./CachedImage";
import Svg, { Circle, Path } from "react-native-svg";

interface ContactAvatarProps {
  name: string;
  profileThumbnailUrl?: string;
  size?: number;
}

export default function ContactAvatar({
  name: _name,
  profileThumbnailUrl,
  size = 40,
}: ContactAvatarProps) {
  if (profileThumbnailUrl) {
    return (
      <CachedImage
        uri={profileThumbnailUrl}
        cachePolicy="profile-thumbnail"
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
      <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 40 40">
        <Circle cx="20" cy="20" r="20" fill="#888" />
        <Path
          d="M20 21c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 2c-4 0-12 2-12 6v3h24v-3c0-4-8-6-12-6z"
          fill="#fff"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: "#888",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});
