import React from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { EventFormData } from "@/hooks/event/useEventForm";
import EventPhotoSection from "@/components/event-form/EventPhotoSection";
import EventNameSection from "@/components/event-form/EventNameSection";
import EventInformationSection from "@/components/event-form/EventInformationSection";
import EventDateTimeSection from "@/components/event-form/EventDateTimeSection";
import EventLocationSection from "@/components/event-form/EventLocationSection";
import EventInfoSection from "@/components/event-form/EventInfoSection";
import EventSubmitButton from "@/components/event-form/EventSubmitButton";

interface EventFormProps {
  formData: EventFormData;
  loading: boolean;
  onFieldChange: (_field: keyof EventFormData, _value: any) => void;
  onSubmit: () => void;
  submitButtonText: string;
  mode: "create" | "edit";
}

export default function EventForm({
  formData,
  loading,
  onFieldChange,
  onSubmit,
  submitButtonText,
  mode,
}: EventFormProps) {
  const handlePhotoJobChange = (jobId: string | null) => {
    onFieldChange("photoJobId", jobId);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EventPhotoSection
          photo={formData.photo}
          onPhotoChange={(photo: any) => onFieldChange("photo", photo)}
          onPhotoJobChange={handlePhotoJobChange}
        />

        <EventNameSection
          name={formData.name}
          onNameChange={(name: string) => onFieldChange("name", name)}
        />

        <EventInformationSection
          information={formData.information}
          onInformationChange={(info: string) =>
            onFieldChange("information", info)
          }
        />

        {mode === "create" && (
          <EventDateTimeSection
            date={formData.date}
            onDateChange={(date: any) => onFieldChange("date", date)}
          />
        )}

        <EventLocationSection
          location={formData.location}
          onLocationChange={(location: string) =>
            onFieldChange("location", location)
          }
        />

        <EventInfoSection mode={mode} />

        <EventSubmitButton
          onSubmit={onSubmit}
          loading={loading}
          text={submitButtonText}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
