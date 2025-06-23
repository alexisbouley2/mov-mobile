// Updated app/(app)/(event)/_layout.tsx
import { Stack } from "expo-router";
import { EventProvider } from "@/contexts/EventContext";
import { EventMessagesProvider } from "@/contexts/EventMessagesContext";

export default function EventLayout() {
  return (
    <EventProvider>
      <EventMessagesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="[id]" />
          <Stack.Screen name="edit" />
          <Stack.Screen name="chat" />
        </Stack>
      </EventMessagesProvider>
    </EventProvider>
  );
}
