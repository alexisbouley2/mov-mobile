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
import messaging from "@react-native-firebase/messaging";

interface NotificationContextType {
  fcmToken: string | null;
  permissionStatus: number | null;
  permissionChecked: boolean;
  checkPermissionStatus: () => Promise<number>;
  requestPermission: () => Promise<boolean>;
  syncBadgeCount: () => Promise<number>;
  clearEventNotifications: (_eventId: string) => Promise<number>;
}

const NotificationContext = createContext<NotificationContextType>({
  fcmToken: null,
  permissionStatus: null,
  permissionChecked: false,
  checkPermissionStatus: async () => 0,
  requestPermission: async () => false,
  syncBadgeCount: async () => 0,
  clearEventNotifications: async (_eventId: string) => 0,
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserProfile();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<number | null>(null);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Track previous user ID to handle FCM token removal
  const previousUserIdRef = useRef<string | null>(null);

  const notificationService = useMemo(
    () => PushNotificationService.getInstance(),
    []
  );

  // Check notification permission status when user profile is loaded
  useEffect(() => {
    if (user && !permissionChecked) {
      const checkPermission = async () => {
        try {
          const status = await notificationService.checkPermissionStatus();
          setPermissionStatus(status);

          // If already authorized, get token and save it
          if (status === messaging.AuthorizationStatus.AUTHORIZED) {
            const token = await notificationService.getFCMToken();
            if (token) {
              setFcmToken(token);
              await notificationService.saveFCMToken(user.id);
            }
          }
        } catch (error) {
          log.error("Error checking notification permission:", error);
          setPermissionStatus(messaging.AuthorizationStatus.DENIED);
        } finally {
          setPermissionChecked(true);
        }
      };

      checkPermission();
    }
    // Clear permission status when user logs out
    else if (!user && permissionChecked) {
      setPermissionStatus(null);
      setPermissionChecked(false);
    }
  }, [user, permissionChecked, notificationService]);

  // Remove FCM token when user logs out
  useEffect(() => {
    if (previousUserIdRef.current && !user) {
      notificationService.removeFCMToken(previousUserIdRef.current);
      previousUserIdRef.current = null;
      setFcmToken(null);
    }
    if (user) {
      previousUserIdRef.current = user.id;
    }
  }, [user, notificationService]);

  // Sync badge count when user is available and notifications are initialized
  useEffect(() => {
    if (user?.id && fcmToken) {
      syncBadgeCount();
    }
  }, [user?.id, fcmToken]);

  const checkPermissionStatus = useCallback(async (): Promise<number> => {
    try {
      return await notificationService.checkPermissionStatus();
    } catch (error) {
      log.error("Failed to check notification permission status:", error);
      return 0; // DENIED
    }
  }, [notificationService]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const success = await notificationService.requestPermission();
      if (success) {
        const token = await notificationService.getFCMToken();
        if (token) {
          setFcmToken(token);
          if (user?.id) {
            await notificationService.saveFCMToken(user.id);
          }
        }
      }
      return success;
    } catch (error) {
      log.error("Failed to request notification permission:", error);
      return false;
    }
  }, [notificationService, user?.id]);

  const syncBadgeCount = useCallback(async (): Promise<number> => {
    if (!user?.id) return 0;

    try {
      const count = await notificationService.syncBadgeCount(user.id);
      return count;
    } catch (error) {
      log.error("Failed to sync badge count:", error);
      return 0;
    }
  }, [notificationService, user?.id]);

  const clearEventNotifications = useCallback(
    async (eventId: string): Promise<number> => {
      if (!user?.id) return 0;

      try {
        const markedCount = await notificationService.clearEventNotifications(
          user.id,
          eventId
        );
        return markedCount;
      } catch (error) {
        log.error("Failed to clear event notifications:", error);
        return 0;
      }
    },
    [notificationService, user?.id]
  );

  const contextValue = useMemo(
    () => ({
      fcmToken,
      permissionStatus,
      permissionChecked,
      checkPermissionStatus,
      requestPermission,
      syncBadgeCount,
      clearEventNotifications,
    }),
    [
      fcmToken,
      permissionStatus,
      permissionChecked,
      checkPermissionStatus,
      requestPermission,
      syncBadgeCount,
      clearEventNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
