// app/index.tsx
import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";

export default function Index() {
  const { session, loading } = useAuth();
  const { user, profileLoading } = useUserProfile();

  // Wait for both auth AND profile to finish loading
  if (loading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

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
