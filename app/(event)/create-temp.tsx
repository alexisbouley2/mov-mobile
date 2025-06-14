import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "@/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function CreateEventScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    information: "",
    date: new Date(),
    location: "",
    photo: null as string | null,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to set an event image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        photo: result.assets[0].uri,
      }));
    }
  };

  const validateEventDateTime = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (formData.date < oneHourAgo) {
      Alert.alert(
        "Invalid Date/Time",
        "Event cannot be scheduled more than one hour in the past."
      );
      return false;
    }
    return true;
  };

  const handleCreateEvent = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter an event name");
      return;
    }

    if (!validateEventDateTime()) {
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        name: formData.name.trim(),
        description: formData.information.trim() || undefined,
        date: formData.date.toISOString(),
        location: formData.location.trim() || undefined,
        adminId: user.id,
        // Note: photo upload would require additional backend setup for file handling
        // For now, we'll skip photo upload - you can implement this later
      };

      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      await response.json();

      Alert.alert("Success!", "Your event has been created successfully.", [
        {
          text: "OK",
          onPress: () => router.push("/(tabs)/events"),
        },
      ]);
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMinimumDateTime = () => {
    const now = new Date();
    return new Date(now.getTime() - 60 * 60 * 1000); // One hour ago
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Event</Text>

        <View style={styles.headerRight} />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Event Photo */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Event Photo</Text>
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
              {formData.photo ? (
                <Image
                  source={{ uri: formData.photo }}
                  style={styles.eventPhoto}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <IconSymbol name="camera" size={32} color="#666" />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Event Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Event Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Enter event name"
              placeholderTextColor="#666"
              maxLength={50}
            />
          </View>

          {/* Information (renamed from Description) */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Information</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.information}
              onChangeText={(text) => handleInputChange("information", text)}
              placeholder="What's this event about? (optional)"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </View>

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
                <Text style={styles.dateTimeValue}>
                  {formData.date.toLocaleDateString()}
                </Text>
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
                  {formData.date.toLocaleTimeString([], {
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
              date={formData.date}
              minimumDate={getMinimumDateTime()}
              onConfirm={(selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData((prev) => ({
                    ...prev,
                    date: new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                      prev.date.getHours(),
                      prev.date.getMinutes()
                    ),
                  }));
                }
              }}
              onCancel={() => setShowDatePicker(false)}
            />

            {/* Time Picker Modal */}
            <DateTimePickerModal
              isVisible={showTimePicker}
              mode="time"
              date={formData.date}
              onConfirm={(selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setFormData((prev) => ({
                    ...prev,
                    date: new Date(
                      prev.date.getFullYear(),
                      prev.date.getMonth(),
                      prev.date.getDate(),
                      selectedTime.getHours(),
                      selectedTime.getMinutes()
                    ),
                  }));
                }
              }}
              onCancel={() => setShowTimePicker(false)}
            />
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(text) => handleInputChange("location", text)}
              placeholder="Where is this happening? (optional)"
              placeholderTextColor="#666"
              maxLength={100}
            />
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <IconSymbol name="info.circle" size={16} color="#666" />
              <Text style={styles.infoText}>
                You&apos;ll be the admin of this event. You can invite friends
                after creating it.
              </Text>
            </View>
          </View>

          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.createButtonBottom,
                loading && styles.createButtonDisabled,
              ]}
              onPress={handleCreateEvent}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Event</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerRight: {
    width: 40, // Same width as back button for balance
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 120, // Add space for the fixed bottom button
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  eventPhoto: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
  infoSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
    lineHeight: 20,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#333",
    // Add shadow for better separation
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonBottom: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  createButtonDisabled: {
    backgroundColor: "#666",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
