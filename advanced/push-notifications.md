---
title: Push Notifications
description: Send push notifications across web, iOS, and Android with Stacks.js
---

# Push Notifications

Stacks.js Push provides a unified API for sending push notifications to web browsers, iOS, and Android devices.

## Configuration

### Push Configuration

```typescript
// config/push.ts
export default {
  // Default provider
  default: 'firebase',

  providers: {
    // Firebase Cloud Messaging (Android, iOS, Web)
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    },

    // Apple Push Notification Service (iOS)
    apns: {
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
      privateKey: process.env.APNS_PRIVATE_KEY,
      production: process.env.NODE_ENV === 'production',
    },

    // Web Push (Browsers)
    webPush: {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
      subject: 'mailto:admin@example.com',
    },
  },

  // Default notification settings
  defaults: {
    ttl: 86400, // 24 hours
    priority: 'high',
    sound: 'default',
  },

  // Queue settings
  queue: {
    enabled: true,
    connection: 'redis',
    batch: 1000, // Send in batches of 1000
  },
}
```

## Device Registration

### Registering Devices

```typescript
import { Push } from '@stacksjs/push'

// Register device token
await Push.registerDevice({
  userId: user.id,
  token: deviceToken,
  platform: 'ios', // 'ios' | 'android' | 'web'
  deviceId: uniqueDeviceId,
  metadata: {
    appVersion: '1.0.0',
    osVersion: '17.0',
    model: 'iPhone 15',
  },
})

// Unregister device
await Push.unregisterDevice(deviceToken)

// Get user's devices
const devices = await Push.getDevices(userId)
```

### Web Push Subscription

```typescript
// Frontend - Subscribe to web push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  // Send to backend
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' },
  })
}

// Backend - Store subscription
router.post('/push/subscribe', async (request) => {
  const subscription = request.body

  await Push.registerDevice({
    userId: request.user.id,
    token: JSON.stringify(subscription),
    platform: 'web',
    deviceId: subscription.endpoint,
  })

  return { success: true }
})
```

### iOS Registration

```swift
// iOS - AppDelegate.swift
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()

    // Send to your backend
    API.registerDevice(token: token, platform: "ios")
}
```

### Android Registration

```kotlin
// Android - FirebaseMessagingService
class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        // Send to your backend
        API.registerDevice(token, "android")
    }
}
```

## Sending Notifications

### Basic Notification

```typescript
import { Push } from '@stacksjs/push'

// Send to single user
await Push.send(userId, {
  title: 'New Message',
  body: 'You have a new message from John',
  icon: '/icons/notification.png',
  data: {
    type: 'message',
    messageId: '123',
  },
})

// Send to multiple users
await Push.sendToMany([userId1, userId2, userId3], {
  title: 'Announcement',
  body: 'Important system update',
})

// Send to all users
await Push.sendToAll({
  title: 'Maintenance Notice',
  body: 'System will be down for maintenance at midnight',
})
```

### Platform-Specific Options

```typescript
// With platform-specific options
await Push.send(userId, {
  title: 'Order Shipped',
  body: 'Your order #12345 has been shipped!',

  // iOS specific
  ios: {
    sound: 'notification.wav',
    badge: 5,
    category: 'ORDER_UPDATE',
    threadId: 'order-12345',
    contentAvailable: true,
    mutableContent: true,
    targetContentId: 'order-details',
  },

  // Android specific
  android: {
    channelId: 'orders',
    priority: 'high',
    ttl: 3600,
    collapseKey: 'order-updates',
    icon: 'ic_notification',
    color: '#4A90E2',
    clickAction: 'OPEN_ORDER',
    tag: 'order-12345',
  },

  // Web specific
  web: {
    icon: '/icons/order.png',
    badge: '/icons/badge.png',
    image: '/images/shipped.png',
    requireInteraction: true,
    actions: [
      { action: 'track', title: 'Track Package' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  },
})
```

### Rich Notifications

