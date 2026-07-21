---
title: Social Media Integration
description: Integrate social platforms with Stacks.js Socials
---

# Social Media Integration

Stacks.js Socials provides unified APIs for integrating social media platforms including OAuth authentication, content sharing, and social data retrieval.

## Configuration

### Socials Configuration

```typescript
// config/socials.ts
export default {
  // OAuth Providers
  providers: {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackUrl: '/auth/twitter/callback',
      scopes: ['tweet.read', 'tweet.write', 'users.read'],
    },

    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      callbackUrl: '/auth/facebook/callback',
      scopes: ['email', 'public_profile', 'pages_manage_posts'],
    },

    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackUrl: '/auth/instagram/callback',
      scopes: ['user_profile', 'user_media'],
    },

    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackUrl: '/auth/linkedin/callback',
      scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: '/auth/github/callback',
      scopes: ['user', 'repo'],
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: '/auth/google/callback',
      scopes: ['profile', 'email'],
    },

    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackUrl: '/auth/discord/callback',
      scopes: ['identify', 'email'],
    },
  },

  // Share settings
  sharing: {
    defaultImage: '/images/og-default.png',
    defaultHashtags: ['stacksjs'],
  },
}
```

## OAuth Authentication

### Social Login Flow

```typescript
// routes/web.ts
import { Socials } from '@stacksjs/socials'

// Redirect to provider
router.get('/auth/:provider', async (request) => {
  const { provider } = request.params
  const url = await Socials.getAuthUrl(provider)
  return redirect(url)
})

// Handle callback
router.get('/auth/:provider/callback', async (request) => {
  const { provider } = request.params
  const { code, state } = request.query

  try {
    // Exchange code for tokens
    const tokens = await Socials.handleCallback(provider, code, state)

    // Get user profile
    const profile = await Socials.getProfile(provider, tokens.accessToken)

    // Find or create user
    let user = await User.where('email', profile.email).first()

    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      })
    }

    // Store social connection
    await SocialAccount.updateOrCreate(
      { provider, provider_id: profile.id },
      {
        user_id: user.id,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt,
        profile: profile,
      }
    )

    // Log in user
    await Auth.login(user)

    return redirect('/dashboard')
  } catch (error) {
    return redirect('/login?error=oauth_failed')
  }
})
```

### SocialAccount Model

```typescript
// app/Models/SocialAccount.ts
export default class SocialAccount extends Model {
  static fields = {
    user_id: { type: 'foreignId', references: 'users' },
    provider: { type: 'string' }, // twitter, facebook, etc.
    provider_id: { type: 'string' },
    access_token: { type: 'text', encrypted: true },
    refresh_token: { type: 'text', encrypted: true, nullable: true },
    expires_at: { type: 'datetime', nullable: true },
    profile: { type: 'json', default: {} },
  }

  static relationships = {
    user: { type: 'belongsTo', model: 'User' },
  }

  get isExpired() {
    if (!this.expires_at) return false
    return new Date() > this.expires_at
  }

  async refreshTokens() {
    if (!this.refresh_token) {
      throw new Error('No refresh token available')
    }

    const tokens = await Socials.refreshToken(this.provider, this.refresh_token)

    await this.update({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken || this.refresh_token,
      expires_at: tokens.expiresAt,
    })

    return tokens.accessToken
  }
}
```

### Using Social Connections

```typescript
// Get user's connected accounts
const accounts = await user.socialAccounts

// Check if connected to provider
const twitterAccount = accounts.find(a => a.provider === 'twitter')

// Get fresh access token (auto-refresh if needed)
const token = await Socials.getAccessToken(twitterAccount)
```

## Social Sharing

### Share Content

```typescript
import { Share } from '@stacksjs/socials'

// Share to Twitter/X
await Share.toTwitter({
  text: 'Check out this awesome framework!',
  url: 'https://stacksjs.org',
  hashtags: ['stacksjs', 'typescript'],
})

// Share to Facebook
await Share.toFacebook({
  url: 'https://stacksjs.org',
  quote: 'The modern full-stack framework',
})

// Share to LinkedIn
await Share.toLinkedIn({
  url: 'https://stacksjs.org',
  title: 'Stacks.js Framework',
  summary: 'A comprehensive full-stack TypeScript framework',
})

// Share to multiple platforms
await Share.toAll(['twitter', 'facebook', 'linkedin'], {
  url: 'https://stacksjs.org',
  text: 'Check this out!',
})
```

