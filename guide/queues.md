---
title: Queues & Background Jobs
description: Background processing, workers, job retries, and failed job handling in Stacks.js
---

# Queues & Background Jobs

Stacks.js Queue provides a robust background job processing system powered by bun-queue (Redis-backed), optimized for Bun's performance.

> **Protocol context** — This guide covers the **Stacks.js reference implementation**. The behavior it relies on is specified by **the Queues & Scheduling contract** in the [Stacks Protocol white paper](/) (§7.1), so these concepts transfer to any conformant implementation — the specific APIs shown here are TypeScript/Bun.

## Overview

Queues allow you to defer time-consuming tasks—sending emails, processing uploads, generating reports—to background workers, keeping your application responsive.

```typescript
// Dispatch a job to run in the background
await Queue.dispatch(new SendWelcomeEmail(user))

// Your controller returns immediately
return response({ message: 'User created!' })
```

## Configuration

### Queue Configuration

```typescript
// config/queue.ts
export default {
  // Default queue connection
  default: 'database',

  // Queue connections
  connections: {
    // Database-backed queue (simple, no extra infrastructure)
    database: {
      driver: 'database',
      table: 'jobs',
      queue: 'default',
      retryAfter: 90, // seconds
    },

    // Redis-backed queue (high performance)
    redis: {
      driver: 'redis',
      connection: 'queue',
      queue: 'default',
      retryAfter: 90,
      blockFor: 5,
    },

    // In-memory queue (development only)
    sync: {
      driver: 'sync',
    },
  },

  // Failed job handling
  failed: {
    driver: 'database',
    table: 'failed_jobs',
  },

  // Job batching
  batching: {
    driver: 'database',
    table: 'job_batches',
  },
}
```

### Database Setup

```bash
# Create queue tables
buddy make:migration create_jobs_table
buddy make:migration create_failed_jobs_table
buddy make:migration create_job_batches_table

# Run migrations
buddy migrate
```

```typescript
// migrations/create_jobs_table.ts
export default {
  async up(schema) {
    await schema.create('jobs', (table) => {
      table.bigIncrements('id')
      table.string('queue').index()
      table.longText('payload')
      table.unsignedTinyInteger('attempts')
      table.unsignedInteger('reserved_at').nullable()
      table.unsignedInteger('available_at')
      table.unsignedInteger('created_at')
    })
  },
}
```

## Creating Jobs

### Generate a Job

```bash
buddy make:job SendWelcomeEmail
buddy make:job ProcessVideoUpload
buddy make:job GenerateReport
```

### Job Structure

```typescript
// app/Jobs/SendWelcomeEmail.ts
import { Job } from '@stacksjs/queue'
import { Mail } from '@stacksjs/email'
import type { User } from '@/Models/User'

export default class SendWelcomeEmail extends Job {
  // Job configuration
  static queue = 'emails'
  static tries = 3
  static timeout = 60 // seconds
  static backoff = [10, 60, 300] // seconds between retries

  // Job data
  constructor(public user: User) {
    super()
  }

  // Job handler
  async handle() {
    await Mail
      .to(this.user.email)
      .send(new WelcomeEmail(this.user))

    Log.info('Welcome email sent', { userId: this.user.id })
  }

  // Called if job fails after all retries
  async failed(error: Error) {
    Log.error('Welcome email failed', {
      userId: this.user.id,
      error: error.message,
    })

    // Notify admins
    await Notification.send(
      new JobFailedNotification(this, error)
    ).to('admin@example.com')
  }
}
```

### Job Options

```typescript
export default class ProcessVideoUpload extends Job {
  // Queue name
  static queue = 'video-processing'

  // Number of retry attempts
  static tries = 5

  // Maximum execution time (seconds)
  static timeout = 600 // 10 minutes

  // Delay before first attempt (seconds)
  static delay = 0

  // Backoff strategy for retries
  static backoff = [30, 60, 120, 300, 600]

  // Make job unique (prevent duplicates)
  static unique = true
  static uniqueFor = 3600 // seconds

  // Rate limiting
  static rateLimit = {
    maxAttempts: 10,
    decayMinutes: 1,
  }

  constructor(
    public videoId: number,
    public format: string,
  ) {
    super()
  }

  // Unique identifier for deduplication
  uniqueId() {
    return `video-${this.videoId}-${this.format}`
  }

  async handle() {
    const video = await Video.find(this.videoId)
    await VideoProcessor.transcode(video, this.format)
  }

  // Determine if job should retry
  shouldRetry(error: Error, attempt: number) {
    // Don't retry on validation errors
    if (error instanceof ValidationError) {
      return false
    }
    return attempt < 5
  }

  // Custom backoff calculation
  retryAfter(attempt: number) {
    return Math.pow(2, attempt) * 30 // Exponential backoff
  }
}
```

