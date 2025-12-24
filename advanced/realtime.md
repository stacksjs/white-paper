---
title: Real-Time Broadcasting
description: Building real-time features with WebSockets and event broadcasting in Stacks.js
---

# Real-Time Broadcasting

Stacks.js provides a powerful real-time broadcasting system that enables instant communication between your server and connected clients. Similar to Laravel's Reverb, Stacks includes a first-party WebSocket server built specifically for Bun, delivering exceptional performance for real-time features like live notifications, chat, collaborative editing, and live dashboards.

## Introduction

Many modern web applications require real-time features—showing notifications instantly, updating live data, or enabling collaborative features. Traditionally, this required polling or third-party services. Stacks.js includes everything you need for real-time communication out of the box:

- **Native WebSocket Server**: A high-performance Bun-native WebSocket server (Stacks' equivalent to Laravel Reverb)
- **Event Broadcasting**: Automatically broadcast server-side events to WebSocket channels
- **Multiple Drivers**: Support for native WebSocket, Pusher-compatible services, and Redis pub/sub
- **Channel Types**: Public, private, and presence channels with built-in authorization
- **Client Library**: Type-safe client for subscribing to channels and handling events

## Configuration

### Broadcasting Configuration

```typescript
// config/broadcasting.ts
export default {
  // Default broadcaster
  default: process.env.BROADCAST_DRIVER ?? 'stacks',

  // Broadcaster configurations
  connections: {
    // Stacks native WebSocket server (recommended)
    stacks: {
      driver: 'stacks',
      host: process.env.BROADCAST_HOST ?? 'localhost',
      port: Number(process.env.BROADCAST_PORT ?? 6001),

      // TLS configuration
      tls: {
        enabled: process.env.BROADCAST_TLS === 'true',
        cert: process.env.BROADCAST_TLS_CERT,
        key: process.env.BROADCAST_TLS_KEY,
      },

      // Scaling with Redis (for multi-server deployments)
      scaling: {
        enabled: false,
        redis: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        },
      },

      // App credentials (for authentication)
      app: {
        id: process.env.BROADCAST_APP_ID ?? 'stacks',
        key: process.env.BROADCAST_APP_KEY ?? 'stacks-key',
        secret: process.env.BROADCAST_APP_SECRET ?? 'stacks-secret',
      },

      // Connection limits
      maxConnections: 10000,
      maxChannelsPerConnection: 100,
      maxPayloadSize: 64 * 1024, // 64KB
    },

    // Pusher-compatible broadcaster
    pusher: {
      driver: 'pusher',
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      appId: process.env.PUSHER_APP_ID,
      cluster: process.env.PUSHER_CLUSTER ?? 'us2',
      useTLS: true,
      options: {
        encrypted: true,
      },
    },

    // Redis pub/sub broadcaster
    redis: {
      driver: 'redis',
      connection: 'default',
      queue: 'broadcasts',
    },

    // Null driver (for testing)
    null: {
      driver: 'null',
    },
  },
}
```

### Environment Variables

```bash
# .env
BROADCAST_DRIVER=stacks

# Stacks WebSocket Server
BROADCAST_HOST=localhost
BROADCAST_PORT=6001
BROADCAST_TLS=false
BROADCAST_APP_ID=my-app
BROADCAST_APP_KEY=my-app-key
BROADCAST_APP_SECRET=my-app-secret

# For Pusher (alternative)
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_CLUSTER=us2
```

## WebSocket Server

### Starting the Server

Stacks includes a built-in WebSocket server optimized for Bun's performance. Start it alongside your application:

```bash
# Start WebSocket server
buddy broadcast:serve

# With custom options
buddy broadcast:serve --host=0.0.0.0 --port=6001

# With TLS
buddy broadcast:serve --tls

# In production (with pm2 or supervisor)
buddy broadcast:serve --daemon
```

### Server Architecture

The Stacks WebSocket server provides:

- **High Performance**: Built on Bun's native WebSocket support, handling thousands of concurrent connections
- **Pusher Protocol Compatible**: Works with existing Pusher client libraries
- **Horizontal Scaling**: Use Redis pub/sub to scale across multiple servers
- **Built-in Monitoring**: Real-time metrics and connection tracking

```typescript
// The server is implemented in @stacksjs/realtime
import { WebSocketServer } from '@stacksjs/realtime'

// For advanced customization
const server = new WebSocketServer({
  host: 'localhost',
  port: 6001,

  // Connection handling
  onConnection(socket) {
    console.log('Client connected:', socket.id)
  },

  onDisconnection(socket) {
    console.log('Client disconnected:', socket.id)
  },

  // Custom authentication
  async authenticate(socket, data) {
    // Return user data or false to reject
    return await verifyToken(data.token)
  },
})

await server.start()
```

### Scaling with Redis

For multi-server deployments, enable Redis scaling to synchronize broadcasts across all WebSocket servers:

```typescript
// config/broadcasting.ts
export default {
  connections: {
    stacks: {
      driver: 'stacks',
      scaling: {
        enabled: true,
        redis: {
          host: process.env.REDIS_HOST,
          port: 6379,
          prefix: 'stacks_broadcast_',
        },
      },
    },
  },
}
```

With Redis scaling, broadcasts from any application server are distributed to all WebSocket server instances, ensuring all connected clients receive messages regardless of which server they're connected to.

## Channel Types

Stacks supports three types of channels, each serving different use cases:

### Public Channels

Anyone can subscribe to public channels without authentication. Use these for broadcast announcements or public data updates.

```typescript
// Server-side: Broadcasting to a public channel
import { broadcast } from '@stacksjs/realtime'

await broadcast('announcements')
  .event('NewAnnouncement', {
    title: 'Site Maintenance',
    message: 'We will be performing maintenance tonight.',
  })

// Client-side: Subscribing to a public channel
import { realtime } from '@stacksjs/realtime/client'

realtime.channel('announcements')
  .on('NewAnnouncement', (data) => {
    showNotification(data.title, data.message)
  })
```

### Private Channels

Private channels require authentication. The channel name is prefixed with `private-`.

```typescript
// Server-side: Broadcasting to a private channel
await broadcast(`private-user.${userId}`)
  .event('NotificationReceived', notification)

// Client-side: Subscribing to a private channel
realtime.private(`user.${userId}`)
  .on('NotificationReceived', (notification) => {
    addNotification(notification)
  })
```

### Presence Channels

Presence channels extend private channels with awareness of who else is subscribed. Perfect for collaborative features, chat rooms, or showing online status.

```typescript
// Server-side: Broadcasting to a presence channel
await broadcast(`presence-chat.${roomId}`)
  .event('MessageSent', message)

// Client-side: Subscribing with presence
const chat = realtime.join(`chat.${roomId}`)

// Access current members
chat.here((members) => {
  console.log('Current members:', members)
})

// Listen for members joining
chat.joining((member) => {
  console.log(`${member.name} joined the chat`)
})

// Listen for members leaving
chat.leaving((member) => {
  console.log(`${member.name} left the chat`)
})

// Listen for events
chat.on('MessageSent', (message) => {
  addMessage(message)
})
```

## Channel Authorization

Private and presence channels require authorization before a user can subscribe. Define authorization logic in your channels file:

```typescript
// routes/channels.ts
import { channel } from '@stacksjs/realtime'

// Private channel authorization
channel('private-user.{userId}', {
  authorize(user, userId) {
    // Only the user themselves can subscribe
    return user.id === parseInt(userId)
  },
})

// Private channel with async authorization
channel('private-order.{orderId}', {
  async authorize(user, orderId) {
    const order = await Order.find(orderId)
    return order && order.userId === user.id
  },
})

// Presence channel with member data
channel('presence-chat.{roomId}', {
  // Authorization check
  async authorize(user, roomId) {
    const room = await ChatRoom.find(roomId)
    return room?.isMember(user.id)
  },

  // Data to share with other presence members
  join(user) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatarUrl,
      status: user.status,
    }
  },

  // Called when a user leaves
  leave(user) {
    // Optional: Log or cleanup
  },
})

// Dynamic authorization based on permissions
channel('private-team.{teamId}', {
  async authorize(user, teamId) {
    return await user.belongsToTeam(teamId)
  },
})

// Admin-only channel
channel('private-admin.*', {
  authorize(user) {
    return user.isAdmin
  },
})
```

### Authorization Endpoint

The client automatically sends authorization requests to your application. Configure the endpoint:

```typescript
// routes/api.ts
import { Router } from '@stacksjs/router'

Router.post('/broadcasting/auth', async (request) => {
  // Stacks handles this automatically via the broadcasting module
  return await request.authorize()
})
```

## Broadcasting Events

### From Event Classes

The most powerful way to broadcast is from Event classes with automatic channel binding:

```typescript
// app/Events/OrderShipped.ts
import { Event } from '@stacksjs/events'

export default class OrderShipped extends Event {
  constructor(public order: Order) {
    super()
  }

  // Channels to broadcast to
  broadcastOn(): string[] {
    return [
      `private-order.${this.order.id}`,
      `private-user.${this.order.userId}`,
    ]
  }

  // Custom event name (optional, defaults to class name)
  broadcastAs(): string {
    return 'order.shipped'
  }

  // Data to broadcast (optional, defaults to public properties)
  broadcastWith(): object {
    return {
      orderId: this.order.id,
      trackingNumber: this.order.trackingNumber,
      estimatedDelivery: this.order.estimatedDelivery,
      carrier: this.order.carrier,
    }
  }

  // Condition for broadcasting (optional)
  broadcastWhen(): boolean {
    return this.order.status === 'shipped'
  }
}

// Dispatch the event - automatically broadcasts
import { dispatch } from '@stacksjs/events'

await dispatch(new OrderShipped(order))
```

### Direct Broadcasting

For simple broadcasts without Event classes:

```typescript
import { broadcast } from '@stacksjs/realtime'

// Simple broadcast
await broadcast('news').event('ArticlePublished', {
  id: article.id,
  title: article.title,
  excerpt: article.excerpt,
})

// Private channel broadcast
await broadcast(`private-user.${userId}`).event('BalanceUpdated', {
  balance: user.balance,
})

// Presence channel broadcast
await broadcast(`presence-document.${docId}`).event('CursorMoved', {
  userId: user.id,
  position: cursor.position,
})

// Broadcast to multiple channels
await broadcast(['news', 'updates', `private-admin`])
  .event('ImportantUpdate', data)

// Broadcast except to current socket (for the event originator)
await broadcast(`presence-chat.${roomId}`)
  .except(request.socketId)
  .event('NewMessage', message)
```

### Broadcasting from Models

Automatically broadcast model changes:

```typescript
// app/Models/Post.ts
import { Model, Broadcastable } from '@stacksjs/orm'

export default class Post extends Model {
  use = [Broadcastable]

  static fields = {
    title: 'string',
    content: 'text',
    status: 'string',
    authorId: 'integer',
  }

  // Broadcast on model events
  broadcastOn(event: string): string[] {
    return [
      'posts',
      `private-user.${this.authorId}`,
    ]
  }

  // Customize per-event
  broadcastCreated(): string[] {
    return ['posts']
  }

  broadcastUpdated(): string[] {
    return [`private-post.${this.id}`]
  }
}

// Model changes are automatically broadcast:
await Post.create({ title: 'Hello', authorId: 1 })
// Broadcasts: PostCreated event to 'posts' channel

await post.update({ title: 'Updated' })
// Broadcasts: PostUpdated event to 'private-post.{id}' channel
```

### Broadcast from Notifications

Notifications can automatically broadcast when using the database channel:

```typescript
// app/Notifications/InvoicePaidNotification.ts
import { Notification } from '@stacksjs/notifications'

export default class InvoicePaidNotification extends Notification {
  constructor(private invoice: Invoice) {
    super()
  }

  via(notifiable: User) {
    return ['mail', 'database', 'broadcast']
  }

  toBroadcast(notifiable: User) {
    return {
      title: 'Invoice Paid',
      amount: this.invoice.total,
      invoiceId: this.invoice.id,
    }
  }

  // Custom channel (defaults to private-user.{id})
  broadcastOn(notifiable: User): string {
    return `private-user.${notifiable.id}`
  }
}
```

## Client-Side Integration

### Installation

```bash
bun add @stacksjs/realtime
```

### Configuration

```typescript
// resources/js/bootstrap.ts
import { createRealtime } from '@stacksjs/realtime/client'

export const realtime = createRealtime({
  // WebSocket server URL
  host: import.meta.env.VITE_BROADCAST_HOST ?? 'localhost',
  port: import.meta.env.VITE_BROADCAST_PORT ?? 6001,

  // App credentials
  key: import.meta.env.VITE_BROADCAST_APP_KEY,

  // Authentication (for private/presence channels)
  auth: {
    endpoint: '/broadcasting/auth',
    headers: {
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
    },
  },

  // TLS
  forceTLS: import.meta.env.PROD,

  // Auto-reconnect
  reconnect: true,
  reconnectDelay: 1000,
  maxReconnectAttempts: 10,
})

// Make globally available
window.realtime = realtime
```

### Channel Subscriptions

```typescript
// Public channel
const newsChannel = realtime.channel('news')

newsChannel.on('ArticlePublished', (article) => {
  addArticleToFeed(article)
})

newsChannel.on('BreakingNews', (news) => {
  showAlert(news.headline)
})

// Private channel
const userChannel = realtime.private(`user.${userId}`)

userChannel.on('NotificationReceived', (notification) => {
  notifications.value.unshift(notification)
  unreadCount.value++
})

userChannel.on('BalanceUpdated', ({ balance }) => {
  userBalance.value = balance
})

// Presence channel with member tracking
const chatChannel = realtime.join(`chat.${roomId}`)

// Current members
chatChannel.here((members) => {
  onlineMembers.value = members
})

// New member joined
chatChannel.joining((member) => {
  onlineMembers.value.push(member)
  showToast(`${member.name} joined`)
})

// Member left
chatChannel.leaving((member) => {
  onlineMembers.value = onlineMembers.value.filter(m => m.id !== member.id)
  showToast(`${member.name} left`)
})

// Events
chatChannel.on('MessageSent', (message) => {
  messages.value.push(message)
})

chatChannel.on('UserTyping', ({ userId, isTyping }) => {
  typingUsers.value[userId] = isTyping
})
```

### Sending Client Events

On presence channels, clients can send events directly to other subscribers:

```typescript
// Client events are prefixed with 'client-'
const chat = realtime.join(`chat.${roomId}`)

// Send typing indicator
function onTyping() {
  chat.whisper('typing', { isTyping: true })
}

// Listen for client events
chat.listenForWhisper('typing', ({ userId, isTyping }) => {
  updateTypingIndicator(userId, isTyping)
})
```

### Unsubscribing

```typescript
// Leave a specific channel
realtime.leave('news')
realtime.leave(`user.${userId}`)
realtime.leave(`chat.${roomId}`)

// Disconnect entirely
realtime.disconnect()

// Reconnect
realtime.connect()
```

### Connection Events

```typescript
realtime.on('connected', () => {
  console.log('Connected to WebSocket server')
})

realtime.on('disconnected', () => {
  console.log('Disconnected from WebSocket server')
})

realtime.on('reconnecting', (attempt) => {
  console.log(`Reconnecting... attempt ${attempt}`)
})

realtime.on('error', (error) => {
  console.error('WebSocket error:', error)
})
```

## Vue.js Integration

```typescript
// composables/useRealtime.ts
import { onMounted, onUnmounted, ref } from 'vue'
import { realtime } from '@/bootstrap'

export function useChannel(channelName: string) {
  const channel = ref(null)

  onMounted(() => {
    channel.value = realtime.channel(channelName)
  })

  onUnmounted(() => {
    realtime.leave(channelName)
  })

  return channel
}

export function usePrivateChannel(channelName: string) {
  const channel = ref(null)

  onMounted(() => {
    channel.value = realtime.private(channelName)
  })

  onUnmounted(() => {
    realtime.leave(channelName)
  })

  return channel
}

export function usePresenceChannel(channelName: string) {
  const channel = ref(null)
  const members = ref([])

  onMounted(() => {
    channel.value = realtime.join(channelName)

    channel.value.here((m) => {
      members.value = m
    })

    channel.value.joining((m) => {
      members.value.push(m)
    })

    channel.value.leaving((m) => {
      members.value = members.value.filter(member => member.id !== m.id)
    })
  })

  onUnmounted(() => {
    realtime.leave(channelName)
  })

  return { channel, members }
}
```

```vue
<!-- components/LiveNotifications.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { realtime } from '@/bootstrap'

const props = defineProps(['userId'])
const notifications = ref([])

let channel = null

onMounted(() => {
  channel = realtime.private(`user.${props.userId}`)

  channel.on('NotificationReceived', (notification) => {
    notifications.value.unshift(notification)
  })
})

onUnmounted(() => {
  realtime.leave(`user.${props.userId}`)
})
</script>

<template>
  <div class="notifications">
    <div v-for="notification in notifications" :key="notification.id">
      {{ notification.message }}
    </div>
  </div>
</template>
```

## React Integration

```tsx
// hooks/useRealtime.ts
import { useEffect, useState, useCallback } from 'react'
import { realtime } from '@/bootstrap'

export function useChannel(channelName: string) {
  const [channel, setChannel] = useState(null)

  useEffect(() => {
    const ch = realtime.channel(channelName)
    setChannel(ch)

    return () => {
      realtime.leave(channelName)
    }
  }, [channelName])

  return channel
}

export function usePresenceChannel(channelName: string) {
  const [channel, setChannel] = useState(null)
  const [members, setMembers] = useState([])

  useEffect(() => {
    const ch = realtime.join(channelName)
    setChannel(ch)

    ch.here((m) => setMembers(m))
    ch.joining((m) => setMembers(prev => [...prev, m]))
    ch.leaving((m) => setMembers(prev => prev.filter(member => member.id !== m.id)))

    return () => {
      realtime.leave(channelName)
    }
  }, [channelName])

  return { channel, members }
}

// Example component
function LiveChat({ roomId }) {
  const { channel, members } = usePresenceChannel(`chat.${roomId}`)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!channel) return

    channel.on('MessageSent', (message) => {
      setMessages(prev => [...prev, message])
    })
  }, [channel])

  return (
    <div>
      <div className="members">
        {members.map(m => <span key={m.id}>{m.name}</span>)}
      </div>
      <div className="messages">
        {messages.map(m => <div key={m.id}>{m.content}</div>)}
      </div>
    </div>
  )
}
```

## Testing

### Faking Broadcasts

```typescript
import { broadcast, Broadcast } from '@stacksjs/realtime'

describe('OrderShipped Event', () => {
  beforeEach(() => {
    Broadcast.fake()
  })

  it('broadcasts when order is shipped', async () => {
    const order = await Order.factory().create({ status: 'shipped' })

    await dispatch(new OrderShipped(order))

    Broadcast.assertBroadcast('order.shipped')

    Broadcast.assertBroadcast('order.shipped', (event) => {
      return event.orderId === order.id
    })

    Broadcast.assertBroadcastOn(`private-order.${order.id}`, 'order.shipped')
  })

  it('does not broadcast when order is not shipped', async () => {
    const order = await Order.factory().create({ status: 'pending' })

    await dispatch(new OrderShipped(order))

    Broadcast.assertNothingBroadcast()
  })
})
```

### Testing Channel Authorization

```typescript
describe('Channel Authorization', () => {
  it('authorizes user for their own channel', async () => {
    const user = await User.factory().create()

    const result = await Channel.authorize(
      'private-user.{userId}',
      user,
      { userId: user.id.toString() }
    )

    expect(result).toBe(true)
  })

  it('rejects unauthorized users', async () => {
    const user = await User.factory().create()
    const otherUser = await User.factory().create()

    const result = await Channel.authorize(
      'private-user.{userId}',
      user,
      { userId: otherUser.id.toString() }
    )

    expect(result).toBe(false)
  })
})
```

## Production Deployment

### Supervisor Configuration

```ini
# /etc/supervisor/conf.d/stacks-broadcast.conf
[program:stacks-broadcast]
command=buddy broadcast:serve --host=0.0.0.0 --port=6001
directory=/var/www/myapp
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/stacks/broadcast.log
stopwaitsecs=10
```

### Nginx Configuration

```nginx
# WebSocket reverse proxy
upstream websocket {
    server 127.0.0.1:6001;
}

server {
    listen 443 ssl http2;
    server_name ws.example.com;

    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    location / {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Health Monitoring

```typescript
// Check WebSocket server health
const health = await fetch('http://localhost:6001/health')
const stats = await health.json()
// {
//   status: 'healthy',
//   connections: 1234,
//   channels: 456,
//   uptime: 86400,
//   memory: { used: 128, limit: 512 }
// }
```

## Related Topics

For background job processing, scheduled tasks, and queue management, see the dedicated [Queues & Background Jobs](/guide/queues) guide.

For sending notifications through multiple channels (email, SMS, push), see [Email & Notifications](/guide/notifications).
