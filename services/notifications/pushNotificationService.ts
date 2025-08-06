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
  private currentViewingEventId: string | null = null;
  private pendingNavigation: NotificationData | null = null;
  private notificationResponseSubscription: any = null;

  private constructor() {
    this.setupLocalNotifications();
    this.setupMessageHandlers();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private setupLocalNotifications() {
    // Configure how notifications should be displayed when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
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

  private isUserOnEventPage(eventId: string): boolean {
    return this.currentViewingEventId === eventId;
  }

  public setCurrentViewingEventId(eventId: string | null): void {
    this.currentViewingEventId = eventId;
  }

  public setupMessageHandlers() {
    // Message received when app is in foreground
    messaging().onMessage(async (remoteMessage) => {
      log.info("Message received in foreground:", remoteMessage);

      const { data, notification } = remoteMessage;
      const notificationData = data as unknown as NotificationData;

      // Check if user is currently viewing the event that sent the notification
      const isOnSameEventPage = this.isUserOnEventPage(
        notificationData.eventId
      );

      // Only show notification if user is NOT on the same event page
      if (!isOnSameEventPage) {
        // Show local notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification?.title || "New Message",
            body: notification?.body || "",
            data: data,
            sound: true,
          },
          trigger: null, // Show immediately
        });
      }

      // Update badge count regardless of whether we show the notification
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

    // Add listener for when user taps on a local notification
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
    }

    this.notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content
          .data as unknown as NotificationData;
        if (data?.eventId) {
          log.info(
            "Local notification tapped, navigating to event:",
            data.eventId
          );
          router.push(`/(app)/(event)/${data.eventId}?fromExternal=true`);
        }
      });

    // Message received when app is in background/closed and opens it
    messaging().onNotificationOpenedApp((remoteMessage) => {
      log.info("Notification opened app:", remoteMessage);
      this.handleNotificationNavigation(remoteMessage);
    });

    // Check if app was opened from a notification (cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          log.info("App opened from notification (cold start):", remoteMessage);
          this.handleNotificationNavigation(remoteMessage);
        }
      });

    // Listen for token refresh (rare but possible)
    messaging().onTokenRefresh((newToken) => {
      this.fcmToken = newToken;
      log.info("FCM token refreshed");
    });
  }

  private handleNotificationNavigation(remoteMessage: any) {
    const { data } = remoteMessage;
    const notificationData = data as NotificationData;

    // Store the navigation intent instead of navigating immediately
    this.pendingNavigation = notificationData;

    // Try to navigate (will work if already authenticated)
    this.executePendingNavigation();
  }

  public executePendingNavigation() {
    if (!this.pendingNavigation) return false;

    // Only navigate if we have a current user (authenticated)
    if (this.currentUserId) {
      router.replace(
        `/(app)/(event)/${this.pendingNavigation.eventId}?fromExternal=true`
      );
      this.pendingNavigation = null;
      return true;
    }
    return false;
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
   * Extract eventId from different notification types
   * Handles 4 cases:
   * 1. Android Background: eventId in identifier tag parameter
   * 2. Android Foreground: eventId in content.data.eventId
   * 3. iOS Background: eventId in trigger.payload.eventId
   * 4. iOS Foreground: eventId in content.data.eventId
   */
  private extractEventIdFromNotification(
    notification: any
  ): string | undefined {
    // Case 1: Android Background - eventId in identifier tag
    if (notification.request.identifier?.includes("tag=")) {
      const identifier = notification.request.identifier;
      const tagMatch = identifier.match(/tag=([^&]+)/);
      if (tagMatch) {
        return tagMatch[1];
      }
    }

    // Case 2: Android/iOS Foreground - eventId in content.data
    if (notification.request.content?.data?.eventId) {
      return notification.request.content.data.eventId;
    }

    // Case 3: iOS Background - eventId in trigger.payload
    if (notification.request.trigger?.payload?.eventId) {
      return notification.request.trigger.payload.eventId;
    }

    return undefined;
  }

  /**
   * Clear all notifications for a specific event (both local and backend)
   */
  async clearEventNotifications(
    userId: string,
    eventId: string
  ): Promise<number> {
    try {
      // 1. Get and dismiss local notifications for this event
      const presentedNotifications =
        await Notifications.getPresentedNotificationsAsync();
      const eventNotifications = presentedNotifications.filter(
        (notification) => {
          const notificationEventId =
            this.extractEventIdFromNotification(notification);
          return notificationEventId === eventId;
        }
      );

      // Dismiss all local notifications for this event
      for (const notification of eventNotifications) {
        await Notifications.dismissNotificationAsync(
          notification.request.identifier
        );
      }

      log.info(
        `Dismissed ${eventNotifications.length} local notifications for event ${eventId}`
      );

      // 2. Call backend API to mark notifications as read
      const response = await pushNotificationsApi.markEventNotificationsAsRead(
        userId,
        eventId
      );

      // 3. Update local badge count with the new count from server
      await Notifications.setBadgeCountAsync(response.newBadgeCount);

      log.info(
        `Marked ${response.markedCount} event notifications as read. New badge count: ${response.newBadgeCount}`
      );
      return response.markedCount;
    } catch (error) {
      log.error("Error clearing event notifications:", error);
      return 0;
    }
  }
}
