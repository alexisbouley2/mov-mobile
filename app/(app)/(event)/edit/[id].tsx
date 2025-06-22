import React, { useMemo } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEditEvent } from "@/hooks/event/useEditEvent";
import EventFormHeader from "@/components/event-form/EventFormHeader";
import EventForm from "@/components/event-form/EventForm";
import { EventDetail } from "@/hooks/event/useEventDetail";
import { useUserProfile } from "@/contexts/UserProfileContext";

export default function EditEventScreen() {
  const { id, eventData: eventDataParam } = useLocalSearchParams<{
    id: string;
    eventData?: string;
  }>();
  const { user } = useUserProfile();
  const router = useRouter();

  // Parse the event data if passed - memoize to prevent recreation on every render
  const eventData = useMemo(() => {
    if (!eventDataParam) return null;
    try {
      return JSON.parse(eventDataParam) as EventDetail;
    } catch (error) {
      console.error("Failed to parse event data:", error);
      return null;
    }
  }, [eventDataParam]);

  const {
    formData,
    loading,
    updateField,
    handleSubmit,
    handleBack,
    pickImage,
    previewImage,
    isUploading,
  } = useEditEvent(id!, user?.id || "", eventData);

  const onBack = () => {
    handleBack();
    router.back();
  };

  const handleEditSuccess = () => {
    router.back();
  };

  const onSubmit = () => {
    handleSubmit(handleEditSuccess);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <EventFormHeader title="Edit Event" onBack={onBack} />

      <EventForm
        formData={formData}
        loading={loading}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        submitButtonText="Update Event"
        mode="edit"
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
