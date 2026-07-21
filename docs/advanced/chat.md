---
title: Chat & Messaging
description: Build real-time chat and messaging features with Stacks.js
---

# Chat & Messaging

Stacks.js Chat provides a complete solution for building real-time messaging features, from simple chat widgets to full-featured messaging platforms.

## Configuration

### Chat Configuration

```typescript
// config/chat.ts
export default {
  // Enable chat functionality
  enabled: true,

  // Storage driver
  driver: 'database', // 'database' | 'redis'

  // Message settings
  messages: {
    maxLength: 5000,
    attachments: {
      enabled: true,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'application/pdf', 'video/*'],
    },
    reactions: {
      enabled: true,
      allowedEmoji: ['👍', '❤️', '😂', '😮', '😢', '😡'],
    },
    editing: {
      enabled: true,
      timeLimit: 15 * 60, // 15 minutes
    },
    deletion: {
      enabled: true,
      forEveryone: true,
    },
  },

  // Presence settings
  presence: {
    enabled: true,
    updateInterval: 30000, // 30 seconds
    offlineAfter: 120000, // 2 minutes
  },

  // Typing indicators
  typing: {
    enabled: true,
    timeout: 3000, // 3 seconds
  },

  // Read receipts
  readReceipts: {
    enabled: true,
  },

  // Push notifications
  pushNotifications: {
    enabled: true,
    provider: 'firebase', // 'firebase' | 'apns' | 'web-push'
  },

  // Moderation
  moderation: {
    enabled: true,
    profanityFilter: true,
    spamDetection: true,
    maxMessagesPerMinute: 30,
  },
}
```

## Models

### Conversation Model

```typescript
// app/Models/Conversation.ts
import { Model } from '@stacksjs/orm'

export default class Conversation extends Model {
  static fields = {
    type: { type: 'enum', values: ['direct', 'group'], default: 'direct' },
    name: { type: 'string', nullable: true }, // For group chats
    avatar: { type: 'string', nullable: true },
    created_by: { type: 'foreignId', references: 'users' },
    last_message_at: { type: 'datetime', nullable: true },
    settings: { type: 'json', default: {} },
  }

  static relationships = {
    participants: { type: 'belongsToMany', model: 'User', pivot: 'conversation_participants' },
    messages: { type: 'hasMany', model: 'Message' },
    creator: { type: 'belongsTo', model: 'User', foreignKey: 'created_by' },
  }

  // Get the other participant in a direct conversation
  async getOtherParticipant(userId: number) {
    const participants = await this.participants
    return participants.find(p => p.id !== userId)
  }

  // Get unread count for a user
  async unreadCount(userId: number) {
    const participant = await ConversationParticipant
      .where('conversation_id', this.id)
      .where('user_id', userId)
      .first()

    return Message.where('conversation_id', this.id)
      .where('created_at', '>', participant.last_read_at || new Date(0))
      .where('user_id', '!=', userId)
      .count()
  }
}
```

### Message Model

```typescript
// app/Models/Message.ts
export default class Message extends Model {
  static fields = {
    conversation_id: { type: 'foreignId', references: 'conversations' },
    user_id: { type: 'foreignId', references: 'users' },
    type: { type: 'enum', values: ['text', 'image', 'file', 'system'], default: 'text' },
    content: { type: 'text' },
    metadata: { type: 'json', default: {} },
    reply_to_id: { type: 'foreignId', references: 'messages', nullable: true },
    edited_at: { type: 'datetime', nullable: true },
    deleted_at: { type: 'datetime', nullable: true },
  }

  static relationships = {
    conversation: { type: 'belongsTo', model: 'Conversation' },
    user: { type: 'belongsTo', model: 'User' },
    replyTo: { type: 'belongsTo', model: 'Message', foreignKey: 'reply_to_id' },
    reactions: { type: 'hasMany', model: 'MessageReaction' },
    attachments: { type: 'hasMany', model: 'MessageAttachment' },
    readBy: { type: 'belongsToMany', model: 'User', pivot: 'message_reads' },
  }

  get isEdited() {
    return this.edited_at !== null
  }

  get isDeleted() {
    return this.deleted_at !== null
  }
}
```

## Chat Service

### Starting Conversations

