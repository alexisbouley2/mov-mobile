// app/(app)/(events)/select-events.tsx - Updated to use useSelectEvents hook
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelectEvents } from "@/hooks/events/useSelectEvents";
import SelectEventCard from "@/components/events/SelectEventCard";
import typography from "@/styles/typography";
import SubmitButton from "@/components/ui/button/SubmitButton";

export default function SelectEventsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const {
    selectedEventIds,
    includeCreateNew,
    isProcessing,
    currentEvents,
    isAddButtonDisabled,
    handleBack,
    toggleEventSelection,
    toggleCreateNew,
    handleAdd,
    formatEventTime,
  } = useSelectEvents({ jobId: jobId! });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={32} color="#0096ff" />
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Text style={typography.headerTitle}>Add to an Event</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Events Section */}
        <>
          {currentEvents.map((event) => (
            <SelectEventCard
              key={event.id}
              event={event}
              isSelected={selectedEventIds.has(event.id)}
              onPress={() => toggleEventSelection(event.id)}
              formatEventTime={formatEventTime}
            />
          ))}
        </>

        {/* Create New Event Option */}
        <View style={styles.createNewSection}>
          <Text style={styles.sectionTitle}>Or create a new one</Text>

          <SelectEventCard
            isSelected={includeCreateNew}
            onPress={toggleCreateNew}
            isQuickMov={true}
          />
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <SubmitButton
          onPress={handleAdd}
          disabled={isAddButtonDisabled}
          loading={isProcessing}
          submitText="Add"
          loadingText="Processing..."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 20,
    top: 20,
  },
  titleSection: {
    alignItems: "center",
    marginTop: 100,
    marginBottom: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  createNewSection: {
    marginTop: 50,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 64,
    marginBottom: 60,
  },
});
