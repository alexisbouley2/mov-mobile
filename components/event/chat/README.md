# Chat Components

This directory contains chat-related components for the MOV app.

## Components

### GiftedChatMessages

The main chat component that uses `react-native-gifted-chat` to provide a full-featured chat experience.

**Features:**

- Real-time message display
- Message sending with typing indicators
- Avatar support for users
- Custom styling matching the app's dark theme
- Pagination support for loading older messages
- Username display for other users' messages
- Time stamps for messages

**Props:**

- `messages`: Array of Message objects from the API
- `messagesLoading`: Boolean indicating if messages are being loaded
- `sending`: Boolean indicating if a message is being sent
- `onSendMessage`: Function to handle sending a new message
- `onLoadMoreMessages`: Function to handle loading older messages

### Legacy Components (Kept for Reference)

- `ChatMessagesList`: Custom FlatList implementation (replaced by GiftedChatMessages)
- `ChatInput`: Custom input component (replaced by GiftedChat's built-in input)
- `ChatMessage`: Custom message bubble component (replaced by GiftedChat's renderBubble)
- `DateSeparator`: Date separator component (handled by GiftedChat internally)

## Usage

```tsx
import { GiftedChatMessages } from "@/components/event/chat";

<GiftedChatMessages
  messages={messages}
  messagesLoading={messagesLoading}
  sending={sending}
  onSendMessage={handleSendMessage}
  onLoadMoreMessages={loadMoreMessages}
/>;
```

## Styling

The component uses custom styling to match the app's dark theme:

- Dark background (#000)
- Blue bubbles for user messages (#007AFF)
- Gray bubbles for other users' messages (#333)
- Custom text input styling
- Avatar support with fallback handling

## Integration

The component integrates with:

- `EventMessagesContext` for state management
- `UserProfileContext` for current user information
- Real-time updates via Supabase subscriptions
- Backend API for message persistence
