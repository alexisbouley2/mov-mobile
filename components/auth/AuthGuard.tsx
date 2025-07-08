// components/auth/AuthGuard.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function AuthGuard({ children, requireProfile = true }: AuthGuardProps) {
  const { session, supabaseUser, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const isInAuthFlow = segments.join("/").includes("(auth)");

  useEffect(() => {
    if (loading) return;

    if (isInAuthFlow && !session) {
      return; // Let auth screens handle their own flow
    }

    if (!session) {
      router.replace("/(auth)/welcome");
      return;
    }

    if (requireProfile && !supabaseUser) {
      router.replace("/(onboarding)/create-profile");
      return;
    }
  }, [session, supabaseUser, loading, requireProfile, router, segments]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Don't render children until we've verified access
  if (!session || (requireProfile && !supabaseUser)) {
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
