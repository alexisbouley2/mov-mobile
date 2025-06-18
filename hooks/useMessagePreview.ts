// hooks/useMessagePreview.ts - Updated to work with direct event-message relationship
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";

export interface MessagePreview {
  hasMessages: boolean;
  messageCount: number;
  lastMessage?: {
    content: string;
    sender: {
      id: string;
      username: string;
      photoThumbnailPath?: string | null;
    };
    createdAt: string;
    type: string;
  } | null;
}

export function useMessagePreview(eventId: string) {
  const [preview, setPreview] = useState<MessagePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPreview = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${config.EXPO_PUBLIC_API_URL}/messages/event/${eventId}/preview/user/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      } else {
        console.error("Failed to fetch message preview:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching message preview:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id]);

  // Set up real-time subscription for message updates
  useEffect(() => {
    if (!eventId) return;

    // Subscribe to new messages for this event
    const channel = supabase
      .channel(`message-preview-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `eventId=eq.${eventId}`,
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