## Dispatching Jobs

### Basic Dispatching

```typescript
import { Queue } from '@stacksjs/queue'
import { SendWelcomeEmail } from '@/Jobs/SendWelcomeEmail'

// Dispatch job to default queue
await Queue.dispatch(new SendWelcomeEmail(user))

// Dispatch to specific queue
await Queue.dispatch(new SendWelcomeEmail(user)).onQueue('emails')

// Dispatch with delay
await Queue.dispatch(new SendWelcomeEmail(user)).delay(60) // 60 seconds

// Dispatch at specific time
await Queue.dispatch(new SendWelcomeEmail(user)).at(
  dayjs().add(1, 'hour').toDate()
)
```

### Dispatch Chains

```typescript
// Jobs run sequentially, stopping on failure
await Queue.chain([
  new ProcessVideoUpload(video.id, '1080p'),
  new ProcessVideoUpload(video.id, '720p'),
  new ProcessVideoUpload(video.id, '480p'),
  new NotifyVideoReady(video.id),
]).dispatch()

// With error handling
await Queue.chain([
  new Step1(),
  new Step2(),
  new Step3(),
]).catch(new CleanupOnFailure()).dispatch()
```

### Job Batches

```typescript
import { Queue, Batch } from '@stacksjs/queue'

// Create a batch of jobs
const batch = await Queue.batch([
  new ProcessImage(image1.id),
  new ProcessImage(image2.id),
  new ProcessImage(image3.id),
  new ProcessImage(image4.id),
])
  .name('Process Gallery Images')
  .allowFailures() // Continue even if some jobs fail
  .then(async (batch) => {
    // All jobs completed successfully
    await Notification.send('Batch completed!')
  })
  .catch(async (batch, error) => {
    // A job failed (only called if allowFailures is false)
    await Notification.send('Batch failed!')
  })
  .finally(async (batch) => {
    // Always called when batch finishes
    await cleanup(batch.id)
  })
  .dispatch()

// Check batch status
const status = await Queue.batch(batch.id)
console.log(status.progress) // 75
console.log(status.processedJobs) // 3
console.log(status.failedJobs) // 0
console.log(status.pendingJobs) // 1

// Add jobs to existing batch
await Queue.batch(batch.id).add([
  new ProcessImage(image5.id),
])

// Cancel batch
await Queue.batch(batch.id).cancel()
```

### Conditional Dispatching

```typescript
// Dispatch only if condition is true
await Queue.dispatchIf(
  user.preferences.sendEmails,
  new SendWelcomeEmail(user)
)

// Dispatch unless condition is true
await Queue.dispatchUnless(
  user.isBot,
  new TrackUserActivity(user)
)
```

## Running Workers

### Start Workers

```bash
# Start default worker
buddy queue:work

# Work specific queue
buddy queue:work --queue=emails

# Work multiple queues (priority order)
buddy queue:work --queue=high,default,low

# Specify connection
buddy queue:work --connection=redis

# Process single job and exit
buddy queue:work --once

# Stop after queue is empty
buddy queue:work --stop-when-empty

# Limit memory usage
buddy queue:work --memory=512

# Set sleep time when no jobs
buddy queue:work --sleep=3

# Set number of seconds before killing job
buddy queue:work --timeout=60

# Process N jobs before stopping
buddy queue:work --max-jobs=100

# Stop after N seconds
buddy queue:work --max-time=3600
```

### Worker Configuration

