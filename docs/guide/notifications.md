---
title: Email & Notifications
description: Transactional email, templates, and multi-channel notifications in Stacks.js
---

# Email & Notifications

Stacks.js provides a unified system for sending transactional emails and multi-channel notifications. Send messages via email, SMS, push notifications, Slack, Discord, and more—all with a consistent API.

> **Protocol context** — This guide covers the **Stacks.js reference implementation**. The behavior it relies on is specified by **the Notifications contract** in the [Stacks Protocol white paper](/) (§7.3), so these concepts transfer to any conformant implementation — the specific APIs shown here are TypeScript/Bun.

## Email

### Configuration

```typescript
// config/email.ts
export default {
  // Default mailer
  default: 'smtp',

  // From address
  from: {
    address: 'hello@example.com',
    name: 'My App',
  },

  // Mailer configurations
  mailers: {
    smtp: {
      driver: 'smtp',
      host: process.env.MAIL_HOST,
      port: 587,
      username: process.env.MAIL_USERNAME,
      password: process.env.MAIL_PASSWORD,
      encryption: 'tls',
    },

    ses: {
      driver: 'ses',
      region: 'us-east-1',
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
    },

    postmark: {
      driver: 'postmark',
      token: process.env.POSTMARK_TOKEN,
    },

    resend: {
      driver: 'resend',
      key: process.env.RESEND_API_KEY,
    },

    mailgun: {
      driver: 'mailgun',
      domain: process.env.MAILGUN_DOMAIN,
      secret: process.env.MAILGUN_SECRET,
      endpoint: 'api.mailgun.net',
    },
  },

  // Queue emails by default
  queue: true,
  queueName: 'emails',
}
```

### Sending Email

```typescript
import { Mail } from '@stacksjs/email'

// Simple email
await Mail.to('user@example.com')
  .subject('Welcome!')
  .text('Thanks for signing up.')
  .send()

// With HTML
await Mail.to('user@example.com')
  .subject('Welcome!')
  .html('<h1>Welcome!</h1><p>Thanks for signing up.</p>')
  .send()

// Multiple recipients
await Mail.to(['user1@example.com', 'user2@example.com'])
  .cc('manager@example.com')
  .bcc('archive@example.com')
  .subject('Team Update')
  .html(content)
  .send()

// With attachments
await Mail.to('user@example.com')
  .subject('Your Report')
  .html(content)
  .attach('/path/to/report.pdf')
  .attach(Buffer.from(csvData), {
    filename: 'data.csv',
    contentType: 'text/csv',
  })
  .send()

// Using specific mailer
await Mail.mailer('postmark')
  .to('user@example.com')
  .subject('Important')
  .html(content)
  .send()
```

### Mailable Classes

```bash
# Generate mailable
buddy make:mail WelcomeEmail
buddy make:mail OrderConfirmation
buddy make:mail PasswordReset
```

```typescript
// app/Mail/WelcomeEmail.ts
import { Mailable } from '@stacksjs/email'
import type { User } from '@/Models/User'

export default class WelcomeEmail extends Mailable {
  constructor(public user: User) {
    super()
  }

  // Build the email
  build() {
    return this
      .to(this.user.email)
      .subject(`Welcome to ${config('app.name')}, ${this.user.name}!`)
      .view('emails/welcome', {
        user: this.user,
        dashboardUrl: url('/dashboard'),
      })
  }

  // Queue configuration
  get queue() {
    return 'emails'
  }

  get delay() {
    return 0
  }
}

// Usage
await Mail.send(new WelcomeEmail(user))
```

### Email Templates

```stx
<!-- resources/views/emails/welcome.stx -->
<x-email-layout>
  <x-email-header>
    <img src="{{ asset('images/logo.png') }}" alt="Logo" />
  </x-email-header>

  <x-email-body>
    <h1>Welcome, {{ user.name }}!</h1>

    <p>Thanks for joining us. We're excited to have you on board.</p>

    <x-email-button :href="dashboardUrl">
      Go to Dashboard
    </x-email-button>

    <p>If you have any questions, just reply to this email.</p>
  </x-email-body>

  <x-email-footer>
    <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    <p>
      <a href="{{ url('/unsubscribe') }}">Unsubscribe</a> |
      <a href="{{ url('/preferences') }}">Email Preferences</a>
    </p>
  </x-email-footer>
</x-email-layout>
```

### Email Layout Component

```stx
<!-- resources/views/components/email-layout.stx -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #3B82F6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <x-slot name="content" />
</body>
</html>
```

