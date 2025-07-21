// components/event/chat/renders/CustomMessageText.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MessageTextProps } from "react-native-gifted-chat";

export const CustomMessageText = (props: MessageTextProps<any>) => {
  const { currentMessage, position } = props;

  if (!currentMessage) return null;

  const isLeft = position === "left";
  const date = new Date(currentMessage.createdAt);
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.text, isLeft ? styles.leftText : styles.rightText]}>
        {currentMessage.text}
      </Text>
      <View style={styles.timeWrapper}>
        <Text
          style={[styles.time, isLeft ? styles.leftTime : styles.rightTime]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    flexShrink: 1,
  },
  leftText: {
    color: "#ffffff",
  },
  rightText: {
    color: "#ffffff",
  },
  timeWrapper: {
    marginLeft: "auto",
    marginBottom: -2,
    paddingLeft: 4,
  },
  time: {
    fontSize: 11,
    lineHeight: 13,
  },
  leftTime: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  rightTime: {
    color: "rgba(255, 255, 255, 0.5)",
  },
});
