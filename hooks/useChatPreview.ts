import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";

export interface ChatPreview {
  hasChat: boolean;
  hasMessages: boolean;
  messageCount: number;
  lastMessage?: {
    content: string;
    sender: {
      id: string;
      username: string;
      photo?: string;
    };
    createdAt: string;
    type: string;
  } | null;
}

export function useChatPreview(eventId: string) {
  const [preview, setPreview] = useState<ChatPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPreview = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${config.EXPO_PUBLIC_API_URL}/chat/event/${eventId}/preview/user/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      }
    } catch (error) {
      console.error("Error fetching chat preview:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id]);

  // Set up real-time subscription for chat updates
  useEffect(() => {
    if (!eventId) return;

    // Subscribe to new messages for this event's chat
    const channel = supabase
      .channel(`chat-preview-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          // Note: We'll filter by eventId in the callback since we can't directly filter on Chat.eventId
        },
        (_payload) => {
          // When a new message is inserted, refresh the preview
          fetchPreview();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchPreview]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  return {
    preview,
    loading,
    refetch: fetchPreview,
  };
}
