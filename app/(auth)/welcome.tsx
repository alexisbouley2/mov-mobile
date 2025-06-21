import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import log from "@/utils/logger";

export default function WelcomeScreen() {
  useDebugLifecycle("WelcomeScreen");

  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>POV</Text>
          <Text style={styles.title}>Welcome to POV</Text>
          <Text style={styles.subtitle}>
            POV lets you capture and share moments with your friends in a
            unique, event-based way. Get started to join the fun!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            log.debug("Get Started button pressed");
            router.push("/(auth)/phone");
          }}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
    backgroundClip: "text",
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
