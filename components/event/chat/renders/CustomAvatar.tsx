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
        right: {},
      }}
      imageStyle={{
        left: styles.avatarImage,
        right: {},
      }}
    />
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    marginRight: 8,
    marginLeft: 0,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
