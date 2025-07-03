import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { usersApi } from "@/services/api";

export const useProfileDelete = () => {
  const { supabaseUser, signOut } = useAuth();
  const { user } = useUserProfile();
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isDeleteEnabled = usernameInput.trim() === user?.username && !loading;

  const handleDelete = async () => {
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
    if (!supabaseUser) return;

    setLoading(true);

    try {
      await usersApi.deleteUser(supabaseUser.id);
      await signOut();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    usernameInput,
    setUsernameInput,
    loading,
    isDeleteEnabled,
    handleDelete,
  };
};
