// Updated app/(app)/(event)/_layout.tsx
import { Stack } from "expo-router";
import { EventProvider } from "@/contexts/event/EventContext";
import { EventMessagesProvider } from "@/contexts/event/EventMessagesContext";
import { EventParticipantsProvider } from "@/contexts/event/EventParticipantsContext";
import { EventVideosProvider } from "@/contexts/event/EventVideosContext";
import { EventContactsProvider } from "@/contexts/event/EventContactsContext";

export default function EventLayout() {
  return (
    <EventProvider>
      <EventMessagesProvider>
        <EventParticipantsProvider>
          <EventVideosProvider>
            <EventContactsProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="[id]" />
                <Stack.Screen name="edit" />
                <Stack.Screen name="chat" />
                <Stack.Screen name="invite" />
                <Stack.Screen name="participants" />
              </Stack>
            </EventContactsProvider>
          </EventVideosProvider>
        </EventParticipantsProvider>
      </EventMessagesProvider>
    </EventProvider>
  );
}