```typescript
import { Chat } from '@stacksjs/chat'

// Start direct conversation
const conversation = await Chat.startDirectConversation(
  currentUserId,
  otherUserId,
)

// Start group conversation
const group = await Chat.startGroupConversation({
  name: 'Project Team',
  createdBy: currentUserId,
  participants: [userId1, userId2, userId3],
  avatar: '/images/team.jpg',
})

// Find or create conversation
const conversation = await Chat.findOrCreateConversation(
  currentUserId,
  otherUserId,
)
```

### Sending Messages

```typescript
// Send text message
const message = await Chat.sendMessage({
  conversationId: conversation.id,
  userId: currentUserId,
  content: 'Hello, how are you?',
})

// Send with attachment
const message = await Chat.sendMessage({
  conversationId: conversation.id,
  userId: currentUserId,
  content: 'Check out this photo!',
  attachments: [
    {
      type: 'image',
      file: uploadedFile,
    },
  ],
})

// Reply to message
const reply = await Chat.sendMessage({
  conversationId: conversation.id,
  userId: currentUserId,
  content: 'I agree!',
  replyToId: originalMessage.id,
})

// Send system message
await Chat.sendSystemMessage({
  conversationId: conversation.id,
  content: 'John added Sarah to the group',
})
```

### Retrieving Messages

```typescript
// Get conversation messages
const messages = await Chat.getMessages(conversationId, {
  limit: 50,
  before: lastMessageId, // For pagination
})

// Get user's conversations
const conversations = await Chat.getConversations(userId, {
  limit: 20,
  includeLastMessage: true,
})

// Search messages
const results = await Chat.searchMessages(conversationId, 'search term')
```

### Message Actions

```typescript
// Edit message
await Chat.editMessage(messageId, userId, 'Updated content')

// Delete message
await Chat.deleteMessage(messageId, userId, {
  forEveryone: true,
})

// Add reaction
await Chat.addReaction(messageId, userId, '👍')

// Remove reaction
await Chat.removeReaction(messageId, userId, '👍')

// Mark as read
await Chat.markAsRead(conversationId, userId, lastMessageId)
```

## Real-Time Features

### WebSocket Integration

```typescript
// Chat channel setup
import { Realtime } from '@stacksjs/realtime'

// Join conversation channel
const channel = Realtime.private(`conversation.${conversationId}`)

// Listen for new messages
channel.on('message.sent', (message) => {
  addMessageToUI(message)
})

// Listen for message updates
channel.on('message.edited', (message) => {
  updateMessageInUI(message)
})

channel.on('message.deleted', ({ messageId }) => {
  removeMessageFromUI(messageId)
})

// Listen for reactions
channel.on('reaction.added', ({ messageId, reaction, user }) => {
  updateReactionsUI(messageId, reaction, user)
})

// Listen for read receipts
channel.on('message.read', ({ userId, messageId }) => {
  updateReadReceiptUI(userId, messageId)
})
```

### Typing Indicators

```typescript
// Send typing indicator
await Chat.startTyping(conversationId, userId)

// Stop typing (called automatically after timeout)
await Chat.stopTyping(conversationId, userId)

// Listen for typing events
channel.on('user.typing', ({ userId, isTyping }) => {
  if (isTyping) {
    showTypingIndicator(userId)
  } else {
    hideTypingIndicator(userId)
  }
})
```

### Presence

```typescript
import { Presence } from '@stacksjs/chat'

// Update user presence
await Presence.update(userId, 'online')

// Get user presence
const status = await Presence.get(userId)
// { status: 'online', lastSeen: Date }

// Get multiple users' presence
const statuses = await Presence.getMany([userId1, userId2, userId3])

// Listen for presence changes
Realtime.presence('chat').on('presence', (users) => {
  updateOnlineStatus(users)
})
```

## Group Chat Features

### Managing Groups

```typescript
// Add participant
await Chat.addParticipant(conversationId, userId, {
  addedBy: currentUserId,
  role: 'member', // 'admin' | 'member'
})

// Remove participant
await Chat.removeParticipant(conversationId, userId, {
  removedBy: currentUserId,
})

// Leave group
await Chat.leaveConversation(conversationId, userId)

// Update group settings
await Chat.updateConversation(conversationId, {
  name: 'New Group Name',
  avatar: '/new-avatar.jpg',
})

// Set participant role
await Chat.setParticipantRole(conversationId, userId, 'admin')
```

### Group Permissions

