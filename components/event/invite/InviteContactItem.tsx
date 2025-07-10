import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ContactAvatar from "../../ui/ContactAvatar";

export interface InviteContact {
  id: string;
  name: string;
  phone?: string;
  povUser?: boolean;
  participant?: boolean;
  photoUrl?: string;
}

interface InviteContactItemProps {
  contact: InviteContact;
  added: boolean;
  onAdd: () => void;
}

export default function InviteContactItem({
  contact,
  added,
  onAdd,
}: InviteContactItemProps) {
  // Determine button state and text
  let buttonText = "";
  let buttonDisabled = false;
  let buttonStyle = {};
  let buttonTextStyle = {};
  let onPress = undefined;

  if (contact.povUser) {
    if (contact.participant) {
      buttonText = "Member";
      buttonDisabled = true;
      buttonStyle = [styles.button, styles.notClickableButton];
      buttonTextStyle = [styles.buttonText];
    } else if (added) {
      buttonText = "Added";
      buttonDisabled = true;
      buttonStyle = [styles.button, styles.notClickableButton];
      buttonTextStyle = [styles.buttonText];
    } else {
      buttonText = "Invite";
      buttonDisabled = false;
      buttonStyle = [styles.button, styles.clickableButton];
      buttonTextStyle = [styles.buttonText];
      onPress = onAdd;
    }
  } else {
    buttonText = "Invite";
    buttonDisabled = false;
    buttonStyle = [styles.button, styles.clickableButton];
    buttonTextStyle = [styles.buttonText];
    onPress = onAdd;
  }

  return (
    <View style={styles.contactRow}>
      <ContactAvatar
        name={contact.name}
        photoUrl={contact.photoUrl}
        size={40}
      />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        {contact.povUser ? (
          <Text style={styles.contactDescription}>POV User</Text>
        ) : (
          contact.phone && (
            <Text style={styles.contactDescription}>{contact.phone}</Text>
          )
        )}
      </View>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={buttonDisabled}
        activeOpacity={buttonDisabled ? 1 : 0.7}
      >
        <Text style={buttonTextStyle}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2D2B4F",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contactDescription: {
    color: "#aaa",
    fontSize: 14,
  },
  button: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  clickableButton: {
    backgroundColor: "#44436A",
  },
  notClickableButton: {
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    color: "#fff",
  },
});
