// hooks/useMessages.ts - Simplified version without chat model
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  type: string;
  sender: {
    id: string;
    username: string;
    photoThumbnailPath?: string | null;
  };
}

export function useMessages(eventId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  // Load messages with pagination
  const loadMessages = useCallback(
    async (eventId: string, pageNum: number) => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `${config.EXPO_PUBLIC_API_URL}/messages/event/${eventId}/user/${user.id}?page=${pageNum}&limit=30`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

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
        } else {
          console.error("Failed to load messages:", response.statusText);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!eventId || !user?.id || sending || !content.trim()) return;

      setSending(true);
      try {
        const response = await fetch(
          `${config.EXPO_PUBLIC_API_URL}/messages/event/${eventId}/user/${user.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content.trim(), type: "text" }),
          }
        );

        if (response.ok) {
          const newMessage = await response.json();
          setMessages((prev) => [...prev, newMessage]);
          setTotal((prev) => prev + 1);
        } else {
          console.error("Failed to send message:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setSending(false);
      }
    },
    [eventId, user?.id, sending]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading) {
      loadMessages(eventId, page + 1);
    }
  }, [eventId, hasMore, loading, page, loadMessages]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!eventId || !user?.id) return;

    const channel = supabase
      .channel(`event-messages-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `eventId=eq.${eventId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Don't add our own messages (they're already added optimistically)
          if (newMessage.senderId === user?.id) return;

          // Add the new message with basic sender info
          // You might want to fetch complete sender data from your API
          const messageWithSender: Message = {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            type: newMessage.type || "text",
            sender: {
              id: newMessage.senderId,
              username: "User", // Placeholder - ideally fetch from API
              photoThumbnailPath: null,
            },
          };

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id);
            if (exists) return prev;
            return [...prev, messageWithSender];
          });

          setTotal((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, user?.id]);

  // Initial load
  useEffect(() => {
    if (eventId && user?.id) {
      loadMessages(eventId, 1);
    }
  }, [eventId, user?.id, loadMessages]);

  return {
    messages,
    loading,
    sending,
    hasMore,
    total,
    sendMessage,
    loadMoreMessages,
    refetch: () => loadMessages(eventId, 1),
  };
}
