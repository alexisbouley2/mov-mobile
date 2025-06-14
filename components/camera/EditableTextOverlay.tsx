// components/EditableTextOverlay.tsx
import React, { useRef } from "react";
import { Animated, PanResponder, StyleSheet, TextInput } from "react-native";

interface EditableTextOverlayProps {
  text: string;
  setText: (_value: string) => void;
}

export default function EditableTextOverlay({
  text,
  setText,
}: EditableTextOverlayProps) {
  const pan = useRef(new Animated.ValueXY({ x: 100, y: 300 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx + 100, y: gestureState.dy + 300 });
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.textWrapper, pan.getLayout()]}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.textInput}
        placeholder="Type here..."
        placeholderTextColor="white"
        multiline
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  textWrapper: {
    position: "absolute",
  },
  textInput: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
