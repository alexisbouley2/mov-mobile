import React from "react";
import { TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";

interface ThreeDotsButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

const ThreeDotsButton: React.FC<ThreeDotsButtonProps> = ({
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginHorizontal: 2,
  },
});

export default ThreeDotsButton;
