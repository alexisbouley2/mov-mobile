// app/index.tsx
import { Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";
import messaging from "@react-native-firebase/messaging";
import { PushNotificationService } from "@/services/notifications/pushNotificationService";
import { useEffect } from "react";

export default function Index() {
  const { session, loading } = useAuth();
  const { user, profileLoading } = useUserProfile();
  const { permissionStatus, permissionChecked } = useNotifications();

  useEffect(() => {
    if (user && permissionChecked) {
      PushNotificationService.getInstance().executePendingNavigation();
    }
  }, [user, permissionChecked]);

  if (loading || profileLoading || (user && !permissionChecked)) {
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

  // Check if notification permission is needed
  if (permissionStatus !== messaging.AuthorizationStatus.AUTHORIZED) {
    return <Redirect href="/(notification-setup)/permission" />;
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
