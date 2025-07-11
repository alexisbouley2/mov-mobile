import React, { useState, useCallback } from "react";
import { View, Alert, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { eventsApi } from "@/services/api/events";
import { config } from "@/lib/config";
import { useUserProfile } from "@/contexts/UserProfileContext";
import InviteHeader from "@/components/event/invite/InviteHeader";
import InviteContactList from "@/components/event/invite/InviteContactList";
import { useContacts } from "@/hooks/event/useContacts";

export default function EventInviteScreen() {
  const { id: eventId } = useLocalSearchParams<{ id: string }>();
  const { user } = useUserProfile();
  const router = useRouter();
  const [shareLoading, setShareLoading] = useState(false);

  const { contacts, permissionState, loading, requestPermission } =
    useContacts();

  const handleShare = useCallback(async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }
    setShareLoading(true);
    try {
      const res = await eventsApi.generateInvite(eventId, user.id);
      const url = `${config.EXPO_PUBLIC_WEB_URL}/invite/${res.token}`;
      await Share.share({ url, title: url });
    } catch {
      Alert.alert("Error", "Could not generate invite link");
    } finally {
      setShareLoading(false);
    }
  }, [eventId, user]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000000", paddingTop: 40 }}>
      <InviteHeader
        onBack={() => router.back()}
        onShare={handleShare}
        shareLoading={shareLoading}
      />
      <InviteContactList
        contacts={contacts}
        permissionState={permissionState}
        loading={loading}
        onRequestPermission={requestPermission}
      />
    </View>
  );
}
