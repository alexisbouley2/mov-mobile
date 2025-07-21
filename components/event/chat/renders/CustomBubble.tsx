// components/event/chat/renders/CustomBubble.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Bubble, BubbleProps, IMessage } from "react-native-gifted-chat";
import { CustomMessageText } from "./CustomMessageText";

export const CustomBubble = (props: BubbleProps<IMessage>) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.leftBubbleWrapper,
        right: styles.rightBubbleWrapper,
      }}
      containerStyle={{
        left: styles.leftContainer,
        right: styles.rightContainer,
      }}
      containerToNextStyle={{
        left: styles.containerToNext,
        right: styles.containerToNext,
      }}
      containerToPreviousStyle={{
        left: styles.containerToPrevious,
        right: styles.containerToPrevious,
      }}
      renderMessageText={(messageTextProps) => (
        <CustomMessageText {...messageTextProps} />
      )}
      renderTime={() => null} // Hide default time
      renderTicks={() => null} // Hide ticks
    />
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0, // No spacing
  },
  rightContainer: {
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0, // No spacing
  },
  containerToNext: {
    marginBottom: 2, // Minimal gap for same user
  },
  containerToPrevious: {
    marginBottom: 2, // Small gap for different users
  },
  leftBubbleWrapper: {
    backgroundColor: "#3a3a3c",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 0,
    marginLeft: 0,
    maxWidth: "80%",
  },
  rightBubbleWrapper: {
    backgroundColor: "#007AFF",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 0,
    marginRight: 0,
    maxWidth: "80%",
  },
});
