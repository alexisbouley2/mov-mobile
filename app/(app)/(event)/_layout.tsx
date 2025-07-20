// Updated app/(app)/(event)/_layout.tsx
import { Stack } from "expo-router";
import { EventProvider } from "@/contexts/EventContext";
import { EventMessagesProvider } from "@/contexts/EventMessagesContext";
import { EventParticipantsProvider } from "@/contexts/EventParticipantsContext";
import { EventVideosProvider } from "@/contexts/EventVideosContext";

export default function EventLayout() {
  return (
    <EventProvider>
      <EventMessagesProvider>
        <EventParticipantsProvider>
          <EventVideosProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="[id]" />
              <Stack.Screen name="edit" />
              <Stack.Screen name="chat" />
              <Stack.Screen name="invite" />
              <Stack.Screen name="participants" />
            </Stack>
          </EventVideosProvider>
        </EventParticipantsProvider>
      </EventMessagesProvider>
    </EventProvider>
  );
}
