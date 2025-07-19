// app/(app)/(media)/preview.tsx
import Video from "react-native-video";
import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { mediaUploadManager } from "@/services/upload";
import { useUserEvents } from "@/contexts/UserEventsContext";
import log from "@/utils/logger";

export default function MediaPreviewScreen() {
  const params = useLocalSearchParams();
  const mediaUri = params.mediaUri as string;
  const userId = params.userId as string;

  const router = useRouter();
  const { events } = useUserEvents();
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);

  // Auto-play when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      setPaused(false);
      return () => {
        setPaused(true);
      };
    }, [])
  );

  const handleSend = async () => {
    try {
      log.info("Creating upload job for video");

      // Pause video
      setPaused(true);

      // Create upload job
      const jobId = mediaUploadManager.createJob(mediaUri, userId, "video", {
        quality: 0.8,
        time: 1000,
      });

      // Start upload in background
      mediaUploadManager.startUpload(jobId, (progress) => {
        log.debug(`Upload progress: ${progress}%`);
      });

      // Navigate based on available events
      const currentEvents = events.current || [];

      if (currentEvents.length === 0) {
        router.push({
          pathname: "/(app)/(events)/create",
          params: { jobId },
        });
      } else {
        router.push({
          pathname: "/(app)/(events)/select-events",
          params: { jobId },
        });
      }
    } catch (error) {
      log.error("Failed to create upload job:", error);
    }
  };

  const handleDismiss = () => {
    setPaused(true);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Video */}
      <Video
        ref={videoRef}
        source={{ uri: mediaUri }}
        style={styles.media}
        paused={paused}
        repeat={true}
        resizeMode="cover"
        controls={false}
        muted={false}
      />

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.crossIcon} onPress={handleDismiss}>
          <Image
            source={require("@/assets/images/icon/cross.png")}
            style={styles.crossIcon}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  media: {
    flex: 1,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  crossIcon: {
    width: 44,
    height: 44,
    marginRight: 20,
    marginTop: 15,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: "flex-end",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "700",
    alignItems: "center",
  },
});