### Share Dialog Component

```stx
<!-- components/ShareDialog.stx -->
<template>
  <x-modal :open="open" @close="$emit('close')">
    <x-modal-header>
      <h2>Share</h2>
    </x-modal-header>

    <x-modal-body>
      <div class="grid grid-cols-4 gap-4">
        <button
          v-for="platform in platforms"
          :key="platform.id"
          @click="share(platform.id)"
          class="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100"
        >
          <x-icon :name="platform.icon" size="lg" :class="platform.color" />
          <span class="mt-2 text-sm">{{ platform.name }}</span>
        </button>
      </div>

      <!-- Copy link -->
      <div class="mt-4 flex gap-2">
        <x-input :value="url" readonly class="flex-1" />
        <x-button @click="copyLink">Copy</x-button>
      </div>
    </x-modal-body>
  </x-modal>
</template>

<script>
export default {
  props: {
    open: Boolean,
    url: String,
    title: String,
    text: String,
  },

  data() {
    return {
      platforms: [
        { id: 'twitter', name: 'Twitter', icon: 'twitter', color: 'text-blue-400' },
        { id: 'facebook', name: 'Facebook', icon: 'facebook', color: 'text-blue-600' },
        { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: 'text-blue-700' },
        { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', color: 'text-green-500' },
        { id: 'telegram', name: 'Telegram', icon: 'telegram', color: 'text-blue-500' },
        { id: 'email', name: 'Email', icon: 'mail', color: 'text-gray-600' },
      ],
    }
  },

  methods: {
    async share(platform) {
      await Share.to(platform, {
        url: this.url,
        text: this.text,
        title: this.title,
      })
      this.$emit('shared', platform)
    },

    async copyLink() {
      await navigator.clipboard.writeText(this.url)
      Toast.success('Link copied!')
    },
  },
}
</script>
```

### Native Share API

```typescript
// Use native share if available
if (Share.isNativeSupported()) {
  await Share.native({
    title: 'Check this out',
    text: 'Amazing framework for TypeScript',
    url: 'https://stacksjs.org',
  })
} else {
  // Fall back to share dialog
  showShareDialog()
}
```

## Platform APIs

### Twitter/X

```typescript
import { Twitter } from '@stacksjs/socials'

// Initialize with user's token
const twitter = Twitter.forUser(socialAccount)

// Post tweet
const tweet = await twitter.tweet({
  text: 'Hello from Stacks.js!',
  media: [{ type: 'image', data: imageBuffer }],
})

// Get user timeline
const timeline = await twitter.getTimeline({ limit: 20 })

// Get user profile
const profile = await twitter.getProfile()

// Search tweets
const results = await twitter.search('#stacksjs', { limit: 50 })

// Follow user
await twitter.follow('stacksjs')

// Get followers
const followers = await twitter.getFollowers({ limit: 100 })
```

### Facebook

```typescript
import { Facebook } from '@stacksjs/socials'

const facebook = Facebook.forUser(socialAccount)

// Post to feed
await facebook.post({
  message: 'Check out Stacks.js!',
  link: 'https://stacksjs.org',
})

// Post to page (if page admin)
await facebook.postToPage(pageId, {
  message: 'New update!',
})

// Get user's posts
const posts = await facebook.getPosts({ limit: 20 })

// Get page insights
const insights = await facebook.getPageInsights(pageId, {
  metrics: ['page_views', 'page_engaged_users'],
  period: 'week',
})
```

### Instagram

```typescript
import { Instagram } from '@stacksjs/socials'

const instagram = Instagram.forUser(socialAccount)

// Get user's media
const media = await instagram.getMedia({ limit: 20 })

// Get profile info
const profile = await instagram.getProfile()

// Post to Instagram (Business/Creator accounts)
await instagram.post({
  image: imageUrl,
  caption: 'Posted via Stacks.js! #webdev',
})
```

### LinkedIn

```typescript
import { LinkedIn } from '@stacksjs/socials'

const linkedin = LinkedIn.forUser(socialAccount)

// Share post
await linkedin.share({
  text: 'Excited to share our new framework!',
  url: 'https://stacksjs.org',
})

// Get profile
const profile = await linkedin.getProfile()

// Get connections count
const connections = await linkedin.getConnectionsCount()
```

### GitHub

