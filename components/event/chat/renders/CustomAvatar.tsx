// components/event/chat/renders/CustomAvatar.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Avatar, AvatarProps } from "react-native-gifted-chat";

export const CustomAvatar = (props: AvatarProps<any>) => {
  return (
    <Avatar
      {...props}
      containerStyle={{
        left: styles.avatarContainer,
        right: styles.rightAvatarContainer,
      }}
      imageStyle={{
        left: styles.avatarImage,
        right: styles.rightAvatarImage,
      }}
    />
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    marginRight: 4, // Reduced from 8
    marginLeft: 0, // Reduced from 4
    marginBottom: 0,
  },
  rightAvatarContainer: {
    marginLeft: 4, // Reduced from 8
    marginRight: 0, // Reduced from 4
    marginBottom: 0,
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  rightAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});
