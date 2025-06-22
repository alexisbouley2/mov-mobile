import { useState, useCallback } from "react";
import { Alert } from "react-native";

export interface EventFormData {
  name: string;
  information: string;
  date: Date;
  location: string;
}

export function useEventForm() {
  const [formData, setFormDataState] = useState<EventFormData>({
    name: "",
    information: "",
    date: new Date(),
    location: "",
  });

  const updateField = useCallback((field: keyof EventFormData, value: any) => {
    setFormDataState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFormData = useCallback((data: EventFormData) => {
    setFormDataState(data);
  }, []);

  const validateEventDateTime = useCallback((selectedDate: Date): boolean => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (selectedDate < oneHourAgo) {
      Alert.alert(
        "Invalid Date",
        "Event must be scheduled at least 1 hour from now"
      );
      return false;
    }
    return true;
  }, []);

  return {
    formData,
    updateField,
    setFormData,
    validateEventDateTime,
  };
}
