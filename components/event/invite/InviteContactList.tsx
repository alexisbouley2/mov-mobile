import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import InviteContactItem, { InviteContact } from "./InviteContactItem";

interface InviteContactListProps {
  contacts: InviteContact[];
}

export default function InviteContactList({
  contacts,
}: InviteContactListProps) {
  const [search, setSearch] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
          />
        )}
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
});

export type { InviteContact };
