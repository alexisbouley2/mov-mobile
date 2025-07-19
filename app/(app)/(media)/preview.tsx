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

export default function MediaPreviewScreen() {
  const params = useLocalSearchParams();
  const mediaUri = params.mediaUri as string;
  const userId = params.userId as string;

  const { videoRef, paused, handleSend, handleDismiss } = useMediaPreview({
    mediaUri,
    userId,
  });

  return (
    <View style={styles.container}>
      {/* Media Display */}
      <Video
        key={mediaUri}
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