### Markdown Emails

```typescript
// app/Mail/InvoiceEmail.ts
export default class InvoiceEmail extends Mailable {
  build() {
    return this
      .to(this.user.email)
      .subject('Your Invoice')
      .markdown('emails/invoice', {
        invoice: this.invoice,
        user: this.user,
      })
  }
}
```

```markdown
<!-- resources/views/emails/invoice.md -->
# Invoice #{{ invoice.number }}

Hello {{ user.name }},

Your invoice for **${{ invoice.total }}** is ready.

| Item | Quantity | Price |
|------|----------|-------|
@foreach(invoice.items as item)
| {{ item.name }} | {{ item.quantity }} | ${{ item.price }} |
@endforeach

**Total: ${{ invoice.total }}**

@component('email.button', { url: invoice.paymentUrl })
Pay Now
@endcomponent

Thanks for your business!
```

### Queued Emails

```typescript
// Queue email (default behavior if queue: true in config)
await Mail.send(new WelcomeEmail(user))

// Force immediate sending
await Mail.send(new WelcomeEmail(user)).now()

// Explicitly queue with options
await Mail.queue(new WelcomeEmail(user))
  .onQueue('emails')
  .delay(60)

// Send later
await Mail.later(
  dayjs().add(1, 'hour'),
  new ReminderEmail(user)
)
```

## Notifications

### Configuration

```typescript
// config/notification.ts
export default {
  // Default channels
  default: ['mail', 'database'],

  // Channel configurations
  channels: {
    mail: {
      // Uses email config
    },

    database: {
      table: 'notifications',
    },

    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL,
    },

    discord: {
      webhook: process.env.DISCORD_WEBHOOK_URL,
    },

    sms: {
      driver: 'twilio',
      from: process.env.TWILIO_FROM,
    },

    push: {
      // Uses push config
    },
  },
}
```

### Creating Notifications

```bash
buddy make:notification OrderShippedNotification
buddy make:notification NewMessageNotification
buddy make:notification PaymentFailedNotification
```

```typescript
// app/Notifications/OrderShippedNotification.ts
import { Notification } from '@stacksjs/notifications'

export default class OrderShippedNotification extends Notification {
  constructor(public order: Order) {
    super()
  }

  // Channels to send via
  via(notifiable: User) {
    return ['mail', 'database', 'push']
  }

  // Email representation
  toMail(notifiable: User) {
    return new MailMessage()
      .subject('Your order has shipped!')
      .greeting(`Hello ${notifiable.name}!`)
      .line(`Your order #${this.order.number} has been shipped.`)
      .line(`Tracking number: ${this.order.trackingNumber}`)
      .action('Track Order', url(`/orders/${this.order.id}/track`))
      .line('Thank you for shopping with us!')
  }

  // Database representation
  toDatabase(notifiable: User) {
    return {
      type: 'order_shipped',
      order_id: this.order.id,
      order_number: this.order.number,
      tracking_number: this.order.trackingNumber,
      message: `Order #${this.order.number} has been shipped`,
    }
  }

  // Push notification
  toPush(notifiable: User) {
    return {
      title: 'Order Shipped!',
      body: `Your order #${this.order.number} is on its way`,
      icon: '/images/shipping-icon.png',
      data: {
        orderId: this.order.id,
        url: `/orders/${this.order.id}`,
      },
    }
  }

  // Slack representation
  toSlack(notifiable: User) {
    return new SlackMessage()
      .to('#orders')
      .content(`Order #${this.order.number} shipped to ${notifiable.name}`)
      .attachment({
        title: 'Order Details',
        fields: [
          { title: 'Order', value: this.order.number },
          { title: 'Tracking', value: this.order.trackingNumber },
          { title: 'Customer', value: notifiable.email },
        ],
      })
  }

  // SMS representation
  toSMS(notifiable: User) {
    return new SMSMessage()
      .content(`Your order #${this.order.number} has shipped! Track: ${this.order.trackingNumber}`)
  }
}
```

### Sending Notifications

```typescript
import { Notification } from '@stacksjs/notifications'

// Send to single user
await user.notify(new OrderShippedNotification(order))

// Send to multiple users
await Notification.send(
  new OrderShippedNotification(order)
).to(users)

// Send via specific channels
await Notification.send(
  new OrderShippedNotification(order)
).via(['mail', 'sms']).to(user)

// Queue notification
await Notification.send(
  new OrderShippedNotification(order)
).queue().to(user)

