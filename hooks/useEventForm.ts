// hooks/useEventForm.ts - Base hook for shared form logic
import { useState } from "react";
import { Alert } from "react-native";

export interface EventFormData {
  name: string;
  information: string;
  date: Date;
  location: string;
  photo: string | null;
}

export function useEventForm(initialData?: Partial<EventFormData>) {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    information: "",
    date: new Date(),
    location: "",
    photo: null,
    ...initialData,
  });

  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEventDateTime = (date: Date) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (date < oneHourAgo) {
      Alert.alert(
        "Invalid Date/Time",
        "Event cannot be scheduled more than one hour in the past."
      );
      return false;
    }
    return true;
  };

  return {
    formData,
    updateField,
    setFormData,
    validateEventDateTime,
  };
}