```typescript
// config/queue.ts
export default {
  worker: {
    // Sleep between jobs when queue is empty
    sleep: 3,

    // Timeout for each job
    timeout: 60,

    // Memory limit (MB)
    memory: 128,

    // Stop worker after processing N jobs (for memory leaks)
    maxJobs: 1000,

    // Graceful shutdown timeout
    shutdownTimeout: 30,
  },
}
```

### Supervisor Configuration

```ini
# /etc/supervisor/conf.d/stacks-worker.conf
[program:stacks-worker]
process_name=%(program_name)s_%(process_num)02d
command=buddy queue:work --queue=high,default,low --sleep=3 --tries=3
directory=/var/www/myapp
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/var/log/stacks/worker.log
stopwaitsecs=30
```

### Horizontal Scaling

```typescript
// Run workers for different queues on different servers

// Server 1: High priority jobs
// buddy queue:work --queue=high

// Server 2-3: Default jobs
// buddy queue:work --queue=default

// Server 4: Low priority, batch jobs
// buddy queue:work --queue=low,batch
```

## Job Middleware

### Create Middleware

```typescript
// app/Jobs/Middleware/RateLimited.ts
import { JobMiddleware } from '@stacksjs/queue'

export class RateLimited implements JobMiddleware {
  constructor(
    public maxAttempts: number = 10,
    public decayMinutes: number = 1,
  ) {}

  async handle(job: Job, next: () => Promise<void>) {
    const key = `job-rate-limit:${job.constructor.name}`

    if (await RateLimiter.tooManyAttempts(key, this.maxAttempts)) {
      // Release job back to queue with delay
      await job.release(this.decayMinutes * 60)
      return
    }

    await RateLimiter.hit(key, this.decayMinutes * 60)
    await next()
  }
}
```

### Apply Middleware

```typescript
export default class SendBulkEmails extends Job {
  // Apply middleware
  static middleware = [
    new RateLimited(100, 1), // 100 per minute
    new WithoutOverlapping(),
  ]

  async handle() {
    // ...
  }
}
```

### Built-in Middleware

```typescript
import {
  RateLimited,
  WithoutOverlapping,
  ThrottlesExceptions,
  Skip,
} from '@stacksjs/queue/middleware'

export default class MyJob extends Job {
  static middleware = [
    // Rate limit job processing
    new RateLimited(maxAttempts: 10, decayMinutes: 1),

    // Prevent overlapping jobs with same key
    new WithoutOverlapping('my-unique-key', releaseAfter: 60),

    // Throttle when exceptions occur
    new ThrottlesExceptions(maxAttempts: 3, retryAfterMinutes: 5),

    // Skip job based on condition
    new Skip((job) => job.user.isDeleted),
  ]
}
```

## Failed Jobs

### Handling Failures

```typescript
export default class ImportUsers extends Job {
  static tries = 3

  async handle() {
    await this.processImport()
  }

  // Called when job fails
  async failed(error: Error) {
    // Log failure
    Log.error('Import failed', {
      error: error.message,
      stack: error.stack,
    })

    // Notify admins
    await Mail.to('admin@example.com').send(
      new ImportFailedEmail(this, error)
    )

    // Clean up partial imports
    await this.cleanup()
  }

  // Determine if exception should be reported
  shouldReport(error: Error) {
    // Don't report validation errors
    return !(error instanceof ValidationError)
  }
}
```

### Managing Failed Jobs

```bash
# List failed jobs
buddy queue:failed

# Retry a specific failed job
buddy queue:retry 5

# Retry all failed jobs
buddy queue:retry all

# Retry jobs from specific queue
buddy queue:retry --queue=emails

# Delete a failed job
buddy queue:forget 5

# Delete all failed jobs
buddy queue:flush
```

### Programmatic Failed Job Management

```typescript
import { FailedJobs } from '@stacksjs/queue'

// Get all failed jobs
const failed = await FailedJobs.all()

// Get failed jobs for specific queue
const emailFailures = await FailedJobs.where('queue', 'emails').get()

// Retry a failed job
await FailedJobs.retry(5)

// Retry all
await FailedJobs.retryAll()

// Delete
await FailedJobs.delete(5)

// Prune old failures
await FailedJobs.prune(days: 7)
```

## Job Events

### Listen to Job Events