```typescript
// Check if user can perform action
const canSend = await Chat.can(userId, 'send', conversationId)
const canEdit = await Chat.can(userId, 'edit-settings', conversationId)
const canRemove = await Chat.can(userId, 'remove-members', conversationId)

// Configure group permissions
await Chat.updateConversation(conversationId, {
  settings: {
    onlyAdminsCanSend: false,
    onlyAdminsCanAddMembers: true,
    onlyAdminsCanEditInfo: true,
  },
})
```

## API Endpoints

### Chat Controller

```typescript
// app/Controllers/ChatController.ts
export default {
  // List conversations
  async conversations(request: Request) {
    const userId = request.user.id
    const { limit = 20, cursor } = request.query

    const conversations = await Chat.getConversations(userId, {
      limit,
      cursor,
      includeLastMessage: true,
      includeUnreadCount: true,
    })

    return conversations
  },

  // Get conversation messages
  async messages(request: Request) {
    const { conversationId } = request.params
    const { limit = 50, before } = request.query

    // Verify user is participant
    await this.verifyParticipant(request.user.id, conversationId)

    const messages = await Chat.getMessages(conversationId, {
      limit,
      before,
    })

    // Mark as read
    if (messages.length > 0) {
      await Chat.markAsRead(conversationId, request.user.id, messages[0].id)
    }

    return messages
  },

  // Send message
  async send(request: Request) {
    const { conversationId } = request.params
    const { content, replyToId, attachments } = await request.validate({
      content: 'required|string|max:5000',
      replyToId: 'exists:messages,id',
      attachments: 'array',
    })

    await this.verifyParticipant(request.user.id, conversationId)

    const message = await Chat.sendMessage({
      conversationId,
      userId: request.user.id,
      content,
      replyToId,
      attachments,
    })

    return message
  },

  // Start new conversation
  async create(request: Request) {
    const { type, participants, name, message } = await request.validate({
      type: 'required|in:direct,group',
      participants: 'required|array|min:1',
      name: 'required_if:type,group|string',
      message: 'string',
    })

    let conversation

    if (type === 'direct') {
      conversation = await Chat.findOrCreateConversation(
        request.user.id,
        participants[0],
      )
    } else {
      conversation = await Chat.startGroupConversation({
        name,
        createdBy: request.user.id,
        participants: [request.user.id, ...participants],
      })
    }

    // Send initial message if provided
    if (message) {
      await Chat.sendMessage({
        conversationId: conversation.id,
        userId: request.user.id,
        content: message,
      })
    }

    return conversation
  },
}
```

### Routes

```typescript
// routes/api.ts
router.group({ prefix: '/chat', middleware: ['auth'] }, () => {
  router.get('/conversations', ChatController.conversations)
  router.post('/conversations', ChatController.create)
  router.get('/conversations/:conversationId/messages', ChatController.messages)
  router.post('/conversations/:conversationId/messages', ChatController.send)
  router.put('/messages/:messageId', ChatController.edit)
  router.delete('/messages/:messageId', ChatController.delete)
  router.post('/messages/:messageId/reactions', ChatController.addReaction)
  router.delete('/messages/:messageId/reactions/:emoji', ChatController.removeReaction)
  router.post('/conversations/:conversationId/typing', ChatController.typing)
  router.post('/conversations/:conversationId/read', ChatController.markRead)
})
```

## Chat UI Components

### Chat Window

```stx
<!-- components/ChatWindow.stx -->
<template>
  <div class="chat-window flex flex-col h-full">
    <!-- Header -->
    <div class="chat-header p-4 border-b flex items-center">
      <x-avatar :src="conversation.avatar" :alt="conversation.name" />
      <div class="ml-3">
        <h3 class="font-semibold">{{ conversation.name }}</h3>
        <span class="text-sm text-gray-500">{{ presenceText }}</span>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-messages flex-1 overflow-y-auto p-4" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id">
        <x-chat-message
          :message="message"
          :is-own="message.user_id === currentUserId"
          @reply="setReplyTo"
          @react="addReaction"
        />
      </div>

      <!-- Typing indicator -->
      <div v-if="typingUsers.length" class="typing-indicator">
        {{ typingText }}
      </div>
    </div>

    <!-- Reply preview -->
    <div v-if="replyTo" class="reply-preview p-2 bg-gray-100 border-t">
      <div class="flex items-center justify-between">
        <span class="text-sm">Replying to {{ replyTo.user.name }}</span>
        <button @click="replyTo = null">×</button>
      </div>
      <p class="text-sm text-gray-600 truncate">{{ replyTo.content }}</p>
    </div>

    <!-- Input -->
    <div class="chat-input p-4 border-t">
      <form @submit.prevent="sendMessage" class="flex items-end gap-2">
        <x-textarea
          v-model="newMessage"
          placeholder="Type a message..."
          rows="1"
          @input="handleTyping"
          class="flex-1"
        />
        <x-button type="submit" :disabled="!newMessage.trim()">
          Send
        </x-button>
      </form>
    </div>
  </div>
</template>
```

