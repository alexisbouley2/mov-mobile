import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useProfileDelete } from "@/hooks/profile/useProfileDelete";
import BackButton from "@/components/ui/BackButton";
import { typography } from "@/styles";

export default function DeleteProfileScreen() {
  const {
    usernameInput,
    setUsernameInput,
    loading,
    isDeleteEnabled,
    handleDelete,
  } = useProfileDelete();

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={[typography.headerTitle, { color: "#ff4444" }]}>
          {"Dangerous Zone"}
        </Text>
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
    </View>
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 64,
    paddingTop: 120,
    alignItems: "center",
  },
  warningText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
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
    marginBottom: 70,
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
