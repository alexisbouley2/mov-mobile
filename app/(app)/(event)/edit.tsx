import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useEditEvent } from "@/hooks/event/useEditEvent";
import EventForm from "@/components/event-form/EventForm";
import Header from "@/components/ui/Header";
import ThreeDotsButton from "@/components/ui/button/ThreeDotsButton";
import { useUserEvents } from "@/contexts/UserEventsContext";
import { useDebugLifecycle } from "@/utils/debugLifecycle";

export default function EditEventScreen() {
  const router = useRouter();

  useDebugLifecycle("EditEventScreen");

  const { refreshEvents } = useUserEvents();
  const {
    formData,
    loading,
    updateField,
    handleSubmit,
    handleBack,
    pickImage,
    previewImage,
    deleteEvent,
  } = useEditEvent();

  const onBack = () => {
    handleBack();
    router.back();
  };

  const handleEditSuccess = async () => {
    await refreshEvents();
    router.back();
  };

  const onSubmit = () => {
    handleSubmit(handleEditSuccess);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Manage Event"
        onBack={onBack}
        rightComponent={<ThreeDotsButton onPress={deleteEvent} />}
      />

      <EventForm
        formData={formData}
        loading={loading}
        onFieldChange={updateField}
        onSubmit={onSubmit}
        submitButtonText="Update Event"
        mode="edit"
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
