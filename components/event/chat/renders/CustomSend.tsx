// components/event/chat/renders/CustomSend.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { SendProps } from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";

export const CustomSend = (props: SendProps<any>) => {
  const isDisabled = !props.text || !props.text.trim();

  return (
    <TouchableOpacity
      style={[
        styles.sendContainer,
        styles.sendButton,
        isDisabled ? styles.disabledButton : styles.enabledButton,
      ]}
      onPress={() => {
        if (props.onSend && props.text && props.text.trim()) {
          props.onSend({ text: props.text.trim() }, true);
        }
      }}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
    >
      <Ionicons
        name="arrow-up"
        size={20}
        color={isDisabled ? "#8e8e93" : "#fff"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginLeft: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  enabledButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#8e8e93",
  },
});
