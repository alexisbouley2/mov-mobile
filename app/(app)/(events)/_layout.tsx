import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="select-events" />
    </Stack>
  );
}
