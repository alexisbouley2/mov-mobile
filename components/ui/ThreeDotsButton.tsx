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
    <TouchableOpacity style={style} onPress={onPress}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginHorizontal: 2,
  },
});

export default ThreeDotsButton;