// Send with delay
await Notification.send(
  new ReminderNotification()
).delay(3600).to(user)

// Broadcast to all users
await Notification.broadcast(
  new SystemMaintenanceNotification()
)
```

### Notifiable Trait

```typescript
// app/Models/User.ts
import { Model, Notifiable } from '@stacksjs/orm'

export default class User extends Model {
  use = [Notifiable]

  static fields = {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string', nullable: true },
  }

  // Route notifications to email
  routeNotificationForMail() {
    return this.email
  }

  // Route to phone for SMS
  routeNotificationForSMS() {
    return this.phone
  }

  // Route to Slack
  routeNotificationForSlack() {
    return this.slackUserId
  }

  // Route to push
  routeNotificationForPush() {
    return this.pushTokens
  }
}
```

### Database Notifications

```typescript
// Get user's notifications
const notifications = await user.notifications

// Get unread notifications
const unread = await user.unreadNotifications

// Mark as read
await user.markNotificationsAsRead()

// Mark specific as read
await notification.markAsRead()

// Delete old notifications
await user.notifications
  .where('created_at', '<', dayjs().subtract(30, 'days'))
  .delete()
```

```stx
<!-- components/NotificationBell.stx -->
<template>
  <div class="relative">
    <button @click="open = !open">
      <x-icon name="bell" />
      @if(unreadCount > 0)
        <span class="badge">{{ unreadCount }}</span>
      @endif
    </button>

    <div v-if="open" class="dropdown">
      @foreach(notifications as notification)
        <div
          class="notification"
          :class="{ unread: !notification.read_at }"
          @click="markAsRead(notification)"
        >
          <p>{{ notification.data.message }}</p>
          <span class="time">{{ notification.created_at.diffForHumans() }}</span>
        </div>
      @endforeach
    </div>
  </div>
</template>

<script>
import { realtime } from '@stacksjs/realtime/client'

export default {
  props: ['userId'],

  data() {
    return {
      open: false,
      notifications: [],
      unreadCount: 0,
    }
  },

  async mounted() {
    await this.loadNotifications()

    // Real-time updates via Stacks realtime
    realtime.private(`user.${this.userId}`)
      .on('NotificationReceived', (notification) => {
        this.notifications.unshift(notification)
        this.unreadCount++
      })
  },

  unmounted() {
    realtime.leave(`user.${this.userId}`)
  },

  methods: {
    async loadNotifications() {
      const { data } = await fetch('/api/notifications')
      this.notifications = data.notifications
      this.unreadCount = data.unreadCount
    },

    async markAsRead(notification) {
      await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'POST',
      })
      notification.read_at = new Date()
      this.unreadCount--
    },
  },
}
</script>
```

## Notification Channels

### Slack

```typescript
// app/Notifications/SlackAlertNotification.ts
import { SlackMessage } from '@stacksjs/notifications'

export default class SlackAlertNotification extends Notification {
  via() {
    return ['slack']
  }

  toSlack() {
    return new SlackMessage()
      .to('#alerts')
      .username('Alert Bot')
      .icon(':warning:')
      .content('A critical error occurred')
      .attachment({
        color: 'danger',
        title: 'Error Details',
        text: this.error.message,
        fields: [
          { title: 'Environment', value: config('app.env'), short: true },
          { title: 'Time', value: dayjs().format('YYYY-MM-DD HH:mm:ss'), short: true },
        ],
        footer: 'Stacks Error Reporter',
      })
  }
}
```

### Discord

```typescript
toDiscord() {
  return new DiscordMessage()
    .content('New order received!')
    .embed({
      title: `Order #${this.order.number}`,
      color: 0x3B82F6,
      fields: [
        { name: 'Customer', value: this.order.customer.name },
        { name: 'Total', value: `$${this.order.total}` },
        { name: 'Items', value: this.order.items.length.toString() },
      ],
      timestamp: new Date().toISOString(),
    })
}
```

### SMS (Twilio)

```typescript
// config/sms.ts
export default {
  default: 'twilio',

  drivers: {
    twilio: {
      sid: process.env.TWILIO_SID,
      token: process.env.TWILIO_TOKEN,
      from: process.env.TWILIO_FROM,
    },

    vonage: {
      key: process.env.VONAGE_KEY,
      secret: process.env.VONAGE_SECRET,
      from: process.env.VONAGE_FROM,
    },
  },
}
```

```typescript
toSMS() {
  return new SMSMessage()
    .content(`Your verification code is: ${this.code}`)
}

