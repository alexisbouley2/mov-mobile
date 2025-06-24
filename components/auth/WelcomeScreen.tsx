import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo/mov-logo.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to MOV</Text>
          <Text style={styles.subtitle}>
            MOV lets you capture and share moments with your friends in a
            unique, event-based way. Get started to join the fun!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={onGetStarted}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(WelcomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 120,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 75,
  },
  textContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    marginBottom: 80,
    gap: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "#888",
    textAlign: "center",
    lineHeight: 26,
  },
  getStartedButton: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  getStartedButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
  },
});
