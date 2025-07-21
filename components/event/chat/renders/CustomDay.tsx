// components/event/chat/renders/CustomDay.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Day, DayProps } from "react-native-gifted-chat";

export const CustomDay = (props: DayProps) => {
  return (
    <Day
      {...props}
      containerStyle={styles.dayContainer}
      textStyle={styles.dayText}
    />
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  dayText: {
    backgroundColor: "#1c1c1e",
    color: "#8e8e93",
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
});
