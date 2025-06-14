// app/(event)/[id].tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useEventDetail } from "@/hooks/useEventDetail";
import EventHeader from "@/components/event/EventHeader";
import EventActions from "@/components/event/EventActions";
import EventLocation from "@/components/event/EventLocation";
import EventInformation from "@/components/event/EventInformation";
import EventParticipants from "@/components/event/EventParticipants";
import EventChat from "@/components/event/EventChat";
import EventGallery from "@/components/event/EventGallery";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { event, loading, error, toggleParticipation } = useEventDetail(id!);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Event not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = event.adminId === user?.id;
  const isParticipant = event.participants?.some((p) => p.userId === user?.id);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <EventHeader event={event} onBack={() => router.back()} />

          <View style={styles.content}>
            <EventActions
              isAdmin={isAdmin}
              isParticipant={isParticipant}
              onUpdate={() => router.push(`/(event)/edit/${id}`)}
              onParticipate={() => toggleParticipation(user?.id || "")}
              onInvite={() => {
                /* TODO: Implement invite */
              }}
            />

            {event.location && <EventLocation location={event.location} />}

            {event.information && (
              <EventInformation information={event.information} />
            )}

            <EventParticipants participants={event.participants || []} />

            <EventChat />

            <EventGallery
              eventId={event.id}
              userId={user?.id || ""}
              eventDate={new Date(event.date)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
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
  },
});
