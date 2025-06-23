import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEditEvent } from "@/hooks/event/useEditEvent";
import EventFormHeader from "@/components/event-form/EventFormHeader";
import EventForm from "@/components/event-form/EventForm";

export default function EditEventScreen() {
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
  } = useEditEvent();

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
});
