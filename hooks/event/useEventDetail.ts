import { useCallback, useLayoutEffect, useState, useRef } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { FlatList } from "react-native";
import { useEvent } from "@/contexts/EventContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";

export const useEventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUserProfile();
  const { markEventNotificationsAsRead } = useNotifications();
  const { event, eventLoading, error, loadEvent, toggleParticipation } =
    useEvent();

  // Add ref to preserve scroll position
  const flatListRef = useRef<FlatList>(null);

  // Track navigation state with refs to avoid re-renders
  const hasInitialized = useRef(false);
  const lastFocusTime = useRef(0);
  const savedScrollOffset = useRef(0);

  // Add state to track scroll position for UI updates
  const [_scrollOffset, setScrollOffset] = useState(0);
  const [screenKey] = useState(Date.now());
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Load event every time we come to this screen
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTime.current;
      const isReturning = hasInitialized.current && timeSinceLastFocus > 500; // 500ms threshold

      lastFocusTime.current = now;

      if (id) {
        // Only allow refresh for initial load or manual refresh
        setShouldRefresh(!isReturning);

        loadEvent(id);

        // Clear notifications for this event when user visits
        if (user?.id) {
          markEventNotificationsAsRead(id).catch((error) => {
            console.warn("Failed to mark event notifications as read:", error);
          });
        }

        // Mark as initialized after first load
        hasInitialized.current = true;

        // Restore scroll position when returning
        if (isReturning && savedScrollOffset.current > 0) {
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({
                offset: savedScrollOffset.current,
                animated: false,
              });
            }
          }, 100);
        }
      }
    }, [id, loadEvent, user?.id, markEventNotificationsAsRead])
  );

  // Clear shouldRefresh flag when loading completes
  useLayoutEffect(() => {
    if (!eventLoading && shouldRefresh) {
      setShouldRefresh(false);
    }
  }, [eventLoading, shouldRefresh]);

  // Handler for navigating to edit screen
  const handleEdit = useCallback(() => {
    if (event) {
      router.push(`/(app)/(event)/edit`);
    }
  }, [event, router]);

  // Handle scroll events
  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    // Only save positive offsets (not refresh state)
    if (offset >= 0) {
      savedScrollOffset.current = offset;
      setScrollOffset(offset);
    }
  };

  // Handle momentum scroll end
  const handleMomentumScrollEnd = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    if (offset >= 0) {
      savedScrollOffset.current = offset;
      setScrollOffset(offset);
    }
  };

  const handleRefresh = () => {
    setShouldRefresh(true);
    if (id) {
      loadEvent(id);
    }
  };

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
      ...(event.location ? [{ type: "location", data: event.location }] : []),
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
    // Data
    event,
    eventLoading,
    error,
    user,
    renderData: getRenderData(),

    // Refs
    flatListRef,
    screenKey,

    // State
    shouldRefresh,

    // Handlers
    handleEdit,
    handleScroll,
    handleMomentumScrollEnd,
    handleRefresh,
    handleConfirm,
    handleInvite,
  };
};
