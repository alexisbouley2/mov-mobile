import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useEvents, Event as EventType } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext"; // Adjust this path to match your auth context file
import { useRouter } from "expo-router";

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, loading, error, refetch } = useEvents(user?.id || "");

  // Group past events by month
  const groupEventsByMonth = (events: EventType[]) => {
    const grouped = events.reduce((acc, event) => {
      const eventDate = new Date(event.date);

      const monthYear = eventDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(event);

      return acc;
    }, {} as Record<string, EventType[]>);

    return grouped;
  };

  const pastEventsByMonth = groupEventsByMonth(events.past);

  const handleCreateEvent = () => {
    router.push("/(event)/create");
  };

  const handleEventPress = (eventId: string) => {
    router.push(`/(event)/${eventId}`);
  };

  const renderEventCard = (
    event: EventType,
    type: "current" | "planned" | "past"
  ) => {
    let subtitle = "";

    if (type === "current") {
      subtitle = `Created by ${event.admin.username}`;
    } else if (type === "planned") {
      const eventDate = new Date(event.date);
      subtitle = eventDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else if (type === "past") {
      const povCount = event.povCount || event._count?.videos || 0;
      subtitle = `You shared ${povCount} POVs`;
    }

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => handleEventPress(event.id)}
      >
        <View style={styles.eventContent}>
          <View style={styles.eventIcon}>
            {event.photo ? (
              <Image source={{ uri: event.photo }} style={styles.eventImage} />
            ) : (
              <View style={styles.placeholderIcon}>
                <Text style={styles.placeholderText}>
                  {event.name.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventSubtitle}>{subtitle}</Text>
          </View>

          {type === "past" && (
            <View style={styles.povBadge}>
              <Text style={styles.povText}>POV</Text>
            </View>
          )}

          {event.participants && event.participants.length > 0 && (
            <View style={styles.participantsContainer}>
              {event.participants.slice(0, 3).map((participant, index) => (
                <View
                  key={participant.user.id}
                  style={[
                    styles.participantAvatar,
                    { marginLeft: index > 0 ? -8 : 0 },
                  ]}
                >
                  {participant.user.photo ? (
                    <Image
                      source={{ uri: participant.user.photo }}
                      style={styles.participantImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {participant.user.username.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              ))}
              {event.participants.length > 3 && (
                <View
                  style={[styles.participantAvatar, styles.moreParticipants]}
                >
                  <Text style={styles.avatarText}>
                    +{event.participants.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.povTitle}>POV</Text>
          <Text style={styles.subtitle}>Your best memories.</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleCreateEvent}>
          <IconSymbol name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Events */}
          {events.current.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Events</Text>
              {events.current.map((event) => renderEventCard(event, "current"))}
            </View>
          )}

          {/* Planned Events */}
          {events.planned.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Planned Events</Text>
              {events.planned.map((event) => renderEventCard(event, "planned"))}
            </View>
          )}

          {/* Past Events (Memories) */}
          {Object.keys(pastEventsByMonth).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Memories</Text>
              {Object.entries(pastEventsByMonth).map(
                ([monthYear, monthEvents]) => (
                  <View key={monthYear}>
                    <Text style={styles.monthTitle}>{monthYear}</Text>
                    {monthEvents.map((event) => renderEventCard(event, "past"))}
                  </View>
                )
              )}
            </View>
          )}
        </ScrollView>
      )}
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
    paddingBottom: 10,
  },
  headerContent: {
    flex: 1,
  },
  povTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 20,
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  eventContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  eventIcon: {
    marginRight: 16,
  },
  eventImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  povBadge: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  povText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1a1a1a",
    overflow: "hidden",
  },
  participantImage: {
    width: "100%",
    height: "100%",
  },
  moreParticipants: {
    backgroundColor: "#333",
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
