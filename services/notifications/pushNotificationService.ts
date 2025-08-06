// services/notifications/pushNotificationService.ts
import messaging from "@react-native-firebase/messaging";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import log from "@/utils/logger";
import { pushNotificationsApi } from "@/services/api/pushNotifications";

interface NotificationData {
  type: string;
  eventId: string;
  senderId?: string;
  messageContent?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private fcmToken: string | null = null;
  private currentUserId: string | null = null;
  private constructor() {
    this.setupMessageHandlers();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async checkPermissionStatus() {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus;
    } catch (error) {
      log.error("Error checking notification permission:", error);
      return messaging.AuthorizationStatus.DENIED;
    }
  }

  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await this.getFCMToken();
        this.setupMessageHandlers();
        return true;
      } else {
        log.warn("Push notification permission denied");
        return false;
      }
    } catch (error) {
      log.error("Error requesting push notification permission:", error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        // Register device for remote messages first
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
        }
        this.fcmToken = await messaging().getToken();
      }
      return this.fcmToken;
    } catch (error) {
      log.error("Error getting FCM token:", error);
      return null;
    }
  }

  async saveFCMToken(userId: string): Promise<boolean> {
    if (!this.fcmToken) {
      log.warn("No FCM token available to save");
      return false;
    }

    try {
      this.currentUserId = userId;
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
    if (!this.fcmToken) return true;

    try {
      await pushNotificationsApi.removeToken({
        userId,
        token: this.fcmToken,
      });

      if (this.currentUserId === userId) {
        this.currentUserId = null;
      }

      return true;
    } catch (error) {
      log.error("Error removing FCM token:", error);
      return false;
    }
  }

  public setupMessageHandlers() {
    // Message reçu quand l'app est en foreground
    messaging().onMessage(async (remoteMessage) => {
      log.info("Message received in foreground:", remoteMessage);

      // Fetch badge count from backend instead of incrementing locally
      if (this.currentUserId) {
        try {
          const response = await pushNotificationsApi.getBadgeCount(
            this.currentUserId
          );
          await Notifications.setBadgeCountAsync(response.count);
        } catch (error) {
          log.error("Error fetching badge count in onMessage:", error);
        }
      }
    });

    // Message reçu quand l'app est en background/fermée et l'ouvre
    messaging().onNotificationOpenedApp((remoteMessage) => {
      log.info("Notification opened app:", remoteMessage);
      this.handleNotificationNavigation(remoteMessage);
    });

    // Vérifier si l'app a été ouverte depuis une notification (cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          log.info("App opened from notification (cold start):", remoteMessage);
          this.handleNotificationNavigation(remoteMessage);
        }
      });

    // Écouter les changements de token (rare mais possible)
    messaging().onTokenRefresh((newToken) => {
      this.fcmToken = newToken;
      log.info("FCM token refreshed");
    });
  }

  private handleNotificationNavigation(remoteMessage: any) {
    const { data } = remoteMessage;
    const notificationData = data as NotificationData;
    router.replace(
      `/(app)/(event)/${notificationData.eventId}?fromExternal=true`
    );
  }

  /**
   * Get current badge count from server and sync local count
   */
  async syncBadgeCount(userId: string): Promise<number> {
    try {
      const response = await pushNotificationsApi.getBadgeCount(userId);
      await Notifications.setBadgeCountAsync(response.count);
      return response.count;
    } catch (error) {
      log.error("Error syncing badge count:", error);
      return 0;
    }
  }

  /**
   * Mark all notifications for a specific event as read
   */
  async markEventNotificationsAsRead(
    userId: string,
    eventId: string
  ): Promise<number> {
    try {
      const response = await pushNotificationsApi.markEventNotificationsAsRead(
        userId,
        eventId
      );

      // Update local badge count with the new count from server
      await Notifications.setBadgeCountAsync(response.newBadgeCount);

      log.info(
        `Marked ${response.markedCount} event notifications as read. New badge count: ${response.newBadgeCount}`
      );
      return response.markedCount;
    } catch (error) {
      log.error("Error marking event notifications as read:", error);
      return 0;
    }
  }
}
