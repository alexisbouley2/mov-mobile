// components/event/chat/renders/CustomMessageContainer.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import {
  MessageContainer,
  MessageContainerProps,
} from "react-native-gifted-chat";

export const CustomMessageContainer: React.FC<MessageContainerProps<any>> = (
  props
) => {
  return (
    <View style={styles.container}>
      <MessageContainer {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
});
