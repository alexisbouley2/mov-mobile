import { useState, useCallback } from "react";
import { Alert } from "react-native";

export interface EventFormData {
  name: string;
  information: string;
  date: Date;
}

export function useEventForm() {
  const [formData, setFormDataState] = useState<EventFormData>({
    name: "",
    information: "",
    date: new Date(),
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

  const postProcessFormData = useCallback(
    (data: EventFormData): EventFormData => {
      return {
        ...data,
        name: data.name.trim() || "Quick MOV",
        information:
          data.information.trim() ||
          "Let's get the MOV going!\n1 - Invite everyone to the MOV\n2 - Capture the best memories of your time together",
      };
    },
    []
  );

  return {
    formData,
    updateField,
    setFormData,
    validateEventDateTime,
    postProcessFormData,
  };
}
