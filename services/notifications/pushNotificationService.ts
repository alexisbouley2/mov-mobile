// services/notifications/pushNotificationService.ts
import messaging from "@react-native-firebase/messaging";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import log from "@/utils/logger";
import { pushNotificationsApi } from "@/services/api/pushNotifications";

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
        this.fcmToken = await messaging().getToken();
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
      // Naviguer vers l'événement
      this.handleNotificationNavigation(remoteMessage);
    });

    // Vérifier si l'app a été ouverte depuis une notification (cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          // Naviguer vers l'événement
          this.handleNotificationNavigation(remoteMessage);
        }
      });

    // Écouter les changements de token (rare mais possible)
    messaging().onTokenRefresh((newToken) => {
      this.fcmToken = newToken;
    });
  }

  private handleNotificationNavigation(remoteMessage: any) {
    // Logique de navigation basée sur le contenu de la notification
    const { data } = remoteMessage;

    if (data?.eventId) {
      // Naviguer vers l'événement
      router.push(`/(app)/(event)/${data.eventId}`);

      // Clear badge when user taps notification
      this.clearBadge();
    }
  }

  async saveFCMToken(userId: string): Promise<boolean> {
    if (!this.fcmToken) {
      log.warn("No FCM token available to save");
      return false;
    }

    try {
      await pushNotificationsApi.createToken({
        userId,
        token: this.fcmToken,
      });
      return true;
    } catch (error) {
      log.error("Error saving FCM token:", error);
      return false;
    }
  }

  async removeFCMToken(userId: string): Promise<boolean> {
    console.log("this.fcmToken", this.fcmToken);
    if (!this.fcmToken) return true;

    try {
      await pushNotificationsApi.removeToken({
        userId,
        token: this.fcmToken,
      });

      return true;
    } catch (error) {
      log.error("Error removing FCM token:", error);
      return false;
    }
  }

  /**
   * Clear the app icon badge
   */
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
      log.info("Badge cleared");
    } catch (error) {
      log.error("Error clearing badge:", error);
    }
  }

  /**
   * Set the app icon badge to a specific number
   */
  async setBadge(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      log.info(`Badge set to: ${count}`);
    } catch (error) {
      log.error("Error setting badge:", error);
    }
  }

  /**
   * Get current badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      log.error("Error getting badge count:", error);
      return 0;
    }
  }

  getToken(): string | null {
    return this.fcmToken;
  }

  isReady(): boolean {
    return this.isInitialized && !!this.fcmToken;
  }
}
