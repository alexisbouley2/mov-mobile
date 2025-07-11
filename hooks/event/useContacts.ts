import { useState, useEffect, useCallback } from "react";
import { Alert, Linking } from "react-native";
import * as Contacts from "expo-contacts";
import { InviteContact } from "@/components/event/invite/InviteContactItem";

export interface ContactPermissionState {
  status: "undetermined" | "granted" | "denied";
  canAskAgain: boolean;
}

export function useContacts() {
  const [contacts, setContacts] = useState<InviteContact[]>([]);
  const [permissionState, setPermissionState] =
    useState<ContactPermissionState>({
      status: "undetermined",
      canAskAgain: true,
    });
  const [loading, setLoading] = useState(false);

  // Check current permission status
  const checkPermission = useCallback(async () => {
    try {
      const { status, canAskAgain } = await Contacts.getPermissionsAsync();
      setPermissionState({
        status: status as "undetermined" | "granted" | "denied",
        canAskAgain,
      });
      return { status, canAskAgain };
    } catch (error) {
      console.error("Error checking contact permissions:", error);
      return { status: "denied" as const, canAskAgain: false };
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      const { status, canAskAgain } = await Contacts.requestPermissionsAsync();
      setPermissionState({
        status: status as "undetermined" | "granted" | "denied",
        canAskAgain,
      });

      if (status === "granted") {
        await fetchContacts();
      } else {
        // Show alert with option to open settings
        Alert.alert(
          "Contacts Permission Required",
          "We need access to your contacts to help you invite friends to events. Please enable it in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }

      return { status, canAskAgain };
    } catch (error) {
      console.error("Error requesting contact permissions:", error);
      return { status: "denied" as const, canAskAgain: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch contacts from device
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Name,
          Contacts.Fields.Image,
        ],
      });

      if (data.length > 0) {
        const formattedContacts: InviteContact[] = data
          .filter((contact) => contact.name && contact.phoneNumbers?.length)
          .map((contact, index) => ({
            id: contact.id || `contact-${index}`,
            name: contact.name || "Unknown",
            phone: contact.phoneNumbers?.[0]?.number || "",
            photoUrl: contact.image?.uri,
            povUser: false, // We'll need to check this against our user database
          }));

        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      Alert.alert("Error", "Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-fetch contacts if permission is granted
  useEffect(() => {
    if (permissionState.status === "granted" && contacts.length === 0) {
      fetchContacts();
    }
  }, [permissionState.status, contacts.length, fetchContacts]);

  return {
    contacts,
    permissionState,
    loading,
    requestPermission,
    checkPermission,
    fetchContacts,
  };
}
