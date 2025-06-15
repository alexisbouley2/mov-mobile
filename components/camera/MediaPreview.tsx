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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useVideoUpload } from "../../hooks/useVideoUpload";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MediaPreviewProps {
  mediaUri: string;
  userId: string;
  onDismiss: () => void;
  onUploadComplete?: () => void;
}

export default function MediaPreview({
  mediaUri,
  userId,
  onDismiss,
  onUploadComplete,
}: MediaPreviewProps) {
  const { uploadVideo, isUploading, uploadProgress, uploadStep } =
    useVideoUpload();

  const handleSend = async () => {
    try {
      console.log("=== MediaPreview: Starting upload ===");

      const result = await uploadVideo(mediaUri, userId);
      //TODO remove the await

      console.log("=== MediaPreview: Upload completed ===", result);
      Alert.alert("Success", "Video uploaded successfully!", [
        {
          text: "OK",
          onPress: () => {
            onUploadComplete?.();
            onDismiss();
          },
        },
      ]);
    } catch (error) {
      console.error("=== MediaPreview: Upload failed ===", error);
      Alert.alert("Error", "Failed to upload video. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

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

      {/* Loading Overlay with detailed progress */}
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>{Math.round(uploadProgress)}%</Text>
          <Text style={styles.loadingStepText}>{uploadStep}</Text>
        </View>
      )}

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          disabled={isUploading}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.sendContainer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isUploading && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isUploading}
          >
            <Text style={styles.sendButtonText}>
              {isUploading ? "Uploading..." : "Send To Event"}
            </Text>
            {!isUploading && (
              <Ionicons name="arrow-forward" size={20} color="white" />
            )}
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  loadingStepText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
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
    minWidth: 160,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#666",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