```typescript
// Notification with image
await Push.send(userId, {
  title: 'New Photo',
  body: 'John shared a photo with you',
  image: 'https://example.com/images/shared-photo.jpg',
})

// Notification with actions
await Push.send(userId, {
  title: 'Friend Request',
  body: 'Sarah wants to connect with you',
  actions: [
    { id: 'accept', title: 'Accept', icon: '/icons/check.png' },
    { id: 'decline', title: 'Decline', icon: '/icons/x.png' },
  ],
  data: {
    type: 'friend_request',
    fromUserId: '456',
  },
})
```

### Silent/Background Notifications

```typescript
// Silent notification (data only)
await Push.sendSilent(userId, {
  type: 'sync',
  lastSyncId: '12345',
})

// Content-available for iOS background refresh
await Push.send(userId, {
  ios: {
    contentAvailable: true,
  },
  data: {
    type: 'background_sync',
  },
})
```

## Topics & Channels

### Topic Subscriptions

```typescript
// Subscribe user to topic
await Push.subscribeToTopic(userId, 'news')
await Push.subscribeToTopic(userId, 'promotions')

// Unsubscribe from topic
await Push.unsubscribeFromTopic(userId, 'promotions')

// Send to topic
await Push.sendToTopic('news', {
  title: 'Breaking News',
  body: 'Important update...',
})

// Get user's topics
const topics = await Push.getUserTopics(userId)
```

### Android Notification Channels

```typescript
// Define channels in config
// config/push.ts
export default {
  android: {
    channels: [
      {
        id: 'messages',
        name: 'Messages',
        description: 'Chat messages and conversations',
        importance: 'high',
        sound: 'message.wav',
        vibration: true,
        lights: true,
        lightColor: '#4A90E2',
      },
      {
        id: 'orders',
        name: 'Order Updates',
        description: 'Updates about your orders',
        importance: 'default',
      },
      {
        id: 'promotions',
        name: 'Promotions',
        description: 'Special offers and deals',
        importance: 'low',
      },
    ],
  },
}

// Send to specific channel
await Push.send(userId, {
  title: 'New Message',
  body: 'Hello!',
  android: {
    channelId: 'messages',
  },
})
```

## Notification Service

### Notification Model

```typescript
// app/Models/Notification.ts
export default class Notification extends Model {
  static fields = {
    user_id: { type: 'foreignId', references: 'users' },
    type: { type: 'string' },
    title: { type: 'string' },
    body: { type: 'text' },
    data: { type: 'json', default: {} },
    read_at: { type: 'datetime', nullable: true },
    sent_at: { type: 'datetime', nullable: true },
    clicked_at: { type: 'datetime', nullable: true },
  }

  get isRead() {
    return this.read_at !== null
  }
}
```

### Notification Classes

```typescript
// app/Notifications/OrderShipped.ts
import { Notification } from '@stacksjs/notifications'

export class OrderShipped extends Notification {
  constructor(private order: Order) {
    super()
  }

  // Channels to send through
  via() {
    return ['push', 'database', 'mail']
  }

  // Push notification content
  toPush() {
    return {
      title: 'Order Shipped! 📦',
      body: `Your order #${this.order.number} is on its way`,
      data: {
        type: 'order_shipped',
        orderId: this.order.id,
      },
      ios: {
        badge: 1,
        sound: 'shipped.wav',
      },
      android: {
        channelId: 'orders',
      },
    }
  }

  // Database record
  toDatabase() {
    return {
      type: 'order_shipped',
      title: 'Order Shipped',
      body: `Your order #${this.order.number} has been shipped`,
      data: { orderId: this.order.id },
    }
  }

  // Email content
  toMail() {
    return new OrderShippedEmail(this.order)
  }
}

