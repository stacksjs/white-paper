---
title: Examples & Recipes
description: Complete code examples for common patterns and use cases
---

# Examples & Recipes

Real-world code examples for common patterns in Stacks.js applications.

## CRUD Operations

### Basic Resource CRUD

```typescript
// app/Models/Post.ts
import { Model } from '@stacksjs/orm'

export default class Post extends Model {
  static table = 'posts'

  static fields = {
    title: 'string',
    slug: 'string',
    content: 'text',
    published: 'boolean',
    publishedAt: 'datetime?',
    authorId: 'integer',
  }

  static relationships = {
    author: () => this.belongsTo(User),
    comments: () => this.hasMany(Comment),
    tags: () => this.belongsToMany(Tag),
  }
}
```

```typescript
// app/Controllers/PostController.ts
import { Post } from '@/Models/Post'
import { Request, Response } from '@stacksjs/types'

export default class PostController {
  // List all posts
  async index(request: Request): Promise<Response> {
    const posts = await Post.query()
      .with(['author', 'tags'])
      .where('published', true)
      .orderBy('publishedAt', 'desc')
      .paginate(request.query.page ?? 1, 15)

    return Response.json(posts)
  }

  // Show single post
  async show(request: Request): Promise<Response> {
    const post = await Post.query()
      .with(['author', 'comments.author', 'tags'])
      .where('slug', request.params.slug)
      .firstOrFail()

    return Response.json(post)
  }

  // Create post
  async store(request: Request): Promise<Response> {
    const data = request.validate({
      title: 'required|string|max:200',
      content: 'required|string',
      tags: 'array',
      'tags.*': 'integer|exists:tags,id',
    })

    const post = await Post.create({
      ...data,
      slug: slugify(data.title),
      authorId: request.user.id,
    })

    if (data.tags) {
      await post.tags().attach(data.tags)
    }

    return Response.json(post, 201)
  }

  // Update post
  async update(request: Request): Promise<Response> {
    const post = await Post.findOrFail(request.params.id)

    // Authorization check
    if (post.authorId !== request.user.id) {
      return Response.json({ error: 'Unauthorized' }, 403)
    }

    const data = request.validate({
      title: 'string|max:200',
      content: 'string',
      published: 'boolean',
    })

    await post.update(data)

    return Response.json(post)
  }

  // Delete post
  async destroy(request: Request): Promise<Response> {
    const post = await Post.findOrFail(request.params.id)

    if (post.authorId !== request.user.id) {
      return Response.json({ error: 'Unauthorized' }, 403)
    }

    await post.delete()

    return Response.json({ success: true })
  }
}
```

```typescript
// routes/api.ts
Router.resource('posts', PostController)
// Creates: GET /posts, GET /posts/:id, POST /posts, PUT /posts/:id, DELETE /posts/:id
```

## Authentication Flows

### Email/Password Registration

```typescript
// app/Controllers/Auth/RegisterController.ts
export default class RegisterController {
  async store(request: Request): Promise<Response> {
    const data = request.validate({
      name: 'required|string|max:100',
      email: 'required|email|unique:users,email',
      password: 'required|string|min:8|confirmed',
    })

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: await hash(data.password),
    })

    // Send verification email
    await dispatch(new SendVerificationEmail(user))

    // Log in the user
    const token = await auth.login(user)

    return Response.json({
      user,
      token,
    }, 201)
  }
}
```

### OAuth Login (GitHub Example)

```typescript
// app/Controllers/Auth/GitHubController.ts
export default class GitHubController {
  // Redirect to GitHub
  async redirect(): Promise<Response> {
    const url = oauth.github.getAuthorizationUrl({
      scopes: ['user:email'],
      state: generateState(),
    })

    return Response.redirect(url)
  }

  // Handle callback
  async callback(request: Request): Promise<Response> {
    const { code, state } = request.query

    if (!verifyState(state)) {
      return Response.redirect('/login?error=invalid_state')
    }

    const tokens = await oauth.github.getAccessToken(code)
    const githubUser = await oauth.github.getUser(tokens.accessToken)

    // Find or create user
    let user = await User.where('githubId', githubUser.id).first()

    if (!user) {
      user = await User.create({
        name: githubUser.name,
        email: githubUser.email,
        githubId: githubUser.id,
        avatar: githubUser.avatar_url,
      })
    }

    const token = await auth.login(user)

    return Response.redirect(`/dashboard?token=${token}`)
  }
}
```

### Two-Factor Authentication

