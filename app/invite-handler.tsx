import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useInvite } from "@/contexts/InviteContext";

import { eventsApi } from "@/services/api/events";
import log from "@/utils/logger";

export default function InviteHandlerScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { user } = useUserProfile();
  const { setPendingInviteToken } = useInvite();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleInvite = async () => {
      if (!token) {
        setError("Invalid invite link");
        setLoading(false);
        return;
      }

      try {
        // Validate the invite token
        const data = await eventsApi.validateInvite(token);

        if (!data.valid) {
          setError(data.error || "Invalid invite");
          setLoading(false);
          return;
        }

        // If user is authenticated and has profile, process invite immediately
        if (isAuthenticated && user) {
          try {
            const acceptResponse = await eventsApi.acceptInvite({
              token,
              userId: user.id,
            });

            if (acceptResponse.success) {
              Alert.alert("Success", acceptResponse.message, [
                {
                  text: "OK",
                  onPress: () => {
                    router.push("/(app)/(tabs)/events");
                    router.push(`/(app)/(event)/${acceptResponse.eventId}`);
                  },
                },
              ]);
            } else {
              setError(acceptResponse.message);
            }
          } catch (err) {
            log.error("Error accepting invite:", err);
            setError("Failed to join the event. Please try again.");
          }
        } else {
          // Store the token for later processing
          setPendingInviteToken(token);

          // Navigate to root which will handle routing based on auth state
          router.replace("/");
        }
      } catch (err) {
        log.error("Error validating invite:", err);
        setError("Failed to validate invite. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    handleInvite();
  }, [token, isAuthenticated, user, router, setPendingInviteToken]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Processing invite...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.helpText} onPress={() => router.replace("/")}>
          Go Home
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Processing invite...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  helpText: {
    color: "#4ecdc4",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
