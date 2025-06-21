import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvent } from "@/hooks/useCreateEvent";
import EventFormHeader from "@/components/event-form/EventFormHeader";
import EventForm from "@/components/event-form/EventForm";

export default function CreateEventScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { formData, loading, photoUploadProgress, updateField, handleSubmit } =
    useCreateEvent(user?.id || "");

  const handleBack = () => {
    router.back();
  };

  const handleCreateSuccess = () => {
    router.push("/(app)/(tabs)/events");
  };

  const onSubmit = () => {
    handleSubmit(handleCreateSuccess);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <EventFormHeader title="Create Event" onBack={handleBack} />

      <EventForm
        formData={formData}
        loading={loading}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        submitButtonText="Create Event"
        mode="create"
        photoUploadProgress={photoUploadProgress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
