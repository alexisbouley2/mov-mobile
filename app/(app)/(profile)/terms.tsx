import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
// import { TAB_BAR_HEIGHT } from "../(tabs)/_layout";

export default function TermsScreen() {
  const termsUrl = "https://getmovapp.com/terms/mobile";
  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Image
            source={require("@/assets/images/icon/cross.png")}
            style={styles.closeIcon}
          />
        </TouchableOpacity>
      </View>

      <WebView
        source={{ uri: termsUrl }}
        style={styles.webview}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
