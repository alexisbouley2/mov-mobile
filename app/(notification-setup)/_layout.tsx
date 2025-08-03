// app/(notification-setup)/_layout.tsx
import { Stack } from "expo-router";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function NotificationSetupLayout() {
  return (
    <AuthGuard requireProfile={true}>
      <Stack>
        <Stack.Screen name="permission" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
