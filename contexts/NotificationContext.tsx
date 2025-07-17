// contexts/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { PushNotificationService } from "@/services/notifications/pushNotificationService";
import { useAuth } from "@/contexts/AuthContext";
import log from "@/utils/logger";

interface NotificationContextType {
  fcmToken: string | null;
  isInitialized: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshToken: () => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType>({
  fcmToken: null,
  isInitialized: false,
  hasPermission: false,
  requestPermission: async () => false,
  refreshToken: async () => null,
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabaseUser, isAuthenticated } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const notificationService = useMemo(
    () => PushNotificationService.getInstance(),
    []
  );

  // Initialiser les notifications quand l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated && supabaseUser && !isInitialized) {
      initializeNotifications();
    }
  }, [isAuthenticated, supabaseUser, isInitialized]);

  // Sauvegarder le token quand on l'obtient et que l'utilisateur est connecté
  useEffect(() => {
    if (fcmToken && supabaseUser?.id && isInitialized) {
      saveFCMToken();
    }
  }, [fcmToken, supabaseUser?.id, isInitialized]);

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
    if (!supabaseUser?.id || !fcmToken) return;

    try {
      const success = await notificationService.saveFCMToken(supabaseUser.id);
      if (success) {
        log.info("FCM token saved for user:", supabaseUser.id);
      }
    } catch (error) {
      log.error("Failed to save FCM token:", error);
    }
  }, [notificationService, supabaseUser?.id, fcmToken]);

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

  // Nettoyer le token lors de la déconnexion
  useEffect(() => {
    if (!isAuthenticated && fcmToken && supabaseUser?.id) {
      // Supprimer le token de la base quand l'utilisateur se déconnecte
      notificationService.removeFCMToken(supabaseUser.id).catch((error) => {
        log.error("Failed to remove FCM token on logout:", error);
      });
      setFcmToken(null);
      setIsInitialized(false);
      setHasPermission(false);
    }
  }, [isAuthenticated, fcmToken, supabaseUser?.id, notificationService]);

  const contextValue = useMemo(
    () => ({
      fcmToken,
      isInitialized,
      hasPermission,
      requestPermission,
      refreshToken,
    }),
    [fcmToken, isInitialized, hasPermission, requestPermission, refreshToken]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
