// hooks/useBottomSheet.ts
import { useRef, useEffect } from "react";
import { Animated, PanResponder, Dimensions } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export function useBottomSheet(visible: boolean, onClose: () => void) {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, gestureState.dy);
        translateY.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;

        if (dy > SWIPE_THRESHOLD || vy > SWIPE_VELOCITY_THRESHOLD) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: BOTTOM_SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  return {
    translateY,
    opacity,
    panResponder,
    closeSheet,
    BOTTOM_SHEET_HEIGHT,
  };
}
