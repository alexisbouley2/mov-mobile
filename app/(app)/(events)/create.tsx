// app/(app)/(events)/create.tsx - Updated with context refresh
import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useCreateEvent } from "@/hooks/events/useCreateEvent";
import { useUserEvents } from "@/contexts/UserEventsContext";
import EventForm from "@/components/event-form/EventForm";
import { useUserProfile } from "@/contexts/UserProfileContext";
import Header from "@/components/ui/Header";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

export default function CreateEventScreen() {
  const { user } = useUserProfile();
  const { refetch } = useUserEvents();
  const router = useRouter();

  useDebugLifecycle("CreateEventScreen");

  const {
    formData,
    loading,
    updateField,
    handleSubmit,
    handleBack,
    pickImage,
    previewImage,
  } = useCreateEvent(user?.id || "");

  const onBack = () => {
    handleBack();
    router.back();
  };

  const handleCreateSuccess = async () => {
    // Refresh events context to show the new event immediately
    await refetch();
    router.push("/(app)/(tabs)/events");
  };

  const onSubmit = () => {
    handleSubmit(handleCreateSuccess);
  };

  return (
    <View style={styles.container}>
      <Header title="Create Event" onBack={onBack} />

      <EventForm
        formData={formData}
        loading={loading}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        submitButtonText="Create Event"
        mode="create"
        pickImage={pickImage}
        previewImage={previewImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
