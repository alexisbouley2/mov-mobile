// components/event/chat/renders/CustomBubble.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Bubble, BubbleProps } from "react-native-gifted-chat";

export const CustomBubble = (props: BubbleProps<any>) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.leftBubbleWrapper,
        right: styles.rightBubbleWrapper,
      }}
      textStyle={{
        left: styles.leftBubbleText,
        right: styles.rightBubbleText,
      }}
    />
  );
};

const styles = StyleSheet.create({
  leftBubbleWrapper: {
    backgroundColor: "#2c2c2e",
    borderRadius: 18,
    marginLeft: 8,
    marginRight: 60,
  },
  rightBubbleWrapper: {
    backgroundColor: "#007AFF",
    borderRadius: 18,
    marginLeft: 60,
    marginRight: 8,
  },
  leftBubbleText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rightBubbleText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftTimeText: {
    color: "#8e8e93",
    fontSize: 11,
    marginLeft: 16,
    marginBottom: 8,
  },
});
