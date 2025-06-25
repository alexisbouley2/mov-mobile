import { Stack } from "expo-router";

export default function MediaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="preview" options={{ headerShown: false }} />
    </Stack>
  );
}
