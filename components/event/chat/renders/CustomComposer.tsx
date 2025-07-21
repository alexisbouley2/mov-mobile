// components/event/chat/renders/CustomComposer.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Composer, ComposerProps } from "react-native-gifted-chat";

export const CustomComposer = (props: ComposerProps) => {
  return (
    <Composer
      {...props}
      textInputStyle={styles.textInput}
      placeholderTextColor="#8e8e93"
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: 16,
    lineHeight: 20,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
  },
});
