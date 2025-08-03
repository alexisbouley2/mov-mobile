// components/phone/PhoneInput.tsx
import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { countries } from "@/data/countries";
import { Country } from "@/types/country";
import CountryPicker from "./CountryPicker";
import {
  validatePhoneNumber,
  formatPhoneNumberForDisplay,
  PhoneValidationResult,
} from "@/utils/phoneValidation";

interface PhoneInputProps {
  value: string;
  onChangeText: (_text: string) => void;
  onValidationChange: (_validation: PhoneValidationResult) => void;
  onCountryChange?: (_country: Country) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function PhoneInput({
  value,
  onChangeText,
  onValidationChange,
  onCountryChange,
  placeholder = "Phone Number",
  autoFocus = false,
}: PhoneInputProps) {
  // Default to France
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === "FR") || countries[0]
  );
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Format the display value
    const formatted = formatPhoneNumberForDisplay(value, selectedCountry);
    setDisplayValue(formatted);

    // Validate the phone number
    const validation = validatePhoneNumber(value, selectedCountry);
    onValidationChange(validation);
  }, [value, selectedCountry, onValidationChange]);

  const handleTextChange = (text: string) => {
    // Remove all non-digit characters for storage
    const cleanedText = text.replace(/\D/g, "");
    onChangeText(cleanedText);
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    // Clear the input when country changes
    onChangeText("");
    // Notify parent component about country change
    onCountryChange?.(country);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <CountryPicker
          selectedCountry={selectedCountry}
          onSelectCountry={handleCountryChange}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={displayValue}
          onChangeText={handleTextChange}
          keyboardType="phone-pad"
          autoFocus={autoFocus}
          maxLength={selectedCountry.maxLength + 5}
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 16,
  },
});
