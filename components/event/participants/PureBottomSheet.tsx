import React, { useRef, useEffect } from "react";
import {
  Modal,
  Animated,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.61;

interface PureBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PureBottomSheet: React.FC<PureBottomSheetProps> & {
  Footer: React.FC<{ loading: boolean }>;
} = ({ visible, onClose, children }) => {
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

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
    } else {
      translateY.setValue(BOTTOM_SHEET_HEIGHT);
      opacity.setValue(0);
    }
  }, [visible, translateY, opacity]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={[styles.backdrop, { opacity }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: BOTTOM_SHEET_HEIGHT,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

PureBottomSheet.displayName = "PureBottomSheet";

PureBottomSheet.Footer = ({ loading }) => (
  <View style={styles.loadingFooter}>
    {loading ? <ActivityIndicator size="small" color="#666" /> : null}
  </View>
);

PureBottomSheet.Footer.displayName = "PureBottomSheetFooter";

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
    alignSelf: "center",
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
});

export default PureBottomSheet;