```typescript
// app/Providers/QueueServiceProvider.ts
import { Queue } from '@stacksjs/queue'

Queue.on('jobProcessing', (job) => {
  Log.info('Processing job', { job: job.name })
})

Queue.on('jobProcessed', (job) => {
  Log.info('Job completed', { job: job.name, duration: job.duration })
})

Queue.on('jobFailed', (job, error) => {
  Log.error('Job failed', { job: job.name, error: error.message })
})

Queue.on('jobRetrying', (job, error) => {
  Log.warning('Job retrying', { job: job.name, attempt: job.attempts })
})

// Worker events
Queue.on('workerStarting', (worker) => {
  Log.info('Worker starting', { queues: worker.queues })
})

Queue.on('workerStopping', (worker) => {
  Log.info('Worker stopping')
})
```

## Monitoring

### Queue Dashboard

```typescript
// Access via Dashboard
// /dashboard/queues

// Or programmatically
import { QueueMonitor } from '@stacksjs/queue'

const stats = await QueueMonitor.stats()
// {
//   pending: 150,
//   processing: 5,
//   completed: 10000,
//   failed: 23,
//   queues: {
//     default: { pending: 100, processing: 3 },
//     emails: { pending: 50, processing: 2 },
//   }
// }

// Get throughput
const throughput = await QueueMonitor.throughput('1h')
// { processed: 500, failed: 2, avgDuration: 1.5 }

// Get slow jobs
const slowJobs = await QueueMonitor.slowJobs({ threshold: 30 })
```

### Health Checks

```typescript
// config/health.ts
export default {
  checks: [
    {
      name: 'queue',
      check: async () => {
        const pending = await Queue.size('default')
        return {
          healthy: pending < 10000,
          pending,
          message: pending > 10000 ? 'Queue backlog too large' : 'OK',
        }
      },
    },
    {
      name: 'queue-workers',
      check: async () => {
        const workers = await Queue.workers()
        return {
          healthy: workers.length > 0,
          workers: workers.length,
        }
      },
    },
  ],
}
```

## Testing

### Testing Jobs

```typescript
import { Queue, Job } from '@stacksjs/queue'
import { SendWelcomeEmail } from '@/Jobs/SendWelcomeEmail'

describe('SendWelcomeEmail', () => {
  beforeEach(() => {
    // Use sync driver for tests
    Queue.fake()
  })

  it('sends welcome email', async () => {
    const user = await User.factory().create()

    await Queue.dispatch(new SendWelcomeEmail(user))

    // Assert job was dispatched
    Queue.assertPushed(SendWelcomeEmail)

    // Assert with callback
    Queue.assertPushed(SendWelcomeEmail, (job) => {
      return job.user.id === user.id
    })
  })

  it('dispatches to correct queue', async () => {
    const user = await User.factory().create()

    await Queue.dispatch(new SendWelcomeEmail(user))

    Queue.assertPushedOn('emails', SendWelcomeEmail)
  })

  it('respects delay', async () => {
    const user = await User.factory().create()

    await Queue.dispatch(new SendWelcomeEmail(user)).delay(60)

    Queue.assertPushedWithDelay(SendWelcomeEmail, 60)
  })

  it('handles job execution', async () => {
    const user = await User.factory().create()
    const job = new SendWelcomeEmail(user)

    // Actually run the job
    await job.handle()

    // Assert email was sent
    Mail.assertSent(WelcomeEmail)
  })
})
```

### Testing Batches

```typescript
it('processes batch correctly', async () => {
  Queue.fake()

  const images = await Image.factory().count(3).create()

  await Queue.batch(
    images.map(img => new ProcessImage(img.id))
  ).dispatch()

  Queue.assertBatched((batch) => {
    return batch.jobs.length === 3
  })
})
```

## Cron Scheduler

Schedule recurring jobs using cron expressions:

