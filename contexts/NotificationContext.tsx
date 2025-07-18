// contexts/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { PushNotificationService } from "@/services/notifications/pushNotificationService";
import { useUserProfile } from "@/contexts/UserProfileContext";
import log from "@/utils/logger";

interface NotificationContextType {
  fcmToken: string | null;
  isInitialized: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
  clearBadge: () => Promise<void>;
  setBadge: (_count: number) => Promise<void>;
  getBadgeCount: () => Promise<number>;
}

const NotificationContext = createContext<NotificationContextType>({
  fcmToken: null,
  isInitialized: false,
  hasPermission: false,
  requestPermission: async () => false,
  refreshToken: async () => null,
  clearBadge: async () => {},
  setBadge: async (_count: number) => {},
  getBadgeCount: async () => 0,
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserProfile();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Track previous user ID to handle FCM token removal
  const previousUserIdRef = useRef<string | null>(null);

  const notificationService = useMemo(
    () => PushNotificationService.getInstance(),
    []
  );

  // Initialize notifications when user profile is loaded
  useEffect(() => {
    if (user && !isInitialized) {
      previousUserIdRef.current = user.id; // Track current user
      initializeNotifications();
    }
    // Cleanup when user is no longer available
    else if (!user && isInitialized && previousUserIdRef.current) {
      // Remove FCM token from database before clearing local state
      notificationService
        .removeFCMToken(previousUserIdRef.current)
        .catch((error) => {
          log.error("Failed to remove FCM token on user logout:", error);
        });

      // Clear local state
      setFcmToken(null);
      setIsInitialized(false);
      setHasPermission(false);
      previousUserIdRef.current = null;
    }
    // Update tracked user ID when user changes (but not on initial mount)
    else if (
      user &&
      previousUserIdRef.current &&
      user.id !== previousUserIdRef.current
    ) {
      // We should never be here
      previousUserIdRef.current = user.id;
    }
  }, [user, isInitialized, notificationService]);

  // Save FCM token when we get it and user is available
  useEffect(() => {
    if (fcmToken && user?.id && isInitialized) {
      saveFCMToken();
    }
  }, [fcmToken, user?.id, isInitialized]);

  const initializeNotifications = useCallback(async () => {
    try {
      log.info("Initializing push notifications...");
      await notificationService.initialize();

      const token = await notificationService.getFCMToken();
      if (token) {
        setFcmToken(token);
        setHasPermission(true);
        setIsInitialized(true);
        log.info("Push notifications initialized successfully");
      }
    } catch (error) {
      log.error("Failed to initialize push notifications:", error);
      setIsInitialized(true); // Mark as initialized even if failed to avoid retries
    }
  }, [notificationService]);

  const saveFCMToken = useCallback(async () => {
    if (!user?.id || !fcmToken) return;

    try {
      const success = await notificationService.saveFCMToken(user.id);
      if (success) {
        log.info("FCM token saved for user:", user.id);
      }
    } catch (error) {
      log.error("Failed to save FCM token:", error);
    }
  }, [notificationService, user?.id, fcmToken]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      await notificationService.initialize();
      const token = await notificationService.getFCMToken();

      if (token) {
        setFcmToken(token);
        setHasPermission(true);
        setIsInitialized(true);
        return true;
      }
      return false;
    } catch (error) {
      log.error("Failed to request notification permission:", error);
      return false;
    }
  }, [notificationService]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await notificationService.getFCMToken();
      setFcmToken(token);
      return token;
    } catch (error) {
      log.error("Failed to refresh FCM token:", error);
      return null;
    }
  }, [notificationService]);

  const clearBadge = useCallback(async (): Promise<void> => {
    await notificationService.clearBadge();
  }, [notificationService]);

  const setBadge = useCallback(
    async (count: number): Promise<void> => {
      await notificationService.setBadge(count);
    },
    [notificationService]
  );

  const getBadgeCount = useCallback(async (): Promise<number> => {
    return await notificationService.getBadgeCount();
  }, [notificationService]);

  const contextValue = useMemo(
    () => ({
      fcmToken,
      isInitialized,
      hasPermission,
      requestPermission,
      refreshToken,
      clearBadge,
      setBadge,
      getBadgeCount,
    }),
    [
      fcmToken,
      isInitialized,
      hasPermission,
      requestPermission,
      refreshToken,
      clearBadge,
      setBadge,
      getBadgeCount,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
