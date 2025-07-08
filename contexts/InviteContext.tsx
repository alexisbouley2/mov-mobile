import React, { createContext, useContext, useState, useCallback } from "react";
import { Alert } from "react-native";
import { eventsApi } from "@/services/api/events";
import log from "@/utils/logger";

interface InviteContextType {
  pendingInviteToken: string | null;
  setPendingInviteToken: (_token: string | null) => void;
  processPendingInvite: (
    _userId: string
  ) => Promise<{ success: boolean; eventId?: string }>;
  clearPendingInvite: () => void;
}

const InviteContext = createContext<InviteContextType>({
  pendingInviteToken: null,
  setPendingInviteToken: () => {},
  processPendingInvite: async () => ({ success: false }),
  clearPendingInvite: () => {},
});

export const useInvite = () => useContext(InviteContext);

export function InviteProvider({ children }: { children: React.ReactNode }) {
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(
    null
  );

  const processPendingInvite = useCallback(
    async (userId: string): Promise<{ success: boolean; eventId?: string }> => {
      if (!pendingInviteToken) {
        return { success: false };
      }

      try {
        const response = await eventsApi.acceptInvite({
          token: pendingInviteToken,
          userId,
        });

        if (response.success) {
          Alert.alert("Success", response.message);
          setPendingInviteToken(null);
          return { success: true, eventId: response.eventId || undefined };
        } else {
          Alert.alert("Error", response.message);
          setPendingInviteToken(null);
          return { success: false };
        }
      } catch (error) {
        log.error("Error processing invite:", error);
        Alert.alert("Error", "Failed to join the event. Please try again.");
        setPendingInviteToken(null);
        return { success: false };
      }
    },
    [pendingInviteToken]
  );

  const clearPendingInvite = useCallback(() => {
    setPendingInviteToken(null);
  }, []);

  const contextValue: InviteContextType = {
    pendingInviteToken,
    setPendingInviteToken,
    processPendingInvite,
    clearPendingInvite,
  };

  return (
    <InviteContext.Provider value={contextValue}>
      {children}
    </InviteContext.Provider>
  );
}