```typescript
// app/Controllers/Auth/TwoFactorController.ts
export default class TwoFactorController {
  // Enable 2FA
  async enable(request: Request): Promise<Response> {
    const user = request.user
    const secret = auth.twoFactor.generateSecret()

    await user.update({
      twoFactorSecret: encrypt(secret),
      twoFactorEnabled: false, // Not enabled until confirmed
    })

    const qrCode = await auth.twoFactor.generateQRCode(user.email, secret)

    return Response.json({
      secret,
      qrCode, // Base64 image
    })
  }

  // Confirm 2FA setup
  async confirm(request: Request): Promise<Response> {
    const { code } = request.validate({
      code: 'required|string|size:6',
    })

    const user = request.user
    const secret = decrypt(user.twoFactorSecret)

    if (!auth.twoFactor.verify(code, secret)) {
      return Response.json({ error: 'Invalid code' }, 400)
    }

    // Generate recovery codes
    const recoveryCodes = auth.twoFactor.generateRecoveryCodes()

    await user.update({
      twoFactorEnabled: true,
      twoFactorRecoveryCodes: encrypt(JSON.stringify(recoveryCodes)),
    })

    return Response.json({ recoveryCodes })
  }

  // Verify 2FA during login
  async verify(request: Request): Promise<Response> {
    const { code, userId } = request.validate({
      code: 'required|string',
      userId: 'required|integer',
    })

    const user = await User.findOrFail(userId)
    const secret = decrypt(user.twoFactorSecret)

    // Check TOTP code
    if (auth.twoFactor.verify(code, secret)) {
      const token = await auth.login(user)
      return Response.json({ token })
    }

    // Check recovery code
    const recoveryCodes = JSON.parse(decrypt(user.twoFactorRecoveryCodes))
    const codeIndex = recoveryCodes.indexOf(code)

    if (codeIndex !== -1) {
      // Remove used recovery code
      recoveryCodes.splice(codeIndex, 1)
      await user.update({
        twoFactorRecoveryCodes: encrypt(JSON.stringify(recoveryCodes)),
      })

      const token = await auth.login(user)
      return Response.json({ token })
    }

    return Response.json({ error: 'Invalid code' }, 400)
  }
}
```

## File Uploads

### Image Upload with Processing

```typescript
// app/Controllers/ImageController.ts
export default class ImageController {
  async store(request: Request): Promise<Response> {
    const file = request.file('image')

    // Validate
    if (!file) {
      return Response.json({ error: 'No image provided' }, 400)
    }

    if (!file.isImage()) {
      return Response.json({ error: 'File must be an image' }, 400)
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'Image too large (max 10MB)' }, 400)
    }

    // Process and store variants
    const variants = await imgx(file.buffer)
      .resize(1920, 1080, { fit: 'inside' })
      .toFormat('webp', { quality: 85 })
      .variants([
        { width: 1920, suffix: '-large' },
        { width: 800, suffix: '-medium' },
        { width: 400, suffix: '-thumb' },
      ])
      .upload('images')

    // Save to database
    const image = await Image.create({
      userId: request.user.id,
      originalName: file.name,
      path: variants.original,
      variants: variants.all,
    })

    return Response.json(image, 201)
  }
}
```

### Direct S3 Upload with Signed URLs

```typescript
// app/Controllers/UploadController.ts
export default class UploadController {
  // Generate presigned URL for direct upload
  async createPresignedUrl(request: Request): Promise<Response> {
    const { filename, contentType } = request.validate({
      filename: 'required|string',
      contentType: 'required|string',
    })

    const key = `uploads/${request.user.id}/${Date.now()}-${filename}`

    const presignedUrl = await Storage.disk('s3').getSignedUrl('putObject', {
      key,
      contentType,
      expiresIn: 3600, // 1 hour
    })

    return Response.json({
      uploadUrl: presignedUrl,
      key,
      publicUrl: `https://cdn.example.com/${key}`,
    })
  }

  // Confirm upload completion
  async confirmUpload(request: Request): Promise<Response> {
    const { key } = request.validate({
      key: 'required|string',
    })

    // Verify file exists
    if (!await Storage.disk('s3').exists(key)) {
      return Response.json({ error: 'File not found' }, 404)
    }

    // Save to database
    const upload = await Upload.create({
      userId: request.user.id,
      key,
      url: `https://cdn.example.com/${key}`,
    })

    return Response.json(upload)
  }
}
```

## Payment Integration

### Stripe Checkout

```typescript
// app/Controllers/CheckoutController.ts
import Stripe from 'stripe'

const stripe = new Stripe(config.services.stripe.secret)

