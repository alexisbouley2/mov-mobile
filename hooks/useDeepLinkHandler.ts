import { useEffect } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import log from "@/utils/logger";

export const useDeepLinkHandler = () => {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    const handleInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleURL(initialURL);
      }
    };

    // Handle URL changes when app is already running
    const handleURLChange = (event: { url: string }) => {
      handleURL(event.url);
    };

    const handleURL = (url: string) => {
      try {
        log.info("Handling deep link:", url);

        // Parse the URL
        const parsed = Linking.parse(url);

        // Check if it's an invite link
        // For mov://invite/token, parsed.hostname will be "invite" and parsed.path will be the token
        if (
          parsed.scheme === "mov" &&
          parsed.hostname === "invite" &&
          parsed.path
        ) {
          const token = parsed.path; // The token is directly in parsed.path

          if (token) {
            log.info("Processing invite token:", token);
            // Navigate to the invite screen which will handle the token
            router.replace(`/invite-handler?token=${token}`);
            return; // Exit early on successful parsing
          }
        }

        // If we reach here, the parsing didn't work or it's not an invite link
        router.replace("/");
      } catch (error) {
        log.error("Error handling deep link:", error);
        // On error, redirect to home
        router.replace("/");
      }
    };

    // Set up listeners
    handleInitialURL();
    const subscription = Linking.addEventListener("url", handleURLChange);

    return () => {
      subscription?.remove();
    };
  }, [router]);
};
