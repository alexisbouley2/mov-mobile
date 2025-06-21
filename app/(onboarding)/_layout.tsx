// app/(onboarding)/_layout.tsx
import { Stack } from "expo-router";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function OnboardingLayout() {
  return (
    <AuthGuard requireProfile={false}>
      <Stack>
        <Stack.Screen name="create-profile" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
