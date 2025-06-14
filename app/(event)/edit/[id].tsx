// app/(event)/edit/[id].tsx - New edit screen
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useEditEvent } from "@/hooks/useEditEvent";
import EventFormHeader from "@/components/event-form/EventFormHeader";
import EventForm from "@/components/event-form/EventForm";

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const {
    formData,
    loading,
    initialLoading,
    error,
    updateField,
    handleSubmit,
  } = useEditEvent(id!, user?.id || "");

  const handleBack = () => {
    router.back();
  };

  const handleEditSuccess = () => {
    router.back();
  };

  const onSubmit = () => {
    handleSubmit(handleEditSuccess);
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <EventFormHeader title="Edit Event" onBack={handleBack} />

      <EventForm
        formData={formData}
        loading={loading}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        submitButtonText="Update Event"
        mode="edit"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
});
