// contexts/EventMessagesContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabase";
import { messagesApi } from "@/services/api";
import log from "@/utils/logger";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/EventContext";
import {
  MessagePreviewResponse,
  EventMessagesResponse,
  SendMessageResponse,
} from "@movapp/types";

// Use the types from the API instead of defining our own
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
  sending: boolean;
  hasMore: boolean;
  total: number;
  loadMessages: (_eventId: string) => Promise<void>;
  sendMessage: (_content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;

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
  sending: false,
  hasMore: true,
  total: 0,
  loadMessages: async () => {},
  sendMessage: async () => {},
  loadMoreMessages: async () => {},
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
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Shared state
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Load full messages with pagination
  const loadMessagesPage = useCallback(
    async (eventId: string, pageNum: number) => {
      if (!user?.id) return;

      try {
        const data: EventMessagesResponse = await messagesApi.getMessages(
          eventId,
          user.id,
          pageNum,
          30
        );

        if (pageNum === 1) {
          setMessages(data.messages);
        } else {
          // Deduplicate messages when loading more
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = data.messages.filter(
              (m: Message) => !existingIds.has(m.id)
            );
            return [...newMessages, ...prev];
          });
        }

        setHasMore(data.hasMore);
        setTotal(data.total);
        setPage(pageNum);
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

  // Load initial messages for event
  const loadMessages = useCallback(
    async (eventId: string) => {
      setMessagesLoading(true);
      setError(null);
      await loadMessagesPage(eventId, 1);
    },
    [loadMessagesPage]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentEventId || !user?.id || sending || !content.trim()) return;

      setSending(true);
      try {
        const newMessage = await messagesApi.sendMessage(
          currentEventId,
          user.id,
          { content: content.trim(), type: "text" }
        );

        setMessages((prev) => [...prev, newMessage]);
        setTotal((prev) => prev + 1);

        // Update preview with new message
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

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    // Only allow loading more if initial load is complete and we're not currently loading
    if (hasMore && !messagesLoading && currentEventId) {
      await loadMessagesPage(currentEventId, page + 1);
    }
  }, [currentEventId, hasMore, messagesLoading, page, loadMessagesPage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load preview and messages when event changes
  useEffect(() => {
    if (event?.id) {
      setCurrentEventId(event.id);
      loadPreview(event.id);
      loadMessages(event.id);
    }
  }, [event?.id, loadPreview, loadMessages]);

  // Set up real-time subscription for message updates
  useEffect(() => {
    if (!event?.id || !user?.id) return;

    const channel = supabase
      .channel(`event-messages-${event.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `eventId=eq.${event.id}`,
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Don't add our own messages (they're already added optimistically)
          if (newMessage.senderId === user?.id) return;

          // Add the new message with basic sender info
          const messageWithSender: Message = {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            type: newMessage.type || "text",
            sender: {
              id: newMessage.senderId,
              username: "User", // Placeholder - ideally fetch from API
              profileThumbnailPath: null,
              profileThumbnailUrl: null,
            },
          };

          // Update messages if we're viewing this event's chat
          if (currentEventId === event.id) {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === newMessage.id);
              if (exists) return prev;
              return [...prev, messageWithSender];
            });
            setTotal((prev) => prev + 1);
          }

          // Always update preview
          loadPreview(event.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event?.id, user?.id, currentEventId, loadPreview]);

  const contextValue = useMemo(
    () => ({
      preview,
      previewLoading,
      loadPreview,
      messages,
      messagesLoading,
      sending,
      hasMore,
      total,
      loadMessages,
      sendMessage,
      loadMoreMessages,
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
      sending,
      hasMore,
      total,
      loadMessages,
      sendMessage,
      loadMoreMessages,
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
