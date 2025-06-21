// app/index.tsx
import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";

export default function Index() {
  const { session, user, loading } = useAuth();

  log.debug("🏠 Index - Routing decision", {
    loading,
    hasSession: !!session,
    hasUser: !!user,
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Route to appropriate screen based on auth state
  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!user) {
    return <Redirect href="/(onboarding)/create-profile" />;
  }

  return <Redirect href="/(app)/(tabs)/camera" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
