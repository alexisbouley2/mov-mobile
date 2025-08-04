import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";
import { useDebugLifecycle } from "@/utils/debugLifecycle";
import { useUserProfile } from "@/contexts/UserProfileContext";
import AvatarPicker from "@/components/profile/AvatarPicker";
import { config } from "@/lib/config";

export default function ProfileScreen() {
  useDebugLifecycle("ProfileScreen");

  const { signOut } = useAuth();

  const { user } = useUserProfile();

  const handleEditProfile = () => {
    router.push("/(app)/(profile)/edit-profile");
  };

  const handleShareMov = async () => {
    try {
      const sharelink = `${config.EXPO_PUBLIC_WEB_URL}/share`;

      await Share.share({
        url: sharelink,
      });
    } catch (error) {
      log.error("Share error:", error);
      Alert.alert("Error", "Could not share the app");
    }
  };

  const handleTermsAndConditions = () => {
    router.push("/(app)/(profile)/terms");
  };

  const handlePrivacyPolicy = () => {
    router.push("/(app)/(profile)/privacy");
  };

  const handleDangerousZone = () => {
    log.info("in handle dangerous zone");
    router.push("/(app)/(profile)/delete-profile");
  };

  const handleLogOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.placeholder}></View>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <Image
            source={require("@/assets/images/icon/white-edit.png")}
            style={styles.editButton}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.profileSection}>
            <AvatarPicker
              imageUri={user?.profileImageUrl || null}
              onPress={handleEditProfile}
              size={120}
            />
            <Text style={styles.username}>{user?.username}</Text>
          </View>

          <View style={styles.buttonsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShareMov}
            >
              <Image
                source={require("@/assets/images/icon/gray-share.png")}
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText}>Share MOV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleTermsAndConditions}
            >
              <Image
                source={require("@/assets/images/icon/pen.png")}
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText}>Terms & Conditions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePrivacyPolicy}
            >
              <Image
                source={require("@/assets/images/icon/shield.png")}
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDangerousZone}>
            <Text style={styles.dangerousZoneText}>Dangerous Zone</Text>
          </TouchableOpacity>
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
  header: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    gap: 10,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "600",
  },
  editButton: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  topSection: {},
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "500",
    marginTop: 20,
  },

  buttonsSection: {
    gap: 20,
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
    width: 20,
    height: 25,
  },
  actionButtonText: {
    color: "#808080",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 20,
  },
  bottomSection: {
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 20,
  },
  logoutButton: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ff4444",
    fontSize: 18,
    fontWeight: "500",
  },
  dangerousZoneText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 30,
  },
});
