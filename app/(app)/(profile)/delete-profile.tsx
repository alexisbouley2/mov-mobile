import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useProfileDelete } from "@/hooks/profile/useProfileDelete";
import Header from "@/components/ui/Header";
import SubmitButton from "@/components/ui/button/SubmitButton";

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
      <Header
        title="Dangerous Zone"
        onBack={handleBack}
        titleStyle={{ color: "#ff4444" }}
      />

      <View style={styles.content}>
        <Text style={styles.warningText}>
          Deleting your account is an irreversible action. Please enter your
          username to confirm.
        </Text>

        <TextInput
          style={[styles.profileTextInput, { marginBottom: 60 }]}
          placeholder="Username"
          placeholderTextColor="#666"
          value={usernameInput}
          onChangeText={setUsernameInput}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <SubmitButton
          onPress={handleDelete}
          disabled={!isDeleteEnabled}
          loading={loading}
          submitText="Delete"
          loadingText="Deleting..."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  profileTextInput: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
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
});