```typescript
import { Queue, CronScheduler } from '@stacksjs/queue'

const queue = new Queue('scheduled-tasks')
const cron = new CronScheduler(queue)

// Schedule daily report at 8 AM
await cron.schedule({
  cronExpression: '0 8 * * *',       // minute hour dayOfMonth month dayOfWeek
  timezone: 'America/New_York',
  data: { type: 'daily-report' },
  jobId: 'daily-report',
})

// Schedule weekly cleanup on Sundays at midnight
await cron.schedule({
  cronExpression: '0 0 * * 0',
  data: { type: 'weekly-cleanup' },
  limit: 52,                          // Run max 52 times (1 year)
  startDate: new Date(),
  endDate: new Date('2025-12-31'),
})

// Schedule every 15 minutes during business hours
await cron.schedule({
  cronExpression: '*/15 9-17 * * 1-5', // Every 15 min, 9-5, Mon-Fri
  data: { type: 'sync-inventory' },
})

// Unschedule a job
await cron.unschedule('daily-report')
```

### Cron Expression Format

| Field | Values | Wildcards |
|-------|--------|-----------|
| Minute | 0-59 | `*`, `*/n`, `n-m`, `n,m` |
| Hour | 0-23 | `*`, `*/n`, `n-m`, `n,m` |
| Day of Month | 1-31 | `*`, `*/n`, `n-m`, `n,m` |
| Month | 1-12 | `*`, `*/n`, `n-m`, `n,m` |
| Day of Week | 0-6 (0=Sunday) | `*`, `*/n`, `n-m`, `n,m` |

Examples:
- `0 0 * * *` - Daily at midnight
- `*/5 * * * *` - Every 5 minutes
- `0 9-17 * * 1-5` - Hourly 9 AM-5 PM, weekdays
- `0 0 1 * *` - First of every month

## Dead Letter Queue

Automatically move jobs that fail repeatedly to a dead letter queue for manual inspection:

```typescript
import { Queue, DeadLetterQueue } from '@stacksjs/queue'

const queue = new Queue('orders', {
  defaultDeadLetterOptions: {
    enabled: true,
    queueSuffix: '-dead-letter',     // Creates 'orders-dead-letter'
    maxRetries: 3,                    // Move after 3 failures
    removeFromOriginalQueue: true,
  },
})

// Or enable per-job
await queue.add(
  { orderId: 123 },
  {
    attempts: 3,
    deadLetter: true,  // Use default dead letter options
  }
)

// Custom dead letter options per-job
await queue.add(
  { orderId: 456 },
  {
    attempts: 5,
    deadLetter: {
      queueSuffix: '-critical-failures',
      maxRetries: 5,
    },
  }
)
```

### Managing Dead Letter Jobs

```typescript
const dlq = new DeadLetterQueue(queue)

// Get all dead letter jobs
const deadJobs = await dlq.getJobs()

// Republish a job back to the original queue
await dlq.republishJob('job-id', { resetRetries: true })

// Remove a job from dead letter queue
await dlq.removeJob('job-id')

// Clear entire dead letter queue
await dlq.clear()

// Listen for dead letter events
queue.on('jobMovedToDeadLetter', (jobId, queueName, reason) => {
  Log.error('Job moved to dead letter', { jobId, queueName, reason })
  notifyOncall()
})

queue.on('jobRepublishedFromDeadLetter', (jobId, originalQueue) => {
  Log.info('Job republished', { jobId, originalQueue })
})
```

## Priority Queues

Process high-priority jobs before lower-priority ones:

```typescript
import { Queue } from '@stacksjs/queue'

const queue = new Queue('tasks', {
  priorityLevels: 10,     // Support 0-9 priority levels
  defaultPriority: 5,     // Default priority level
})

// Add jobs with different priorities
await queue.add(
  { task: 'critical-alert' },
  { priority: 9 }  // Highest priority (processed first)
)

await queue.add(
  { task: 'normal-task' },
  { priority: 5 }  // Normal priority
)

await queue.add(
  { task: 'background-cleanup' },
  { priority: 1 }  // Low priority (processed last)
)

// Priority order: 9 > 5 > 1
// Higher number = higher priority = processed sooner
```

## Job Dependencies

Create jobs that wait for other jobs to complete:

```typescript
// Job B depends on Job A completing first
const jobA = await queue.add(
  { step: 'prepare-data' },
  { jobId: 'job-a' }
)

const jobB = await queue.add(
  { step: 'process-data' },
  {
    jobId: 'job-b',
    dependsOn: 'job-a',  // Wait for job-a to complete
  }
)

// Multiple dependencies
const jobC = await queue.add(
  { step: 'combine-results' },
  {
    jobId: 'job-c',
    dependsOn: ['job-a', 'job-b'],  // Wait for both
  }
)
```

