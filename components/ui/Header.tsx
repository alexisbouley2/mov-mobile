import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import BackButton from "@/components/ui/button/BackButton";

interface HeaderProps {
  title: string;
  onBack: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export default function Header({
  title,
  onBack,
  rightComponent,
  style,
  titleStyle,
}: HeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <BackButton onPress={onBack} />
      <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
      {rightComponent && (
        <View style={styles.rightComponent}>{rightComponent}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    position: "relative",
  },
  headerTitle: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "600",
  },
  rightComponent: {
    position: "absolute",
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
