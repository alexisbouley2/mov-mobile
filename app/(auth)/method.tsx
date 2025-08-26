import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "@/lib/supabase";
import log from "@/utils/logger";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

function AuthMethodScreen() {
  const router = useRouter();

  const handlePhoneAuth = () => {
    router.push("/(auth)/phone");
  };

  const handleGoogleAuth = async () => {
    try {
      console.log("here 1");
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log("here 2", userInfo);

      // Access idToken from the nested structure
      if (userInfo.data?.idToken) {
        // Sign in with Supabase using the identity token (same as Apple)
        console.log("here 3", userInfo.data.idToken);

        const { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        console.log("here 4", error);

        if (error) {
          log.error("Supabase Google sign in error:", error);
          Alert.alert("Error", "Failed to sign in with Google");
        } else {
          console.log("here 5");
          router.replace("/");
        }
      } else {
        Alert.alert("Error", "No ID token received from Google");
      }
    } catch (error) {
      log.error("Google auth error:", error);
      Alert.alert("Error", "Something went wrong with Google sign in");
    }
  };

  const handleAppleAuth = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        // Sign in with Supabase using the identity token
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });

        if (error) {
          log.error("Supabase Apple sign in error:", error);
          Alert.alert("Error", "Failed to sign in with Apple");
        } else {
          router.replace("/");
        }
      }
    } catch (error: any) {
      log.error("Apple auth error:", error);
      Alert.alert("Error", "Something went wrong with Apple sign in");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Choose how to sign in</Text>
          <Text style={styles.subtitle}>
            Select your preferred authentication method to continue
          </Text>
        </View>

        <View style={styles.methodsContainer}>
          {/* Apple Sign In - iOS only */}
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={[styles.methodButton, styles.appleButton]}
              onPress={handleAppleAuth}
            >
              <View style={styles.methodButtonContent}>
                <Ionicons name="logo-apple" size={24} color="#000" />
                <Text style={[styles.methodButtonText, styles.appleButtonText]}>
                  Continue with Apple
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.methodButton, styles.googleButton]}
            onPress={handleGoogleAuth}
          >
            <View style={styles.methodButtonContent}>
              <Image
                source={require("@/assets/images/logo/google-logo.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
              <Text style={[styles.methodButtonText, styles.googleButtonText]}>
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>

          {/* Phone Number Sign In */}
          {false && (
            <TouchableOpacity
              style={[styles.methodButton, styles.phoneButton]}
              onPress={handlePhoneAuth}
            >
              <View style={styles.methodButtonContent}>
                <Ionicons name="call-outline" size={24} color="#666" />
                <Text style={[styles.methodButtonText, styles.phoneButtonText]}>
                  Continue with Phone
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 48,
  },
  headerContainer: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 48,
  },
  methodButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  methodButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  methodButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  // Apple Button (Black with white text)
  appleButton: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  appleButtonText: {
    color: "#000",
  },
  // Google Button (White with dark text)
  googleButton: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  googleButtonText: {
    color: "#000",
  },
  // Phone Button (Dark with border)
  phoneButton: {
    backgroundColor: "transparent",
    borderColor: "#333",
  },
  phoneButtonText: {
    color: "#fff",
  },
});

export default AuthMethodScreen;
