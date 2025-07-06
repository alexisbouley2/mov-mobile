import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useEditEvent } from "@/hooks/event/useEditEvent";
import EventForm from "@/components/event-form/EventForm";
import { components, typography } from "@/styles";
import BackButton from "@/components/ui/button/BackButton";
import ThreeDotsButton from "@/components/ui/ThreeDotsButton";

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
    deleteEvent,
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
    <View style={styles.container}>
      <View style={components.header}>
        <BackButton onPress={onBack} />
        <Text style={typography.headerTitle}>{"Manage Event"}</Text>
        <ThreeDotsButton onPress={deleteEvent} />
      </View>

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
