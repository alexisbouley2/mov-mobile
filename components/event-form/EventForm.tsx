import React from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { EventFormData } from "@/hooks/event/useEventForm";
import EventPhotoSection from "@/components/event-form/EventPhotoSection";
import EventNameSection from "@/components/event-form/EventNameSection";
import EventInformationSection from "@/components/event-form/EventInformationSection";
import EventDateTimeSection from "@/components/event-form/EventDateTimeSection";
import EventLocationSection from "@/components/event-form/EventLocationSection";
import EventInfoSection from "@/components/event-form/EventInfoSection";
import SubmitButton from "../ui/button/SubmitButton";

interface EventFormProps {
  formData: EventFormData;
  loading: boolean;
  onFieldChange: (_field: keyof EventFormData, _value: any) => void;
  onSubmit: () => void;
  submitButtonText: string;
  mode: "create" | "edit";
  pickImage: () => Promise<void>;
  previewImage: string | null;
}

export default function EventForm({
  formData,
  loading,
  onFieldChange,
  onSubmit,
  submitButtonText,
  mode,
  pickImage,
  previewImage,
}: EventFormProps) {
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <EventPhotoSection pickImage={pickImage} previewImage={previewImage} />

        <EventNameSection
          name={formData.name}
          onNameChange={(name: string) => onFieldChange("name", name)}
        />

        <EventLocationSection
          location={formData.location}
          onLocationChange={(location: string) =>
            onFieldChange("location", location)
          }
        />

        {mode === "create" && (
          <EventDateTimeSection
            date={formData.date}
            onDateChange={(date: any) => onFieldChange("date", date)}
          />
        )}

        <EventInformationSection
          information={formData.information}
          onInformationChange={(info: string) =>
            onFieldChange("information", info)
          }
        />

        <EventInfoSection mode={mode} />

        <View style={styles.submitButtonContainer}>
          <SubmitButton
            onPress={onSubmit}
            disabled={loading}
            loading={loading}
            submitText={submitButtonText}
            loadingText="Submitting..."
          />
        </View>
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
  submitButtonContainer: {
    marginTop: 32,
    paddingHorizontal: 44,
  },
});
