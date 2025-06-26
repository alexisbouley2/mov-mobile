import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="delete-profile" options={{ headerShown: false }} />
    </Stack>
  );
}
