import { useCallback, useState } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useEvent } from "@/contexts/event/EventContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";

export const useEventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUserProfile();
  const { markEventNotificationsAsRead } = useNotifications();
  const { event, eventLoading, error, loadEvent, toggleParticipation } =
    useEvent();

  const [screenKey] = useState(Date.now());

  // Load event every time we come to this screen
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadEvent(id);

        // Clear notifications for this event when user visits
        if (user?.id) {
          markEventNotificationsAsRead(id).catch((error) => {
            console.warn("Failed to mark event notifications as read:", error);
          });
        }
      }
    }, [id, loadEvent, user?.id, markEventNotificationsAsRead])
  );

  // Handler for navigating to edit screen
  const handleEdit = useCallback(() => {
    if (event) {
      router.push(`/(app)/(event)/edit`);
    }
  }, [event, router]);

  const handleConfirm = () => {
    toggleParticipation(user?.id || "");
  };

  const handleInvite = useCallback(() => {
    if (!event) return;
    router.push(`/(app)/(event)/invite?id=${event.id}`);
  }, [event, router]);

  // Prepare data for rendering
  const getRenderData = () => {
    if (!event || !user) return [];

    const isAdmin = event.adminId === user.id;
    const currentParticipant = event.participants?.find(
      (p) => p.user.id === user.id
    );
    const isConfirmed = currentParticipant?.confirmed || false;

    return [
      { type: "header", data: event },
      {
        type: "actions",
        data: { isAdmin, isConfirmed, event: event },
      },
      ...(event.information
        ? [{ type: "information", data: event.information }]
        : []),
      { type: "participants", data: {} },
      { type: "chat", data: { eventId: event.id } },
      {
        type: "gallery",
        data: {
          eventId: event.id,
          userId: user.id,
          eventDate: new Date(event.date),
        },
      },
    ];
  };

  return {
    event,
    eventLoading,
    error,
    user,
    renderData: getRenderData(),
    screenKey,
    handleEdit,
    handleConfirm,
    handleInvite,
  };
};
