import { NotificationProvider } from "@/contexts/NotificationContext";
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
import { Platform, View } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { InviteProvider } from "@/contexts/InviteContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { useDeepLinkHandler } from "@/hooks/useDeepLinkHandler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  // Initialize deep link handler
  useDeepLinkHandler();

  useEffect(() => {
    const setupNavigationBar = async () => {
      if (Platform.OS === "android") {
        try {
          // Set navigation bar properties
          await NavigationBar.setBackgroundColorAsync("#000000");
          await NavigationBar.setButtonStyleAsync("light");
          await NavigationBar.setVisibilityAsync("visible");
        } catch (error) {
          console.warn("Failed to configure navigation bar:", error);
        }
      }
    };
    setupNavigationBar();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <AuthProvider>
        <InviteProvider>
          <UserProfileProvider>
            <NotificationProvider>
              <RecordingProvider>
                <ThemeProvider
                  value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                  <Stack
                    screenOptions={{
                      headerShown: false,
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(onboarding)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(app)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="invite-handler"
                      options={{ headerShown: false }}
                    />
                  </Stack>
                  <StatusBar style="light" />
                </ThemeProvider>
              </RecordingProvider>
            </NotificationProvider>
          </UserProfileProvider>
        </InviteProvider>
      </AuthProvider>
    </View>
  );
}

export default function RootLayout() {
  // @ts-ignore
  globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootLayoutContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
