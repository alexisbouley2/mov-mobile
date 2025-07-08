// Updated components/event/EventParticipantsBottomSheet.tsx
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useEventParticipants } from "@/contexts/EventParticipantsContext";
import ParticipantListItem from "@/components/event/participants/ParticipantListItem";
import { Participant } from "@movapp/types";
import PureBottomSheet from "./PureBottomSheet";
import EventParticipantsBottomSheetHeader from "./EventParticipantsBottomSheetHeader";

type TabType = "confirmed" | "invited";

interface EventParticipantsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function EventParticipantsBottomSheet({
  visible,
  onClose,
}: EventParticipantsBottomSheetProps) {
  const {
    confirmedParticipants,
    unconfirmedParticipants,
    confirmedLoading,
    unconfirmedLoading,
    confirmedHasMore,
    unconfirmedHasMore,
    loadMoreConfirmedParticipants,
    loadMoreUnconfirmedParticipants,
    loadBottomSheetParticipants,
    currentEventId,
  } = useEventParticipants();

  const [activeTab, setActiveTab] = useState<TabType>("confirmed");

  // Load participants when bottom sheet opens
  useEffect(() => {
    if (visible && currentEventId) {
      loadBottomSheetParticipants(currentEventId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, currentEventId]);

  // Reset tab to confirmed when opening
  useEffect(() => {
    if (visible) setActiveTab("confirmed");
  }, [visible]);

  const renderParticipant = ({ item }: { item: Participant }) => (
    <ParticipantListItem participant={item} />
  );

  const renderFooter = (loading: boolean, hasMore: boolean) => {
    if (!hasMore) return null;
    return <PureBottomSheet.Footer loading={loading} />;
  };

  return (
    <PureBottomSheet visible={visible} onClose={onClose}>
      <EventParticipantsBottomSheetHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        confirmedCount={confirmedParticipants.length}
        invitedCount={unconfirmedParticipants.length}
        onClose={onClose}
      />
      {activeTab === "confirmed" ? (
        <FlatList
          data={confirmedParticipants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={loadMoreConfirmedParticipants}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() =>
            renderFooter(confirmedLoading, confirmedHasMore)
          }
          showsVerticalScrollIndicator={false}
          bounces={true}
        />
      ) : (
        <FlatList
          data={unconfirmedParticipants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={loadMoreUnconfirmedParticipants}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() =>
            renderFooter(unconfirmedLoading, unconfirmedHasMore)
          }
          showsVerticalScrollIndicator={false}
          bounces={true}
        />
      )}
    </PureBottomSheet>
  );
}
