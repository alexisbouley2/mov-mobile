// The following packages need to be installed using the following commands:
// expo install expo-camera
// expo install expo-media-library
// expo install expo-sharing
// expo install expo-av

import { ResizeMode, Video } from "expo-av";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { shareAsync } from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";

interface RecordedVideo {
  uri: string;
  [key: string]: any;
}

export default function App() {
  const cameraRef = useRef<CameraView>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | undefined
  >();

  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState<RecordedVideo | undefined>();

  useEffect(() => {
    (async () => {
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  // Request permissions if not granted
  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (!microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [
    cameraPermission,
    microphonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
  ]);

  if (!cameraPermission || !microphonePermission) {
    return <Text>Requesting permissions...</Text>;
  }

  if (!cameraPermission.granted) {
    return <Text>Permission for camera not granted.</Text>;
  }

  const recordVideo = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    try {
      const recordedVideo = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });
      setVideo(recordedVideo);
    } catch (error) {
      console.error("Recording failed:", error);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!cameraRef.current) return;

    setIsRecording(false);
    cameraRef.current.stopRecording();
  };

  if (video) {
    const shareVideo = async () => {
      try {
        await shareAsync(video.uri);
        setVideo(undefined);
      } catch (error) {
        console.error("Sharing failed:", error);
      }
    };

    const saveVideo = async () => {
      try {
        await MediaLibrary.saveToLibraryAsync(video.uri);
        setVideo(undefined);
      } catch (error) {
        console.error("Saving failed:", error);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <Video
          style={styles.video}
          source={{ uri: video.uri }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
        <Button title="Share" onPress={shareVideo} />
        {hasMediaLibraryPermission ? (
          <Button title="Save" onPress={saveVideo} />
        ) : undefined}
        <Button title="Discard" onPress={() => setVideo(undefined)} />
      </SafeAreaView>
    );
  }

  return (
    <CameraView style={styles.container} ref={cameraRef} mode="video">
      <View style={styles.buttonContainer}>
        <Button
          title={isRecording ? "Stop Recording" : "Record Video"}
          onPress={isRecording ? stopRecording : recordVideo}
        />
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    backgroundColor: "#fff",
    alignSelf: "flex-end",
  },
  video: {
    flex: 1,
    alignSelf: "stretch",
  },
});
