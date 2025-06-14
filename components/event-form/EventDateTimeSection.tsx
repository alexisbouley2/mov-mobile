// components/event-form/EventDateTimeSection.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface EventDateTimeSectionProps {
  date: Date;
  onDateChange: (_date: Date) => void;
}

export default function EventDateTimeSection({
  date,
  onDateChange,
}: EventDateTimeSectionProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getMinimumDateTime = () => {
    const now = new Date();
    return new Date(now.getTime() - 60 * 60 * 1000); // One hour ago
  };

  const handleDateConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        date.getHours(),
        date.getMinutes()
      );
      onDateChange(newDate);
    }
  };

  const handleTimeConfirm = (selectedTime: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      onDateChange(newDate);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Date & Time</Text>

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity
          style={styles.dateTimeCard}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.dateTimeHeader}>
            <IconSymbol name="calendar" size={20} color="#ff6b6b" />
            <Text style={styles.dateTimeLabel}>Date</Text>
          </View>
          <Text style={styles.dateTimeValue}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeCard}
          onPress={() => setShowTimePicker(true)}
        >
          <View style={styles.dateTimeHeader}>
            <IconSymbol name="clock" size={20} color="#ff6b6b" />
            <Text style={styles.dateTimeLabel}>Time</Text>
          </View>
          <Text style={styles.dateTimeValue}>
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={date}
        minimumDate={getMinimumDateTime()}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        date={date}
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  dateTimeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
    fontWeight: "500",
  },
  dateTimeValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
