// components/event/chat/renders/CustomLoadEarlier.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LoadEarlierProps } from "react-native-gifted-chat";

export const CustomLoadEarlier = (props: LoadEarlierProps) => {
  if (props.isLoadingEarlier) {
    return (
      <TouchableOpacity style={styles.container} disabled>
        <ActivityIndicator size="small" color="#8e8e93" />
        <Text style={styles.loadingText}>Loading...</Text>
      </TouchableOpacity>
    );
  }

  return;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    marginHorizontal: 16,
    flexDirection: "row",
  },
  text: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingText: {
    color: "#8e8e93",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});
