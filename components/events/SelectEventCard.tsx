import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EventParticipants from "@/components/events/EventParticipants";
import { EventForList } from "@movapp/types";

interface SelectEventCardProps {
  event?: EventForList;
  isSelected: boolean;
  onPress: () => void;
  formatEventTime?: (_date: string) => string;
  isQuickMov?: boolean;
}

export default function SelectEventCard({
  event,
  isSelected,
  onPress,
  formatEventTime,
  isQuickMov = false,
}: SelectEventCardProps) {
  return (
    <View style={styles.eventContainer}>
      {!isQuickMov && formatEventTime && event && (
        <Text style={styles.eventInformation}>
          {formatEventTime(event.date.toISOString())} by {event.admin.username}
        </Text>
      )}
      <TouchableOpacity
        style={styles.eventItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.eventCheckbox,
            isSelected
              ? { backgroundColor: "#ffffff" }
              : { backgroundColor: "#808080" },
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={20} color="#808080" />
          )}
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>
            {isQuickMov ? "New Quick MOV" : event?.name || "Unnamed Event"}
          </Text>
        </View>

        {isQuickMov ? (
          <Image
            source={require("@/assets/images/logo/quick-mov.png")}
            style={styles.quickMovLogo}
          />
        ) : (
          event && <EventParticipants participants={event.participants} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  eventContainer: {
    marginBottom: 15,
  },
  eventInformation: {
    fontSize: 11,
    color: "#fff",
    marginLeft: 10,
    marginBottom: 4,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  eventCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    paddingLeft: 10,
  },
  quickMovLogo: {
    width: 32,
    height: 32,
  },
});