## Horizontal Scaling

Scale queue workers across multiple instances with automatic coordination:

```typescript
import { Queue } from '@stacksjs/queue'

const queue = new Queue('distributed-tasks', {
  horizontalScaling: {
    enabled: true,
    instanceId: process.env.INSTANCE_ID || 'worker-1',
    maxWorkersPerInstance: 4,
    jobsPerWorker: 100,

    // Leader election for coordination tasks
    leaderElection: {
      heartbeatInterval: 5000,    // 5 seconds
      leaderTimeout: 15000,       // 15 seconds to detect leader failure
    },

    // Work coordination across instances
    workCoordination: {
      pollInterval: 1000,
      keyPrefix: 'distributed:',
    },
  },
})

// The leader instance handles:
// - Stalled job detection and recovery
// - Scheduled job promotion
// - Dead letter queue processing
// - Queue metrics aggregation

// Worker events
queue.on('leaderElected', (instanceId) => {
  Log.info(`Instance ${instanceId} elected as leader`)
})

queue.on('leaderLost', () => {
  Log.warning('Leader election starting...')
})
```

## Job Groups

Organize related jobs into groups with shared limits:

```typescript
import { Queue, JobGroup } from '@stacksjs/queue'

const queue = new Queue('api-calls')

// Create a group with concurrency limit
const apiGroup = new JobGroup(queue, {
  name: 'external-api',
  maxConcurrency: 5,     // Max 5 concurrent jobs in this group
  limit: 1000,           // Max 1000 jobs total
})

// Add jobs to the group
await apiGroup.add({ endpoint: '/users' })
await apiGroup.add({ endpoint: '/orders' })

// Group events
queue.on('groupCreated', (groupName) => {
  Log.info(`Group ${groupName} created`)
})
```

## Stalled Job Recovery

Automatically detect and retry jobs that stall (worker crashes mid-processing):

```typescript
const queue = new Queue('important-tasks', {
  stalledJobCheckInterval: 30000,   // Check every 30 seconds
  maxStalledJobRetries: 3,          // Retry stalled jobs 3 times
})

// Listen for stalled jobs
queue.on('jobStalled', (jobId) => {
  Log.warning(`Job ${jobId} stalled, will be retried`)
})
```

## Queue Devtools

Monitor queues with the built-in devtools dashboard:

```bash
# Start devtools server
buddy queue:devtools --port 3001
```

Access at `http://localhost:3001` for:
- Real-time queue metrics
- Job inspection and management
- Failed job retry/removal
- Worker status monitoring
- Dead letter queue management

## Best Practices

### Job Design

```typescript
// DO: Keep jobs small and focused
class SendWelcomeEmail extends Job {
  async handle() {
    await Mail.to(this.user.email).send(new WelcomeEmail(this.user))
  }
}

// DON'T: Do too much in one job
class ProcessUserRegistration extends Job {
  async handle() {
    // Too many things - split into separate jobs
    await sendEmail()
    await updateAnalytics()
    await syncToCRM()
    await generateReports()
  }
}

// DO: Use job chaining instead
await Queue.chain([
  new SendWelcomeEmail(user),
  new SyncToCRM(user),
  new UpdateAnalytics('registration', user),
]).dispatch()
```

### Idempotency

```typescript
// Make jobs idempotent (safe to run multiple times)
class ChargeCustomer extends Job {
  static unique = true

  uniqueId() {
    return `charge-${this.orderId}`
  }

  async handle() {
    // Check if already processed
    const order = await Order.find(this.orderId)
    if (order.isPaid) {
      return // Already charged, skip
    }

    await PaymentGateway.charge(order)
    await order.update({ isPaid: true })
  }
}
```

### Graceful Degradation

```typescript
class ProcessWebhook extends Job {
  static tries = 5
  static backoff = [60, 300, 900, 3600, 86400]

  async handle() {
    try {
      await ExternalAPI.process(this.payload)
    } catch (error) {
      if (error.isRetryable) {
        throw error // Will retry
      }
      // Log and continue for non-retryable errors
      Log.warning('Non-retryable webhook error', { error })
    }
  }
}
```
