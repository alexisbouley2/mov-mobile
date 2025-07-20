import React, { useState, useCallback, useEffect } from "react";
import { View, Alert, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { eventsApi } from "@/services/api/events";
import { config } from "@/lib/config";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/event/EventContext";
import InviteHeader from "@/components/event/invite/InviteHeader";
import InviteContactList from "@/components/event/invite/InviteContactList";
import { useContacts } from "@/hooks/event/useContacts";

export default function EventInviteScreen() {
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserProfile();
  const { event } = useEvent();
  const router = useRouter();
  const [shareLoading, setShareLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteUrlLoading, setInviteUrlLoading] = useState(true);

  const { contacts, permissionState, loading, requestPermission } =
    useContacts();

  // Generate invite URL once when component loads
  const generateInviteUrl = useCallback(async () => {
    if (!user) {
      setInviteUrlLoading(false);
      return;
    }

    try {
      setInviteUrlLoading(true);
      const res = await eventsApi.generateInvite(eventId, user.id);
      const url = `${config.EXPO_PUBLIC_WEB_URL}/invite/${res.token}`;
      setInviteUrl(url);
    } catch (error) {
      console.error("Failed to generate invite URL:", error);
      Alert.alert(
        "Error",
        "Could not generate invite link. Please try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: generateInviteUrl },
        ]
      );
    } finally {
      setInviteUrlLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    generateInviteUrl();
  }, [generateInviteUrl]);

  const handleShare = useCallback(async () => {
    if (!inviteUrl) {
      Alert.alert("Error", "Invite link not ready");
      return;
    }

    setShareLoading(true);
    try {
      await Share.share({ url: inviteUrl, title: inviteUrl });
    } catch {
      Alert.alert("Error", "Could not share invite link");
    } finally {
      setShareLoading(false);
    }
  }, [inviteUrl]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000000", paddingTop: 40 }}>
      <InviteHeader
        onBack={() => router.back()}
        onShare={handleShare}
        shareLoading={shareLoading || inviteUrlLoading}
      />
      <InviteContactList
        contacts={contacts}
        permissionState={permissionState}
        loading={loading}
        onRequestPermission={requestPermission}
        eventName={event?.name || undefined}
        inviteUrl={inviteUrl}
      />
    </View>
  );
}
