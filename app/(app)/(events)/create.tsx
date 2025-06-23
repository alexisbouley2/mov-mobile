import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCreateEvent } from "@/hooks/useCreateEvent";
import EventFormHeader from "@/components/event-form/EventFormHeader";
import EventForm from "@/components/event-form/EventForm";
import { useUserProfile } from "@/contexts/UserProfileContext";

export default function CreateEventScreen() {
  const { user } = useUserProfile();
  const router = useRouter();
  const {
    formData,
    loading,
    updateField,
    handleSubmit,
    handleBack,
    pickImage,
    previewImage,
    isUploading,
  } = useCreateEvent(user?.id || "");

  const onBack = () => {
    handleBack();
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

      <EventFormHeader title="Create Event" onBack={onBack} />

      <EventForm
        formData={formData}
        loading={loading}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        submitButtonText="Create Event"
        mode="create"
        pickImage={pickImage}
        previewImage={previewImage}
        isUploading={isUploading}
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