```typescript
import { GitHub } from '@stacksjs/socials'

const github = GitHub.forUser(socialAccount)

// Get user info
const user = await github.getUser()

// Get repositories
const repos = await github.getRepos({ sort: 'updated' })

// Star a repository
await github.starRepo('stacksjs/stacks')

// Get repository
const repo = await github.getRepo('stacksjs', 'stacks')

// Create issue
await github.createIssue('stacksjs', 'stacks', {
  title: 'Bug Report',
  body: 'Description of the bug...',
})
```

## Social Embeds

### Embed Posts

```stx
<!-- Embed Twitter post -->
<x-social-embed
  platform="twitter"
  url="https://twitter.com/stacksjs/status/123456789"
/>

<!-- Embed Instagram post -->
<x-social-embed
  platform="instagram"
  url="https://www.instagram.com/p/ABC123/"
/>

<!-- Embed YouTube video -->
<x-social-embed
  platform="youtube"
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  :autoplay="false"
/>
```

### OEmbed Support

```typescript
import { OEmbed } from '@stacksjs/socials'

// Get embed data for URL
const embed = await OEmbed.get('https://twitter.com/stacksjs/status/123456789')

// {
//   type: 'rich',
//   html: '<blockquote>...</blockquote>',
//   width: 550,
//   height: null,
//   provider: 'Twitter',
// }
```

## Webhooks

### Handle Social Webhooks

```typescript
// routes/api.ts
router.post('/webhooks/twitter', async (request) => {
  const signature = request.headers.get('x-twitter-webhooks-signature')
  const payload = request.body

  // Verify webhook
  if (!Twitter.verifyWebhook(signature, payload)) {
    return response(401)
  }

  // Handle events
  for (const event of payload.events) {
    switch (event.type) {
      case 'tweet_create':
        await handleNewMention(event.data)
        break
      case 'follow':
        await handleNewFollower(event.data)
        break
      case 'direct_message':
        await handleDM(event.data)
        break
    }
  }

  return { received: true }
})
```

### Subscribe to Webhooks

```typescript
// Register webhook endpoint
await Twitter.registerWebhook('https://myapp.com/webhooks/twitter')

// Subscribe user to webhook events
await Twitter.subscribeToWebhooks(socialAccount.accessToken)
```

## Social Feed Aggregation

### Aggregate Multiple Feeds

```typescript
import { SocialFeed } from '@stacksjs/socials'

// Get aggregated feed from all connected accounts
const feed = await SocialFeed.aggregate(user, {
  platforms: ['twitter', 'facebook', 'instagram'],
  limit: 50,
  since: dayjs().subtract(7, 'days'),
})

// Returns unified format
// [
//   { platform: 'twitter', type: 'post', content: '...', createdAt: '...' },
//   { platform: 'facebook', type: 'post', content: '...', createdAt: '...' },
//   ...
// ]
```

## Social Analytics

### Track Social Metrics

```typescript
import { SocialAnalytics } from '@stacksjs/socials'

// Get engagement metrics
const metrics = await SocialAnalytics.getMetrics(user, {
  platforms: ['twitter', 'facebook'],
  period: 'month',
})

// {
//   twitter: { followers: 1500, following: 200, tweets: 50, likes: 300 },
//   facebook: { friends: 500, posts: 20, reactions: 150 },
// }

// Track growth over time
const growth = await SocialAnalytics.getGrowth(user, {
  metric: 'followers',
  period: 'month',
  interval: 'day',
})

// [
//   { date: '2024-01-01', twitter: 1400, facebook: 480 },
//   { date: '2024-01-02', twitter: 1420, facebook: 485 },
//   ...
// ]
```

## Social Login Buttons

```stx
<!-- components/SocialLoginButtons.stx -->
<template>
  <div class="flex flex-col gap-3">
    <x-button
      variant="outline"
      @click="login('google')"
      class="flex items-center justify-center gap-2"
    >
      <x-icon name="google" />
      Continue with Google
    </x-button>

    <x-button
      variant="outline"
      @click="login('github')"
      class="flex items-center justify-center gap-2"
    >
      <x-icon name="github" />
      Continue with GitHub
    </x-button>

    <x-button
      variant="outline"
      @click="login('twitter')"
      class="flex items-center justify-center gap-2"
    >
      <x-icon name="twitter" />
      Continue with Twitter
    </x-button>
  </div>
</template>

<script>
export default {
  methods: {
    login(provider) {
      window.location.href = `/auth/${provider}`
    },
  },
}
</script>
```
