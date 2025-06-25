// app/(app)/_layout.tsx - Updated with UserEventsProvider
import { Stack } from "expo-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { UserEventsProvider } from "@/contexts/UserEventsContext";

export default function AppLayout() {
  return (
    <AuthGuard requireProfile={true}>
      <UserEventsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(events)" options={{ headerShown: false }} />
          <Stack.Screen name="(event)" options={{ headerShown: false }} />
          <Stack.Screen name="(profile)" options={{ headerShown: false }} />
          <Stack.Screen name="(media)" options={{ headerShown: false }} />
        </Stack>
      </UserEventsProvider>
    </AuthGuard>
  );
}
