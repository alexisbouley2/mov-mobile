import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React from "react";
import {
  Dimensions,
  Image,
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
  mediaType: "photo" | "video";
  onDismiss: () => void;
  onSave: () => void;
}

export default function MediaPreview({
  mediaUri,
  mediaType,
  onDismiss,
  onSave,
}: MediaPreviewProps) {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Media Display */}
      <View style={styles.mediaContainer}>
        {mediaType === "photo" ? (
          <Image source={{ uri: mediaUri }} style={styles.media} />
        ) : (
          <Video
            source={{ uri: mediaUri }}
            style={styles.media}
            shouldPlay={true}
            isLooping
            resizeMode={ResizeMode.COVER}
          />
        )}
      </View>

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.actionsContainer}>
          {/* Download/Save Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onSave}>
            <Ionicons name="download" size={28} color="white" />
          </TouchableOpacity>

          {/* Add Text Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="text" size={28} color="white" />
          </TouchableOpacity>

          {/* Add Sticker Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="happy" size={28} color="white" />
          </TouchableOpacity>

          {/* Crop Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="crop" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <View style={styles.sendContainer}>
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send To</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.storyButton}>
            <Text style={styles.storyButtonText}>My Story</Text>
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
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 30,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
  storyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  storyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
