// app/(app)/(events)/create.tsx - Updated with context refresh
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useCreateEvent } from "@/hooks/events/useCreateEvent";
import { useUserEvents } from "@/contexts/UserEventsContext";
import EventForm from "@/components/event-form/EventForm";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { components, typography } from "@/styles";
import BackButton from "@/components/ui/button/BackButton";
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
      <View style={components.header}>
        <BackButton onPress={onBack} />
        <Text style={typography.headerTitle}>{"Create Event"}</Text>
      </View>

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
