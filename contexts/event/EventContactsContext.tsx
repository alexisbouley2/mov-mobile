import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Alert, Linking } from "react-native";
import * as Contacts from "expo-contacts";
import { InviteContact } from "@/components/event/invite/InviteContactItem";
import { normalizePhoneNumber } from "@/utils/phoneValidation";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useEvent } from "@/contexts/event/EventContext";
import { usersApi } from "@/services/api/users";
import { UserContact } from "@movapp/types";
import log from "@/utils/logger";

export interface ContactPermissionState {
  status: "undetermined" | "granted" | "denied";
  canAskAgain: boolean;
}

// Helper function to chunk array into smaller arrays
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

interface EventContactsContextType {
  contacts: InviteContact[];
  permissionState: ContactPermissionState;
  loading: boolean;
  requestPermission: () => Promise<{ status: string; canAskAgain: boolean }>;
  checkPermission: () => Promise<{ status: string; canAskAgain: boolean }>;
  fetchContacts: () => Promise<void>;
}

const EventContactsContext = createContext<EventContactsContextType>({
  contacts: [],
  permissionState: {
    status: "undetermined",
    canAskAgain: true,
  },
  loading: false,
  requestPermission: async () => ({ status: "denied", canAskAgain: false }),
  checkPermission: async () => ({ status: "denied", canAskAgain: false }),
  fetchContacts: async () => {},
});

export const useEventContacts = () => useContext(EventContactsContext);

export function EventContactsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contacts, setContacts] = useState<InviteContact[]>([]);
  const [permissionState, setPermissionState] =
    useState<ContactPermissionState>({
      status: "undetermined",
      canAskAgain: true,
    });
  const [loading, setLoading] = useState(false);
  const { user } = useUserProfile();
  const { event } = useEvent();

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
      log.error("Error checking contact permissions:", error);
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
      log.error("Error requesting contact permissions:", error);
      return { status: "denied" as const, canAskAgain: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check which contacts are MOV users with event participation (chunked)
  const checkContacts = useCallback(
    async (phoneNumbers: string[]): Promise<UserContact[]> => {
      if (!phoneNumbers.length || !event?.id) return [];

      try {
        // Chunk phone numbers into batches of 100
        const phoneNumberChunks = chunkArray(phoneNumbers, 100);
        const allUserContacts: UserContact[] = [];

        // Process each chunk sequentially to avoid overwhelming the backend
        for (const chunk of phoneNumberChunks) {
          try {
            const response = await usersApi.checkContacts(chunk, event.id);
            if (response.success) {
              allUserContacts.push(...response.contacts);
            }
          } catch (error) {
            log.error("Error checking contacts chunk:", error);
            // Continue with other chunks even if one fails
          }
        }

        return allUserContacts;
      } catch (error) {
        log.error("Error checking contacts:", error);
        return [];
      }
    },
    [event?.id]
  );

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
        // Normalize and format contacts
        const formattedContacts: InviteContact[] = data
          .filter((contact) => contact.name && contact.phoneNumbers?.length)
          .map((contact, index) => {
            const phoneNumber = contact.phoneNumbers?.[0]?.number || "";
            const normalizedPhone = normalizePhoneNumber(
              phoneNumber,
              user?.countryCode
            );
            const contactName = contact.name || "Unknown";

            return {
              id: contact.id || `contact-${index}`,
              name: contactName,
              nameLower: contactName.toLowerCase(), // Pre-compute lowercase for search optimization
              phone: phoneNumber,
              normalizedPhone: normalizedPhone,
            };
          });

        // Check which contacts are MOV users with event participation
        const phoneNumbers: string[] = [];
        formattedContacts.forEach((contact) => {
          if (contact.normalizedPhone && contact.normalizedPhone.length > 0) {
            phoneNumbers.push(contact.normalizedPhone);
          }
        });

        const userContacts = await checkContacts(phoneNumbers);

        // Merge enriched data with formatted contacts
        const contactsWithUser = formattedContacts.map((contact) => {
          const userContact = userContacts.find(
            (userContact) => userContact.phone === contact.normalizedPhone
          );

          return {
            ...contact,
            user: userContact,
          };
        });

        // Sort contacts alphabetically by name
        const sortedContacts = contactsWithUser.sort((a, b) => {
          return a.nameLower.localeCompare(b.nameLower);
        });

        setContacts(sortedContacts);
      }
    } catch (error) {
      log.error("Error fetching contacts:", error);
      Alert.alert("Error", "Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.countryCode, checkContacts]);

  // Initialize on mount - check permission status
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-fetch contacts if permission is granted and event changes
  useEffect(() => {
    if (
      permissionState.status === "granted" &&
      event?.id &&
      contacts.length === 0
    ) {
      fetchContacts();
    }
  }, [permissionState.status, event?.id, contacts.length, fetchContacts]);

  const contextValue = useMemo(
    () => ({
      contacts,
      permissionState,
      loading,
      requestPermission,
      checkPermission,
      fetchContacts,
    }),
    [
      contacts,
      permissionState,
      loading,
      requestPermission,
      checkPermission,
      fetchContacts,
    ]
  );

  return (
    <EventContactsContext.Provider value={contextValue}>
      {children}
    </EventContactsContext.Provider>
  );
}
