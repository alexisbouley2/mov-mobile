import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React from "react";
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MediaPreviewProps {
  mediaUri: string;
  onDismiss: () => void;
}

export default function MediaPreview({
  mediaUri,
  onDismiss,
}: MediaPreviewProps) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Media Display */}
      <View style={styles.mediaContainer}>
        <Video
          source={{ uri: mediaUri }}
          style={styles.media}
          shouldPlay={true}
          isLooping
          resizeMode={ResizeMode.COVER}
        />
      </View>

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Send Button */}
        <View style={styles.sendContainer}>
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send To</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  mediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: screenWidth,
    height: screenHeight,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dismissButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  sendContainer: {
    alignItems: "center",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0096ff",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
