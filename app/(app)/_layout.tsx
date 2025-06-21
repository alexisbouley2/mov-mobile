// app/(app)/_layout.tsx
import { Stack } from "expo-router";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppLayout() {
  return (
    <AuthGuard requireProfile={true}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(event)" options={{ headerShown: false }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
