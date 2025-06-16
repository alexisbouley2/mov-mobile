// hooks/useChat.ts - Updated to work with eventId directly
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  type: string;
  sender: {
    id: string;
    username: string;
    photo?: string;
  };
}

export interface Chat {
  id: string;
  eventId: string;
  event: {
    id: string;
    name: string;
  };
}

export function useChat(eventId: string) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth(); // Only get user, no token

  // Initialize chat - now guaranteed to exist
  const initializeChat = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/chat/event/${eventId}/user/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const chatData = await response.json();
        setChat(chatData);

        // Load initial messages
        await loadMessages(eventId, 1);
      } else {
        throw new Error("Failed to load chat");
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id]);

  // Load messages with pagination
  const loadMessages = useCallback(
    async (eventId: string, pageNum: number) => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/chat/event/${eventId}/messages/user/${user.id}?page=${pageNum}&limit=30`,
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
                (m: any) => !existingIds.has(m.id)
              );
              return [...newMessages, ...prev];
            });
          }

          setHasMore(data.hasMore);
          setTotal(data.total);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
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
          `${process.env.EXPO_PUBLIC_API_URL}/chat/event/${eventId}/messages/user/${user.id}`,
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

  // Set up real-time subscription
  useEffect(() => {
    if (!chat) return;

    const channel = supabase
      .channel(`chat-${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `chatId=eq.${chat.id}`,
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Don't add our own messages (they're already added optimistically)
          if (newMessage.senderId === user?.id) return;

          // Add the new message - we'll need to fetch sender info
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id);
            if (exists) return prev;

            // For now, add with minimal sender info
            // In a real app, you might want to fetch complete sender data
            const messageWithSender = {
              ...newMessage,
              sender: {
                id: newMessage.senderId,
                username: "User", // Placeholder
                photo: null,
              },
            };

            return [...prev, messageWithSender];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat, user?.id]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  return {
    chat,
    messages,
    loading,
    sending,
    hasMore,
    total,
    sendMessage,
    loadMoreMessages,
    refetch: initializeChat,
  };
}
