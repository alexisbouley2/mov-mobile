// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/contexts/AuthContext";
import log from "@/utils/logger";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  log.debug("🔄 RootLayout - Render");

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    log.debug("🎨 RootLayout - Color scheme:", colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    log.debug("📝 RootLayout - Fonts loaded:", loaded);
    if (loaded) {
      SplashScreen.hideAsync();
      log.debug("📱 RootLayout - Splash screen hidden");
    }
  }, [loaded]);

  useEffect(() => {
    log.debug("🟢 RootLayout - Mounted");
    return () => log.debug("🔴 RootLayout - Unmounted");
  }, []);

  if (!loaded) {
    log.debug("⏳ RootLayout - Waiting for fonts to load");
    return null;
  }

  log.debug("✅ RootLayout - Rendering full app");

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
