import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface ChatInputProps {
  onSendMessage: (_message: string) => Promise<void>;
  sending: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  sending,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSend = async () => {
    if (inputText.trim() && !sending) {
      const messageToSend = inputText.trim();
      setInputText("");
      await onSendMessage(messageToSend);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type a message..."
        placeholderTextColor="#666"
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!inputText.trim() || sending) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!inputText.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <IconSymbol name="arrow.up" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#333",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#666",
  },
});
