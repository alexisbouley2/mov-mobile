import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { mediaUploadManager } from "@/services/upload";
import log from "@/utils/logger";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MediaPreviewProps {
  mediaUri: string;
  userId: string;
  onDismiss: () => void;
}

export default function MediaPreview({
  mediaUri,
  userId,
  onDismiss,
}: MediaPreviewProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  // Cleanup video when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  // Handle send button
  const handleSend = async () => {
    try {
      log.info("=== MediaPreview: Creating unified upload job ===");

      // Stop video before navigating
      if (videoRef.current) {
        await videoRef.current.pauseAsync();
      }

      // Create job immediately
      const newJobId = mediaUploadManager.createJob(mediaUri, userId, "video", {
        quality: 0.8,
        time: 1000,
      });

      setJobId(newJobId);

      // Start upload in background
      mediaUploadManager.startUpload(newJobId, (progress) => {
        log.debug(`Video upload progress: ${progress}%`);
      });

      // Navigate to event selection immediately
      router.push({
        pathname: "/(app)/(events)/select-events",
        params: { jobId: newJobId },
      });
    } catch (error) {
      log.error("=== MediaPreview: Failed to create job ===", error);
      Alert.alert("Error", "Failed to start upload. Please try again.");
    }
  };

  // Handle dismiss with job cleanup
  const handleDismiss = async () => {
    // Stop video before dismissing
    if (videoRef.current) {
      await videoRef.current.pauseAsync();
    }

    if (jobId) {
      Alert.alert("Cancel Upload", "Are you sure? The video will be deleted.", [
        { text: "Keep Video", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              mediaUploadManager.cancelJob(jobId);
              onDismiss();
            } catch (error) {
              log.error("Failed to cancel job:", error);
              onDismiss();
            }
          },
        },
      ]);
    } else {
      onDismiss();
    }
  };

  return (
    <View style={styles.container}>
      {/* Media Display */}
      <View style={styles.mediaContainer}>
        <Video
          ref={videoRef}
          source={{ uri: mediaUri }}
          style={styles.media}
          shouldPlay={true}
          isLooping
          resizeMode={ResizeMode.COVER}
        />
      </View>

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.sendContainer}>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send To Event</Text>
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
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
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
});
