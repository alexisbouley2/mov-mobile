// services/notifications/pushNotificationService.ts
import messaging from "@react-native-firebase/messaging";
import { router } from "expo-router";
import log from "@/utils/logger";

export class PushNotificationService {
  private static instance: PushNotificationService;
  private fcmToken: string | null = null;
  private isInitialized = false;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Demander la permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        log.info("Push notification permission granted:", authStatus);
        await this.getFCMToken();
        this.setupMessageHandlers();
        this.isInitialized = true;
      } else {
        log.warn("Push notification permission denied");
      }
    } catch (error) {
      log.error("Error initializing push notifications:", error);
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        // Register device for remote messages first
        await messaging().registerDeviceForRemoteMessages();
        log.info("Device registered for remote messages");

        this.fcmToken = await messaging().getToken();
        log.info("FCM Token obtained:", this.fcmToken);
      }
      return this.fcmToken;
    } catch (error) {
      log.error("Error getting FCM token:", error);
      return null;
    }
  }

  private setupMessageHandlers() {
    // Message reçu quand l'app est en foreground
    messaging().onMessage(async (remoteMessage) => {
      log.info("Message received in foreground:", remoteMessage);

      // Ici vous pourrez afficher une notification locale si besoin
      // Par exemple avec react-native-toast-message ou une notification locale
    });

    // Message reçu quand l'app est en background/fermée et l'ouvre
    messaging().onNotificationOpenedApp((remoteMessage) => {
      log.info(
        "Notification caused app to open from background:",
        remoteMessage
      );

      // Naviguer vers l'événement
      this.handleNotificationNavigation(remoteMessage);
    });

    // Vérifier si l'app a été ouverte depuis une notification (cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          log.info(
            "Notification caused app to open from quit state:",
            remoteMessage
          );

          // Naviguer vers l'événement
          this.handleNotificationNavigation(remoteMessage);
        }
      });

    // Écouter les changements de token (rare mais possible)
    messaging().onTokenRefresh((newToken) => {
      log.info("FCM token refreshed:", newToken);
      this.fcmToken = newToken;
      // Ici on pourrait automatiquement mettre à jour le token en base
    });
  }

  private handleNotificationNavigation(remoteMessage: any) {
    // Logique de navigation basée sur le contenu de la notification
    const { data } = remoteMessage;

    if (data?.eventId) {
      log.info("Navigating to event:", data.eventId);

      // Naviguer vers l'événement
      router.push(`/(app)/(event)/${data.eventId}`);
    }
  }

  async saveFCMToken(userId: string): Promise<boolean> {
    if (!this.fcmToken) {
      log.warn("No FCM token available to save");
      return false;
    }

    try {
      const { pushNotificationsApi } = await import(
        "@/services/api/pushNotifications"
      );

      await pushNotificationsApi.createToken({
        userId,
        token: this.fcmToken,
      });

      log.info("FCM token saved successfully");
      return true;
    } catch (error) {
      log.error("Error saving FCM token:", error);
      return false;
    }
  }

  async removeFCMToken(userId: string): Promise<boolean> {
    if (!this.fcmToken) return true;

    try {
      const { pushNotificationsApi } = await import(
        "@/services/api/pushNotifications"
      );

      await pushNotificationsApi.removeToken({
        userId,
        token: this.fcmToken,
      });

      log.info("FCM token removed successfully");
      return true;
    } catch (error) {
      log.error("Error removing FCM token:", error);
      return false;
    }
  }

  getToken(): string | null {
    return this.fcmToken;
  }

  isReady(): boolean {
    return this.isInitialized && !!this.fcmToken;
  }
}
