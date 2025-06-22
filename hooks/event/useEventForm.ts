import { useState } from "react";
import { Alert } from "react-native";

export interface EventFormData {
  name: string;
  information: string;
  date: Date;
  location: string;
  photo: string | null;
  photoJobId: string | null; // Add photo job ID
}

export function useEventForm() {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    information: "",
    date: new Date(),
    location: "",
    photo: null,
    photoJobId: null,
  });

  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEventDateTime = (selectedDate: Date): boolean => {
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
  };

  return {
    formData,
    updateField,
    setFormData,
    validateEventDateTime,
  };
}