### Message Component

```stx
<!-- components/ChatMessage.stx -->
<template>
  <div
    :class="['chat-message', { 'own': isOwn, 'deleted': message.isDeleted }]"
  >
    <x-avatar v-if="!isOwn" :src="message.user.avatar" size="sm" />

    <div class="message-content">
      <!-- Reply reference -->
      <div v-if="message.replyTo" class="reply-reference" @click="scrollToMessage(message.replyTo.id)">
        <span class="font-medium">{{ message.replyTo.user.name }}</span>
        <p class="truncate">{{ message.replyTo.content }}</p>
      </div>

      <!-- Message body -->
      <div class="message-body">
        <span v-if="!isOwn" class="sender-name">{{ message.user.name }}</span>

        <p v-if="message.isDeleted" class="italic text-gray-400">
          This message was deleted
        </p>
        <p v-else>{{ message.content }}</p>

        <!-- Attachments -->
        <div v-if="message.attachments?.length" class="attachments">
          <x-chat-attachment
            v-for="attachment in message.attachments"
            :key="attachment.id"
            :attachment="attachment"
          />
        </div>

        <!-- Metadata -->
        <div class="message-meta">
          <span class="time">{{ formatTime(message.created_at) }}</span>
          <span v-if="message.isEdited" class="edited">(edited)</span>
          <x-read-receipt v-if="isOwn" :message="message" />
        </div>
      </div>

      <!-- Reactions -->
      <div v-if="message.reactions?.length" class="reactions">
        <button
          v-for="reaction in groupedReactions"
          :key="reaction.emoji"
          @click="toggleReaction(reaction.emoji)"
          :class="{ 'own-reaction': reaction.hasOwn }"
        >
          {{ reaction.emoji }} {{ reaction.count }}
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="message-actions">
      <button @click="$emit('reply', message)">Reply</button>
      <button @click="showReactionPicker = true">React</button>
      <button v-if="isOwn && !message.isDeleted" @click="editMessage">Edit</button>
      <button v-if="isOwn" @click="deleteMessage">Delete</button>
    </div>
  </div>
</template>
```

## Moderation

### Content Filtering

```typescript
import { Moderation } from '@stacksjs/chat'

// Check message content
const result = await Moderation.check(content)

if (result.flagged) {
  if (result.action === 'block') {
    throw new Error('Message contains prohibited content')
  } else if (result.action === 'filter') {
    content = result.filtered // Censored content
  }
}

// Report message
await Moderation.report({
  messageId: message.id,
  reporterId: userId,
  reason: 'spam',
  details: 'User is sending promotional content',
})

// Review reported messages
const reports = await Moderation.getReports({ status: 'pending' })

// Take action
await Moderation.takeAction(reportId, {
  action: 'delete', // 'delete' | 'warn' | 'ban'
  note: 'Spam content removed',
})
```

### Rate Limiting

```typescript
// Built-in rate limiting
// Configured in config/chat.ts: maxMessagesPerMinute

// Custom rate limiting
import { RateLimiter } from '@stacksjs/chat'

const limiter = new RateLimiter({
  key: `chat:${userId}`,
  maxRequests: 30,
  windowMs: 60000,
})

if (!await limiter.check()) {
  throw new Error('Too many messages. Please slow down.')
}
```

## Push Notifications

```typescript
import { ChatNotification } from '@stacksjs/chat'

// Send push notification for new message
ChatNotification.onNewMessage(async (message, recipients) => {
  for (const userId of recipients) {
    // Check if user is online
    const isOnline = await Presence.isOnline(userId)

    if (!isOnline) {
      await Push.send(userId, {
        title: message.user.name,
        body: message.content.substring(0, 100),
        data: {
          conversationId: message.conversation_id,
          messageId: message.id,
        },
      })
    }
  }
})
```
