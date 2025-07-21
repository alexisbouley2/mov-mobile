// components/event/chat/renders/CustomSend.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Send, SendProps } from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";

export const CustomSend = (props: SendProps<any>) => {
  return (
    <Send {...props} containerStyle={styles.sendContainer}>
      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => {
          console.log("send button pressed");
          console.log("props.text", props.text);
          console.log("props.onSend", props.onSend);
          console.log("props.text.trim()", props.text?.trim());
          console.log(
            "props.onSend && props.text && props.text.trim()",
            props.onSend && props.text && props.text.trim()
          );
          if (props.onSend && props.text && props.text.trim()) {
            props.onSend({ text: props.text.trim() }, true);
          }
        }}
      >
        <Ionicons name="arrow-up" size={20} color="#fff" />
      </TouchableOpacity>
    </Send>
  );
};

const styles = StyleSheet.create({
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 8,
    paddingLeft: 8,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