// Send notification
await user.notify(new OrderShipped(order))
```

## Handling Notifications

### Frontend Handler (Web)

```typescript
// Service Worker - sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: data.icon || '/icons/notification.png',
    badge: data.badge || '/icons/badge.png',
    image: data.image,
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction,
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data

  // Handle action button clicks
  if (event.action === 'accept') {
    // Handle accept action
  } else if (event.action === 'decline') {
    // Handle decline action
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow(`/notifications/${data.type}/${data.id}`)
    )
  }

  // Report click to backend
  fetch('/api/push/clicked', {
    method: 'POST',
    body: JSON.stringify({ notificationId: data.notificationId }),
  })
})
```

### iOS Handler

```swift
// iOS - Handle notification tap
func userNotificationCenter(_ center: UNUserNotificationCenter,
                            didReceive response: UNNotificationResponse,
                            withCompletionHandler completionHandler: @escaping () -> Void) {

    let userInfo = response.notification.request.content.userInfo

    if let type = userInfo["type"] as? String {
        switch type {
        case "message":
            navigateToMessage(userInfo["messageId"] as? String)
        case "order_shipped":
            navigateToOrder(userInfo["orderId"] as? String)
        default:
            break
        }
    }

    completionHandler()
}
```

## Analytics

### Tracking Delivery

```typescript
// Track notification events
Push.onSent((notification, deviceCount) => {
  Analytics.track('notification_sent', {
    notificationId: notification.id,
    deviceCount,
  })
})

Push.onDelivered((notification, deviceToken) => {
  Analytics.track('notification_delivered', {
    notificationId: notification.id,
  })
})

Push.onClicked((notification, action) => {
  Analytics.track('notification_clicked', {
    notificationId: notification.id,
    action,
  })
})

Push.onDismissed((notification) => {
  Analytics.track('notification_dismissed', {
    notificationId: notification.id,
  })
})
```

### Notification Stats

```typescript
// Get notification statistics
const stats = await Push.getStats({
  from: startDate,
  to: endDate,
})

// {
//   sent: 10000,
//   delivered: 9500,
//   clicked: 2500,
//   clickRate: 0.263,
//   dismissed: 7000,
// }

// Stats by notification type
const byType = await Push.getStatsByType('order_shipped')
```

## API Endpoints

```typescript
// routes/api.ts
router.group({ prefix: '/push', middleware: ['auth'] }, () => {
  // Register device
  router.post('/register', async (request) => {
    const { token, platform, deviceId } = request.body

    await Push.registerDevice({
      userId: request.user.id,
      token,
      platform,
      deviceId,
    })

    return { success: true }
  })

  // Unregister device
  router.delete('/unregister', async (request) => {
    const { token } = request.body
    await Push.unregisterDevice(token)
    return { success: true }
  })

  // Get notification preferences
  router.get('/preferences', async (request) => {
    return await Push.getPreferences(request.user.id)
  })

  // Update preferences
  router.put('/preferences', async (request) => {
    await Push.updatePreferences(request.user.id, request.body)
    return { success: true }
  })

  // Subscribe to topic
  router.post('/topics/:topic/subscribe', async (request) => {
    await Push.subscribeToTopic(request.user.id, request.params.topic)
    return { success: true }
  })

  // Track click
  router.post('/clicked', async (request) => {
    const { notificationId } = request.body
    await Notification.where('id', notificationId).update({
      clicked_at: new Date(),
    })
    return { success: true }
  })
})
```

## Best Practices

### Notification Preferences

```typescript
// Let users control notifications
const preferences = {
  enabled: true,
  categories: {
    messages: true,
    orders: true,
    promotions: false,
    marketing: false,
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York',
  },
}

// Check before sending
async function shouldSendPush(userId, category) {
  const prefs = await Push.getPreferences(userId)

  if (!prefs.enabled) return false
  if (!prefs.categories[category]) return false

  if (prefs.quietHours.enabled) {
    const now = dayjs().tz(prefs.quietHours.timezone)
    const start = dayjs(prefs.quietHours.start, 'HH:mm')
    const end = dayjs(prefs.quietHours.end, 'HH:mm')

    if (now.isAfter(start) || now.isBefore(end)) {
      return false // In quiet hours
    }
  }

  return true
}
```

### Rate Limiting

```typescript
// Don't spam users
const limiter = new RateLimiter({
  key: `push:${userId}`,
  maxRequests: 10,
  windowMs: 3600000, // 1 hour
})

if (!await limiter.check()) {
  // Queue for later instead of dropping
  await Push.queue(userId, notification, { delay: 3600000 })
}
```

### Batching

```typescript
// Send to many users efficiently
await Push.sendToMany(userIds, notification, {
  batchSize: 1000,
  delay: 100, // ms between batches
})
```
