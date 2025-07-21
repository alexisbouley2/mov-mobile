// components/event/chat/renders/CustomInputToolbar.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { InputToolbar, InputToolbarProps } from "react-native-gifted-chat";

export const CustomInputToolbar = (props: InputToolbarProps<any>) => {
  return (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbarContainer}
      primaryStyle={styles.inputToolbarPrimary}
    />
  );
};

const styles = StyleSheet.create({
  inputToolbarContainer: {
    backgroundColor: "#000",
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputToolbarPrimary: {
    backgroundColor: "#1c1c1e",
    borderRadius: 20,
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 4,
    minHeight: 44,
  },
});
