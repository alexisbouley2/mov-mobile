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
- **Pagination support** for loading older messages
- Username display for other users' messages
- Time stamps for messages

**Props:**

- `messages`: Array of Message objects from the API
- `messagesLoading`: Boolean indicating if initial messages are being loaded
- `loadingEarlier`: Boolean indicating if pagination is loading (separate from initial loading)
- `hasMore`: Boolean indicating if there are more messages to load
- `sending`: Boolean indicating if a message is being sent
- `onSendMessage`: Function to handle sending a new message
- `onLoadMoreMessages`: Function to handle loading older messages

## Pagination Flow

The pagination works as follows:

1. **Initial Load**: When the chat opens, it loads the first page of messages
2. **Load Earlier Button**: When `hasMore={true}`, GiftedChat shows a "Load earlier messages" button at the top
3. **User Action**: User must **tap** the "Load earlier messages" button (not just scroll)
4. **Loading State**: `loadingEarlier={true}` shows a loading spinner
5. **API Call**: `onLoadMoreMessages` is called to fetch the next page
6. **Message Addition**: New messages are prepended to the existing list
7. **State Update**: `hasMore` is updated based on API response

**Important Notes:**

- The "Load earlier messages" button only appears when `hasMore={true}`
- Scrolling to the top does NOT trigger pagination - the user must tap the button
- `loadingEarlier` is separate from `messagesLoading` to provide proper UX

## Usage

```tsx
import { GiftedChatMessages } from "@/components/event/chat";

<GiftedChatMessages
  messages={messages}
  messagesLoading={messagesLoading}
  loadingEarlier={loadingEarlier}
  hasMore={hasMore}
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

## Legacy Components (Kept for Reference)

- `ChatMessagesList`: Custom FlatList implementation (replaced by GiftedChatMessages)
- `ChatInput`: Custom input component (replaced by GiftedChat's built-in input)
- `ChatMessage`: Custom message bubble component (replaced by GiftedChat's renderBubble)
- `DateSeparator`: Date separator component (handled by GiftedChat internally)
