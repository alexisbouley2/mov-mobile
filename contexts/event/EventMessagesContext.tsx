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
import {
  MessagePreviewResponse,
  EventMessagesResponse,
  SendMessageResponse,
} from "@movapp/types";

export type MessagePreview = MessagePreviewResponse;
export type Message = SendMessageResponse;

interface EventMessagesContextType {
  // Preview data
  preview: MessagePreview | null;
  previewLoading: boolean;
  loadPreview: (_eventId: string) => Promise<void>;

  // Full messages data
  messages: Message[];
  messagesLoading: boolean;
  loadingEarlier: boolean;
  sending: boolean;
  hasMore: boolean;
  total: number;
  loadMessages: (_eventId: string) => Promise<void>;
  sendMessage: (_content: string) => Promise<void>;
  loadEarlier: () => Promise<void>;

  // Shared state
  currentEventId: string | null;
  error: string | null;
  clearError: () => void;
}

const EventMessagesContext = createContext<EventMessagesContextType>({
  preview: null,
  previewLoading: false,
  loadPreview: async () => {},
  messages: [],
  messagesLoading: false,
  loadingEarlier: false,
  sending: false,
  hasMore: true,
  total: 0,
  loadMessages: async () => {},
  sendMessage: async () => {},
  loadEarlier: async () => {},
  currentEventId: null,
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
  const { event } = useEvent();

  // Preview state
  const [preview, setPreview] = useState<MessagePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Shared state
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for realtime updates
  const loadPreviewRef = useRef<
    ((_eventId: string) => Promise<void>) | undefined
  >(undefined);
  const currentEventIdRef = useRef<string | null>(null);

  // Load message preview
  const loadPreview = useCallback(
    async (eventId: string) => {
      if (!user?.id) return;
      try {
        setPreviewLoading(true);
        setError(null);
        const data = await messagesApi.getMessagePreview(eventId, user.id);
        setPreview(data);
      } catch (err) {
        log.error("Error fetching message preview:", err);
        setError("Failed to load message preview");
      } finally {
        setPreviewLoading(false);
      }
    },
    [user?.id]
  );

  // Update refs
  loadPreviewRef.current = loadPreview;
  currentEventIdRef.current = currentEventId;

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
          1, // Always start from page 1
          30
        );

        setMessages(data.messages);
        setHasMore(data.hasMore);
        setTotal(data.total);
        setPage(1);
        setCurrentEventId(eventId);
      } catch (err) {
        log.error("Error loading messages:", err);
        setError("Failed to load messages");
      } finally {
        setMessagesLoading(false);
      }
    },
    [user?.id]
  );

  // Load earlier messages (pagination)
  const loadEarlier = useCallback(async () => {
    if (!currentEventId || !user?.id || !hasMore || loadingEarlier) {
      return;
    }

    setLoadingEarlier(true);

    try {
      const nextPage = page + 1;
      const data: EventMessagesResponse = await messagesApi.getMessages(
        currentEventId,
        user.id,
        nextPage,
        30
      );

      // Prepend older messages to the beginning
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMessages = data.messages.filter((m) => !existingIds.has(m.id));
        return [...newMessages, ...prev];
      });

      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (err) {
      log.error("Error loading earlier messages:", err);
      setError("Failed to load earlier messages");
    } finally {
      setLoadingEarlier(false);
    }
  }, [currentEventId, user?.id, hasMore, loadingEarlier, page]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentEventId || !user?.id || sending || !content.trim()) {
        return;
      }

      setSending(true);
      setError(null);

      try {
        const newMessage = await messagesApi.sendMessage(
          currentEventId,
          user.id,
          { content: content.trim(), type: "text" }
        );

        // Add message to the end of the list
        setMessages((prev) => [...prev, newMessage]);
        setTotal((prev) => prev + 1);

        // Update preview
        setPreview((prev) => ({
          hasMessages: true,
          messageCount: (prev?.messageCount || 0) + 1,
          lastMessage: {
            content: newMessage.content,
            sender: newMessage.sender,
            createdAt: newMessage.createdAt,
            type: newMessage.type,
          },
        }));
      } catch (err) {
        log.error("Error sending message:", err);
        setError("Failed to send message");
      } finally {
        setSending(false);
      }
    },
    [currentEventId, user?.id, sending]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load preview and messages when event changes
  useEffect(() => {
    if (event?.id && user?.id) {
      setCurrentEventId(event.id);
      loadPreview(event.id);
      loadMessages(event.id);
    }
  }, [event?.id, user?.id]); // Don't include loadPreview and loadMessages to avoid loops

  // Real-time subscription
  useEffect(() => {
    if (!event?.id || !user?.id) {
      return;
    }

    const channelName = `event-messages-${event.id}`;
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

          if (messageWithSender && currentEventIdRef.current === event.id) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === messageWithSender.id);
              return exists ? prev : [...prev, messageWithSender];
            });
            setTotal((prev) => prev + 1);
          }

          // Update preview
          if (loadPreviewRef.current) {
            loadPreviewRef.current(event.id);
          }
        } catch (err) {
          log.error("Error fetching real-time message:", err);
        }
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event?.id, user?.id]);

  const contextValue = useMemo(
    () => ({
      preview,
      previewLoading,
      loadPreview,
      messages,
      messagesLoading,
      loadingEarlier,
      sending,
      hasMore,
      total,
      loadMessages,
      sendMessage,
      loadEarlier,
      currentEventId,
      error,
      clearError,
    }),
    [
      preview,
      previewLoading,
      loadPreview,
      messages,
      messagesLoading,
      loadingEarlier,
      sending,
      hasMore,
      total,
      loadMessages,
      sendMessage,
      loadEarlier,
      currentEventId,
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
