// app/(app)/(media)/preview.tsx
import Video from "react-native-video";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useMediaPreview } from "@/hooks/media/useMediaPreview";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { Ionicons } from "@expo/vector-icons";

export default function MediaPreviewScreen() {
  const params = useLocalSearchParams();
  const mediaUri = params.mediaUri as string;
  const userId = params.userId as string;

  useDebugLifecycle("MediaPreviewScreen");

  const {
    videoRef,
    paused,
    isMuted,
    handleSend,
    handleDismiss,
    handleMuteToggle,
  } = useMediaPreview({
    mediaUri,
    userId,
  });

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
        muted={isMuted}
        // Add buffer config to reduce memory usage
        bufferConfig={{
          minBufferMs: 2000,
          maxBufferMs: 5000,
          bufferForPlaybackMs: 1000,
          bufferForPlaybackAfterRebufferMs: 1000,
        }}
        // Reduce max bit rate to save memory
        maxBitRate={2000000} // 2 Mbps
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

      {/* Mute Button */}
      <TouchableOpacity style={styles.muteButton} onPress={handleMuteToggle}>
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={36}
          color="#fff"
        />
      </TouchableOpacity>

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
  muteButton: {
    position: "absolute",
    bottom: 120,
    right: 30,
    zIndex: 100,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
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
