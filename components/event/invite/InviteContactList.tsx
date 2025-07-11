import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import InviteContactItem, { InviteContact } from "./InviteContactItem";
import ContactsPermissionDenied from "./ContactsPermissionDenied";
import { ContactPermissionState } from "@/hooks/event/useContacts";

interface InviteContactListProps {
  contacts: InviteContact[];
  permissionState: ContactPermissionState;
  loading: boolean;
  onRequestPermission?: () => void;
  eventName?: string;
  inviteUrl?: string | null;
}

export default function InviteContactList({
  contacts,
  permissionState,
  loading,
  onRequestPermission,
  eventName,
  inviteUrl,
}: InviteContactListProps) {
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  // Show permission denied or undetermined state
  if (
    permissionState.status === "denied" ||
    permissionState.status === "undetermined"
  ) {
    return (
      <ContactsPermissionDenied
        canAskAgain={permissionState.canAskAgain}
        onRequestPermission={onRequestPermission}
        isUndetermined={permissionState.status === "undetermined"}
      />
    );
  }

  // Show contacts list
  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />
      <Text style={styles.contactsTitle}>Contacts</Text>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InviteContactItem
            contact={item}
            added={added.includes(item.id)}
            onAdd={() =>
              setAdded((a) => (a.includes(item.id) ? a : [...a, item.id]))
            }
            eventName={eventName}
            inviteUrl={inviteUrl}
          />
        )}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate height of each contact item
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: "#1C1C1E",
    color: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    fontSize: 16,
  },
  contactsTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 16,
  },
});

export type { InviteContact };
