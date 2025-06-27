import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useProfileDelete } from "@/hooks/profile/useProfileDelete";
import BackButton from "@/components/ui/button/BackButton";
import SubmitButton from "@/components/ui/button/SubmitButton";
import { components, typography } from "@/styles";

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
      <View style={components.header}>
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
          style={[typography.profileTextInput, { marginBottom: 60 }]}
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
