import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

export default function ProfileScreen() {
  useDebugLifecycle("ProfileScreen");

  const { user, signOut, refreshUserProfile } = useAuth();

  // Refresh profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  const handleEditProfile = () => {
    router.push("/(profile)/edit-profile");
  };

  const handleSharePov = () => {
    // TODO: Implement share POV functionality
    log.info("Share POV pressed");
  };

  const handleTermsAndConditions = () => {
    // TODO: Implement terms and conditions
    log.info("Terms & Conditions pressed");
  };

  const handlePrivacyPolicy = () => {
    // TODO: Implement privacy policy
    log.info("Privacy Policy pressed");
  };

  const handleDangerousZone = () => {
    log.info("in handle dangerous zone");
    router.push("/(profile)/dangerous-zone");
  };

  const handleLogOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.photoUrl ? (
              <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{user?.username || "Unknown"}</Text>
        </View>

        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSharePov}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Share POV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTermsAndConditions}
          >
            <Text style={styles.actionButtonIcon}>📝</Text>
            <Text style={styles.actionButtonText}>Terms & Conditions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.actionButtonIcon}>🔒</Text>
            <Text style={styles.actionButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDangerousZone}>
            <Text style={styles.dangerousZoneText}>Dangerous Zone</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 4.6</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    position: "relative",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  editButton: {
    position: "absolute",
    right: 20,
    padding: 8,
  },
  editButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a1a1a",
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#666",
    fontSize: 48,
    fontWeight: "300",
  },
  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "500",
  },
  buttonsSection: {
    gap: 15,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 15,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 120, // Increased to avoid tab bar
    gap: 20,
  },
  logoutButton: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerousZoneText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "400",
  },
  versionText: {
    color: "#666",
    fontSize: 12,
  },
});
