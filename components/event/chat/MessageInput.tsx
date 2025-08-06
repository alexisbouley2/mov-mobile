// components/event/chat/MessageInput.tsx
import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MessageInputProps {
  onSendMessage: (_text: string) => void;
  sending: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  sending,
}) => {
  const [inputText, setInputText] = useState("");
  const textInputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText && !sending) {
      onSendMessage(trimmedText);
      setInputText("");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === "ios" ? 160 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={[styles.textInput]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            multiline
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            enablesReturnKeyAutomatically
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? "#fff" : "#666"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    backgroundColor: "#000",
  },
  container: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#222",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: Platform.OS === "ios" ? "top" : "center",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#333",
  },
});
