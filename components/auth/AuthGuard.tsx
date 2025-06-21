// components/auth/AuthGuard.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function AuthGuard({ children, requireProfile = true }: AuthGuardProps) {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    log.debug("🛡️ AuthGuard - State check", {
      loading,
      hasSession: !!session,
      hasUser: !!user,
      requireProfile,
      segments: segments.join("/"),
    });

    if (loading) return;

    // Not authenticated at all
    if (!session) {
      log.info("🛡️ AuthGuard - No session, redirecting to welcome");
      router.replace("/(auth)/welcome");
      return;
    }

    // Authenticated but no profile (and profile is required)
    if (requireProfile && !user) {
      log.info("🛡️ AuthGuard - No profile, redirecting to create-profile");
      router.replace("/(onboarding)/create-profile");
      return;
    }

    log.debug("🛡️ AuthGuard - Access granted");
  }, [session, user, loading, requireProfile, router, segments]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Don't render children until we've verified access
  if (!session || (requireProfile && !user)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
