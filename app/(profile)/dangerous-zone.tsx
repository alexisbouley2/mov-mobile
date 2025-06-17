import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { config } from "@/lib/config";

export default function DangerousZoneScreen() {
  const { user, supabaseUser, signOut } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("in dangerous zone screen");
  console.log("user", user);
  console.log("supabaseUser", supabaseUser);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    console.log("in handle delete");
    if (!user || !supabaseUser) {
      Alert.alert("Error", "No user found");
      return;
    }

    if (usernameInput.trim() !== user.username) {
      Alert.alert("Error", "Username does not match");
      return;
    }

    Alert.alert(
      "Delete Account",
      "Are you absolutely sure? This action cannot be undone and will permanently delete your account and all associated data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    console.log("in confirm delete");
    if (!supabaseUser) return;

    setLoading(true);

    try {
      const API_BASE_URL = config.EXPO_PUBLIC_API_URL;

      // Delete user from backend (will also clean up photos)
      const response = await fetch(`${API_BASE_URL}/users/${supabaseUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete account: ${response.status} - ${errorText}`
        );
      }

      // Sign out from Supabase auth
      await signOut();

      Alert.alert(
        "Account Deleted",
        "Your account has been permanently deleted.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/welcome"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setLoading(false);
    }
  };

  const isDeleteEnabled = usernameInput.trim() === user?.username && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dangerous Zone</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.warningText}>
          Deleting your account is an irreversible action. Please enter your
          username to confirm.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={usernameInput}
          onChangeText={setUsernameInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[
            styles.deleteButton,
            isDeleteEnabled
              ? styles.deleteButtonEnabled
              : styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={!isDeleteEnabled}
        >
          <Text
            style={[
              styles.deleteButtonText,
              isDeleteEnabled
                ? styles.deleteButtonTextEnabled
                : styles.deleteButtonTextDisabled,
            ]}
          >
            {loading ? "Deleting..." : "Delete"}
          </Text>
        </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  title: {
    color: "#ff4444",
    fontSize: 20,
    fontWeight: "600",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
    alignItems: "center",
  },
  warningText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  deleteButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  deleteButtonEnabled: {
    backgroundColor: "#fff",
  },
  deleteButtonDisabled: {
    backgroundColor: "#666",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonTextEnabled: {
    color: "#000",
  },
  deleteButtonTextDisabled: {
    color: "#333",
  },
});