export default class CheckoutController {
  async createSession(request: Request): Promise<Response> {
    const { items } = request.validate({
      items: 'required|array',
      'items.*.productId': 'required|exists:products,id',
      'items.*.quantity': 'required|integer|min:1',
    })

    const products = await Product.whereIn('id', items.map(i => i.productId)).get()

    const lineItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [product.imageUrl],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      }
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${config.app.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app.url}/checkout/cancel`,
      customer_email: request.user.email,
      metadata: {
        userId: request.user.id,
      },
    })

    return Response.json({ sessionId: session.id, url: session.url })
  }

  async handleWebhook(request: Request): Promise<Response> {
    const sig = request.headers.get('stripe-signature')
    const event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      config.services.stripe.webhookSecret
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object)
        break
    }

    return Response.json({ received: true })
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const order = await Order.create({
      userId: session.metadata.userId,
      stripeSessionId: session.id,
      status: 'paid',
      total: session.amount_total / 100,
    })

    await dispatch(new SendOrderConfirmation(order))
  }
}
```

### Subscription Management

```typescript
// app/Controllers/SubscriptionController.ts
export default class SubscriptionController {
  async subscribe(request: Request): Promise<Response> {
    const { priceId } = request.validate({
      priceId: 'required|string',
    })

    const user = request.user

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      })
      customerId = customer.id
      await user.update({ stripeCustomerId: customerId })
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })

    await Subscription.create({
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
    })

    return Response.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    })
  }

  async cancel(request: Request): Promise<Response> {
    const subscription = await Subscription.where('userId', request.user.id)
      .where('status', 'active')
      .firstOrFail()

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    await subscription.update({ cancelAtPeriodEnd: true })

    return Response.json({ success: true })
  }
}
```

## Real-time Features

### Chat Application

```typescript
// routes/channels.ts
import { channel } from '@stacksjs/realtime'

// Private chat rooms
channel('chat.{roomId}', {
  async authorize(user, roomId) {
    const room = await ChatRoom.find(roomId)
    return room?.members.includes(user.id)
  },

  async join(user) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    }
  },

  async message(data, user) {
    const message = await Message.create({
      roomId: data.roomId,
      userId: user.id,
      content: data.content,
    })

    return {
      message,
      user: { id: user.id, name: user.name },
    }
  },
})
```

```typescript
// Client-side
import { realtime } from '@stacksjs/realtime/client'

const chat = realtime.join(`chat.${roomId}`)

// Get current members
chat.here((members) => {
  console.log('Current members:', members)
})

// Listen for members joining
chat.joining((user) => {
  console.log(`${user.name} joined`)
})

// Listen for members leaving
chat.leaving((user) => {
  console.log(`${user.name} left`)
})

// Listen for messages
chat.on('MessageSent', (data) => {
  messages.push(data.message)
})

// Send message (triggers server broadcast)
async function sendMessage(content: string) {
  await fetch('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({ roomId, content }),
  })
}

// Client-to-client typing indicator
function onTyping() {
  chat.whisper('typing', { isTyping: true })
}

chat.listenForWhisper('typing', ({ userId, isTyping }) => {
  updateTypingIndicator(userId, isTyping)
})
```

### Live Notifications

```typescript
// app/Events/NotificationEvent.ts
import { Event } from '@stacksjs/events'

export class NotificationEvent extends Event {
  constructor(public notification: Notification) {
    super()
  }

  broadcastOn(): string[] {
    return [`private-user.${this.notification.userId}`]
  }

  broadcastAs(): string {
    return 'NotificationReceived'
  }

  broadcastWith(): object {
    return {
      id: this.notification.id,
      type: this.notification.type,
      message: this.notification.message,
      createdAt: this.notification.createdAt,
    }
  }
}

// Send notification - automatically broadcasts
import { dispatch } from '@stacksjs/events'
await dispatch(new NotificationEvent(notification))

// Client-side
import { realtime } from '@stacksjs/realtime/client'

realtime.private(`user.${userId}`)
  .on('NotificationReceived', (notification) => {
    showToast(notification.message)
    updateBadgeCount()
  })
```

## Background Jobs

### Email Queue

```typescript
// app/Jobs/SendWelcomeEmailJob.ts
export default class SendWelcomeEmailJob extends Job {
  queue = 'emails'
  tries = 3
  timeout = 30

  constructor(private user: User) {
    super()
  }

  async handle() {
    await Mail.send({
      to: this.user.email,
      template: 'welcome',
      data: {
        name: this.user.name,
        loginUrl: `${config.app.url}/login`,
      },
    })
  }

  async failed(error: Error) {
    await log.error('Failed to send welcome email', {
      userId: this.user.id,
      error: error.message,
    })
  }
}

// Dispatch
await dispatch(new SendWelcomeEmailJob(user))
```

### Batch Processing

```typescript
// app/Jobs/ProcessImportJob.ts
export default class ProcessImportJob extends Job {
  queue = 'imports'
  timeout = 600 // 10 minutes

  constructor(private importId: string) {
    super()
  }

  async handle() {
    const importRecord = await Import.findOrFail(this.importId)
    const file = await Storage.get(importRecord.filePath)
    const rows = parseCSV(file)

    let processed = 0
    const total = rows.length

    for (const row of rows) {
      await this.processRow(row)
      processed++

      // Update progress
      await this.updateProgress((processed / total) * 100)
    }

    await importRecord.update({ status: 'completed' })
  }

  private async processRow(row: Record<string, string>) {
    await User.updateOrCreate(
      { email: row.email },
      { name: row.name, department: row.department }
    )
  }
}
```

## API Patterns

### Pagination

```typescript
// Standard pagination response
async index(request: Request): Promise<Response> {
  const page = parseInt(request.query.page ?? '1')
  const perPage = Math.min(parseInt(request.query.per_page ?? '15'), 100)

  const posts = await Post.query()
    .with('author')
    .orderBy('createdAt', 'desc')
    .paginate(page, perPage)

  return Response.json({
    data: posts.data,
    meta: {
      currentPage: posts.currentPage,
      lastPage: posts.lastPage,
      perPage: posts.perPage,
      total: posts.total,
    },
    links: {
      first: `/api/posts?page=1`,
      last: `/api/posts?page=${posts.lastPage}`,
      prev: posts.currentPage > 1 ? `/api/posts?page=${posts.currentPage - 1}` : null,
      next: posts.currentPage < posts.lastPage ? `/api/posts?page=${posts.currentPage + 1}` : null,
    },
  })
}
```

### Filtering & Sorting

```typescript
async index(request: Request): Promise<Response> {
  const query = Post.query()

  // Filtering
  if (request.query.status) {
    query.where('status', request.query.status)
  }

  if (request.query.author) {
    query.where('authorId', request.query.author)
  }

  if (request.query.search) {
    query.where((q) => {
      q.where('title', 'like', `%${request.query.search}%`)
        .orWhere('content', 'like', `%${request.query.search}%`)
    })
  }

  if (request.query.from) {
    query.where('createdAt', '>=', request.query.from)
  }

  if (request.query.to) {
    query.where('createdAt', '<=', request.query.to)
  }

  // Sorting
  const sortField = request.query.sort ?? 'createdAt'
  const sortOrder = request.query.order === 'asc' ? 'asc' : 'desc'
  query.orderBy(sortField, sortOrder)

  const posts = await query.paginate(request.query.page ?? 1)

  return Response.json(posts)
}
```

### API Versioning

```typescript
// routes/api.ts
Router.group({ prefix: '/v1' }, () => {
  Router.resource('users', UserControllerV1)
  Router.resource('posts', PostControllerV1)
})

Router.group({ prefix: '/v2' }, () => {
  Router.resource('users', UserControllerV2)
  Router.resource('posts', PostControllerV2)
})
```

## Caching Patterns

### Cache-Aside Pattern

```typescript
async getPopularPosts(): Promise<Post[]> {
  const cacheKey = 'posts:popular'

  // Try cache first
  let posts = await cache.get(cacheKey)

  if (!posts) {
    // Cache miss - fetch from database
    posts = await Post.query()
      .where('published', true)
      .orderBy('views', 'desc')
      .limit(10)
      .get()

    // Store in cache for 1 hour
    await cache.put(cacheKey, posts, 3600)
  }

  return posts
}
```

### Cache Invalidation

```typescript
// app/Models/Post.ts
export default class Post extends Model {
  protected static booted() {
    this.saved(async (post) => {
      await cache.forget(`post:${post.id}`)
      await cache.tags(['posts']).flush()
    })

    this.deleted(async (post) => {
      await cache.forget(`post:${post.id}`)
      await cache.tags(['posts']).flush()
    })
  }
}
```

### Request-Level Caching

```typescript
// Middleware to cache entire responses
export class CacheResponseMiddleware implements Middleware {
  async handle(request: Request, next: Next): Promise<Response> {
    if (request.method !== 'GET') {
      return next(request)
    }

    const cacheKey = `response:${request.url}`
    const cached = await cache.get(cacheKey)

    if (cached) {
      return new Response(cached.body, {
        headers: { ...cached.headers, 'X-Cache': 'HIT' },
      })
    }

    const response = await next(request)

    if (response.status === 200) {
      await cache.put(cacheKey, {
        body: await response.clone().text(),
        headers: Object.fromEntries(response.headers),
      }, 300) // 5 minutes
    }

    response.headers.set('X-Cache', 'MISS')
    return response
  }
}
```
