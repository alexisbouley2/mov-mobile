import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

interface ThreeDotsButtonProps {
  onPress?: () => void;
}

const ThreeDotsButton: React.FC<ThreeDotsButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 20,
    top: 0,
    bottom: 0,
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