// Direct SMS sending
import { SMS } from '@stacksjs/sms'

await SMS.to('+1234567890')
  .content('Your code is 123456')
  .send()
```

### Webhooks

```typescript
// Custom webhook channel
toWebhook() {
  return new WebhookMessage()
    .url('https://api.example.com/webhooks')
    .method('POST')
    .headers({
      'Authorization': `Bearer ${config('services.example.token')}`,
    })
    .payload({
      event: 'order.shipped',
      order_id: this.order.id,
      timestamp: Date.now(),
    })
}
```

## Preferences

### User Notification Preferences

```typescript
// app/Models/User.ts
export default class User extends Model {
  static fields = {
    // ...
    notification_preferences: {
      type: 'json',
      default: {
        marketing: { email: true, push: false, sms: false },
        orders: { email: true, push: true, sms: true },
        security: { email: true, push: true, sms: true },
      },
    },
  }

  shouldReceive(notification: Notification, channel: string) {
    const category = notification.category || 'default'
    return this.notification_preferences[category]?.[channel] ?? true
  }
}
```

```typescript
// In notification
export default class MarketingNotification extends Notification {
  category = 'marketing'

  via(notifiable: User) {
    return ['mail', 'push', 'sms'].filter(
      channel => notifiable.shouldReceive(this, channel)
    )
  }
}
```

### Preference Management

```stx
<!-- pages/settings/notifications.stx -->
<template>
  <x-settings-layout>
    <h2>Notification Preferences</h2>

    @foreach(categories as category)
      <div class="preference-group">
        <h3>{{ category.label }}</h3>

        <div class="channels">
          @foreach(channels as channel)
            <label>
              <input
                type="checkbox"
                :checked="preferences[category.key][channel.key]"
                @change="updatePreference(category.key, channel.key, $event.target.checked)"
              />
              {{ channel.label }}
            </label>
          @endforeach
        </div>
      </div>
    @endforeach

    <x-button @click="save">Save Preferences</x-button>
  </x-settings-layout>
</template>
```

## Testing

### Testing Emails

```typescript
import { Mail } from '@stacksjs/email'

describe('WelcomeEmail', () => {
  beforeEach(() => {
    Mail.fake()
  })

  it('sends welcome email', async () => {
    const user = await User.factory().create()

    await Mail.send(new WelcomeEmail(user))

    Mail.assertSent(WelcomeEmail)
    Mail.assertSent(WelcomeEmail, (mail) => {
      return mail.to === user.email
    })
  })

  it('contains correct content', async () => {
    const user = await User.factory().create()
    const mail = new WelcomeEmail(user)

    const rendered = await mail.render()

    expect(rendered).toContain(user.name)
    expect(rendered).toContain('Welcome')
  })
})
```

### Testing Notifications

```typescript
import { Notification } from '@stacksjs/notifications'

describe('OrderShippedNotification', () => {
  beforeEach(() => {
    Notification.fake()
  })

  it('sends notification', async () => {
    const user = await User.factory().create()
    const order = await Order.factory().create({ user_id: user.id })

    await user.notify(new OrderShippedNotification(order))

    Notification.assertSentTo(user, OrderShippedNotification)
  })

  it('uses correct channels', async () => {
    const notification = new OrderShippedNotification(order)
    const channels = notification.via(user)

    expect(channels).toContain('mail')
    expect(channels).toContain('database')
    expect(channels).toContain('push')
  })

  it('contains correct data', async () => {
    const notification = new OrderShippedNotification(order)
    const data = notification.toDatabase(user)

    expect(data.order_id).toBe(order.id)
    expect(data.tracking_number).toBe(order.trackingNumber)
  })
})
```

## Best Practices

### Email Design

```typescript
// Use responsive email templates
// Keep emails simple and readable
// Include plain text alternative
// Test across email clients

export default class MyEmail extends Mailable {
  build() {
    return this
      .view('emails/template')    // HTML version
      .text('emails/template-text') // Plain text
  }
}
```

### Notification Strategy

```typescript
// 1. Don't over-notify - respect user preferences
// 2. Use appropriate channels for urgency
// 3. Batch similar notifications
// 4. Include unsubscribe options

export default class MyNotification extends Notification {
  via(notifiable: User) {
    // Urgent: all channels
    if (this.isUrgent) {
      return ['mail', 'push', 'sms']
    }
    // Normal: just email and database
    return ['mail', 'database']
  }
}
```
