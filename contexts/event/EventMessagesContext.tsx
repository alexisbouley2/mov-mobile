// contexts/EventMessagesContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { supabase } from "@/lib/supabase";
import { messagesApi } from "@/services/api";
import log from "@/utils/logger";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/event/EventContext";
import { EventMessagesResponse, Message } from "@movapp/types";
import { useFocusEffect } from "@react-navigation/native";

interface EventMessagesContextType {
  // Full messages data
  messages: Message[];
  messagesLoading: boolean;
  loadingEarlier: boolean;
  sending: boolean;
  hasMore: boolean;
  loadMessages: (_eventId: string) => Promise<void>;
  sendMessage: (_content: string) => Promise<void>;
  loadEarlier: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const EventMessagesContext = createContext<EventMessagesContextType>({
  messages: [],
  messagesLoading: false,
  loadingEarlier: false,
  sending: false,
  hasMore: true,
  loadMessages: async () => {},
  sendMessage: async () => {},
  loadEarlier: async () => {},
  error: null,
  clearError: () => {},
});

export const useEventMessages = () => useContext(EventMessagesContext);

export function EventMessagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserProfile();
  const { event, setLastMessage } = useEvent();

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Shared state
  const [error, setError] = useState<string | null>(null);

  // Track active subscription
  const activeSubscriptionRef = useRef<{
    channelName: string;
    channel: any;
  } | null>(null);

  // Load initial messages
  const loadMessages = useCallback(
    async (eventId: string) => {
      if (!user?.id) return;

      setMessagesLoading(true);
      setError(null);

      try {
        const data: EventMessagesResponse = await messagesApi.getMessages(
          eventId,
          user.id,
          1,
          10
        );

        setMessages(data.messages);
        setHasMore(data.hasMore);
        setPage(1);
      } catch (err) {
        log.error("Error loading messages:", err);
        setError("Failed to load messages");
      } finally {
        setMessagesLoading(false);
      }
    },
    [user?.id]
  );

  // Load earlier messages (pagination) - now appends to the end of the array
  const loadEarlier = useCallback(async () => {
    if (!event?.id || !user?.id || !hasMore || loadingEarlier) {
      console.log("Skipping loadEarlier - already loading or no more messages");
      return;
    }

    console.log("Starting loadEarlier");
    setLoadingEarlier(true);

    try {
      const nextPage = page + 1;
      const data: EventMessagesResponse = await messagesApi.getMessages(
        event.id,
        user.id,
        nextPage,
        10
      );

      // Append older messages to the end (since we're using inverted list)
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMessages = data.messages.filter((m) => !existingIds.has(m.id));
        console.log(`Adding ${newMessages.length} older messages to the end`);

        // For inverted list: append older messages to the end
        return [...prev, ...newMessages];
      });

      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      log.error("Error loading earlier messages:", err);
      setError("Failed to load earlier messages");
    } finally {
      setLoadingEarlier(false);
    }
  }, [event?.id, user?.id, hasMore, loadingEarlier, page]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!event?.id || !user?.id || sending || !content.trim()) {
        return;
      }

      setSending(true);
      setError(null);

      try {
        const newMessage = await messagesApi.sendMessage(event.id, user.id, {
          content: content.trim(),
          type: "text",
        });

        // Add new message to the beginning (for inverted list, newest go to index 0)
        setMessages((prev) => [newMessage, ...prev]);

        setLastMessage(newMessage);
      } catch (err) {
        log.error("Error sending message:", err);
        setError("Failed to send message");
      } finally {
        setSending(false);
      }
    },
    [event?.id, user?.id, sending, setLastMessage]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (event?.id) {
      loadMessages(event.id);
    }
  }, [event?.id, loadMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!event?.id || !user?.id) {
      return;
    }

    const channelName = `event-messages-${event.id}`;

    const setupSubscription = async () => {
      const channel = supabase.channel(channelName).on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `eventId=eq.${event.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;

          // Skip our own messages
          if (newMessage.senderId === user?.id) {
            return;
          }

          try {
            const messageWithSender = await messagesApi.getMessageById(
              newMessage.id,
              user.id
            );

            if (messageWithSender) {
              // Add real-time message to the beginning (newest first for inverted list)
              setMessages((prev) => {
                const exists = prev.some((m) => m.id === messageWithSender.id);
                return exists ? prev : [messageWithSender, ...prev];
              });

              // Update event's lastMessage
              setLastMessage(messageWithSender);
            }
          } catch (err) {
            log.error("Error fetching real-time message:", err);
          }
        }
      );

      try {
        channel.subscribe();
        activeSubscriptionRef.current = { channelName, channel };
      } catch (error) {
        log.error("Error subscribing to channel:", error);
      }
    };

    setupSubscription();

    return () => {
      if (activeSubscriptionRef.current) {
        try {
          supabase.removeChannel(activeSubscriptionRef.current.channel);
        } catch (error) {
          log.error("Error removing channel in cleanup:", error);
        }
        activeSubscriptionRef.current = null;
      }
    };
  }, [event?.id, user?.id, setLastMessage]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (activeSubscriptionRef.current) {
          try {
            supabase.removeChannel(activeSubscriptionRef.current.channel);
          } catch (error) {
            log.error(
              "Error removing channel in cleanup from useFocusEffect:",
              error
            );
          }
          activeSubscriptionRef.current = null;
        }
      };
    }, [])
  );

  const contextValue = useMemo(
    () => ({
      messages,
      messagesLoading,
      loadingEarlier,
      sending,
      hasMore,
      loadMessages,
      sendMessage,
      loadEarlier,
      error,
      clearError,
    }),
    [
      messages,
      messagesLoading,
      loadingEarlier,
      sending,
      hasMore,
      loadMessages,
      sendMessage,
      loadEarlier,
      error,
      clearError,
    ]
  );

  return (
    <EventMessagesContext.Provider value={contextValue}>
      {children}
    </EventMessagesContext.Provider>
  );
}
