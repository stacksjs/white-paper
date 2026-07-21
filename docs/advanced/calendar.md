---
title: Calendar & Scheduling
description: Build calendar features and scheduling systems with Stacks.js
---

# Calendar & Scheduling

Stacks.js Calendar provides comprehensive tools for building calendar applications, scheduling systems, and time-based features.

## Configuration

### Calendar Configuration

```typescript
// config/calendar.ts
export default {
  // Default timezone
  timezone: 'UTC',

  // Week start day (0 = Sunday, 1 = Monday)
  weekStartsOn: 1,

  // Working hours
  workingHours: {
    start: '09:00',
    end: '17:00',
    days: [1, 2, 3, 4, 5], // Mon-Fri
  },

  // Booking settings
  booking: {
    minAdvance: 60, // Minutes before event can be booked
    maxAdvance: 90, // Days in advance
    bufferTime: 15, // Minutes between bookings
    slotDuration: 30, // Default slot duration in minutes
  },

  // Integrations
  integrations: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    outlook: {
      enabled: true,
      clientId: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    },
    apple: {
      enabled: true,
    },
  },

  // Reminders
  reminders: {
    enabled: true,
    default: [
      { type: 'email', before: 1440 }, // 24 hours
      { type: 'email', before: 60 },   // 1 hour
    ],
  },
}
```

## Event Model

### Event Schema

```typescript
// app/Models/Event.ts
import { Model } from '@stacksjs/orm'

export default class Event extends Model {
  static fields = {
    title: { type: 'string', required: true },
    description: { type: 'text', nullable: true },
    location: { type: 'string', nullable: true },
    start_at: { type: 'datetime', required: true },
    end_at: { type: 'datetime', required: true },
    all_day: { type: 'boolean', default: false },
    timezone: { type: 'string', default: 'UTC' },
    recurrence_rule: { type: 'string', nullable: true }, // RRULE format
    color: { type: 'string', nullable: true },
    status: { type: 'enum', values: ['confirmed', 'tentative', 'cancelled'], default: 'confirmed' },
    visibility: { type: 'enum', values: ['public', 'private'], default: 'public' },
    busy: { type: 'boolean', default: true },
    organizer_id: { type: 'foreignId', references: 'users' },
    calendar_id: { type: 'foreignId', references: 'calendars' },
    metadata: { type: 'json', default: {} },
  }

  static relationships = {
    organizer: { type: 'belongsTo', model: 'User' },
    calendar: { type: 'belongsTo', model: 'Calendar' },
    attendees: { type: 'hasMany', model: 'EventAttendee' },
    reminders: { type: 'hasMany', model: 'EventReminder' },
  }

  // Check if event spans multiple days
  get isMultiDay() {
    return !dayjs(this.start_at).isSame(this.end_at, 'day')
  }

  // Get duration in minutes
  get duration() {
    return dayjs(this.end_at).diff(this.start_at, 'minute')
  }

  // Check if recurring
  get isRecurring() {
    return this.recurrence_rule !== null
  }
}
```

### Calendar Model

```typescript
// app/Models/Calendar.ts
export default class Calendar extends Model {
  static fields = {
    name: { type: 'string', required: true },
    color: { type: 'string', default: '#3B82F6' },
    user_id: { type: 'foreignId', references: 'users' },
    type: { type: 'enum', values: ['personal', 'work', 'shared'], default: 'personal' },
    is_default: { type: 'boolean', default: false },
    external_id: { type: 'string', nullable: true }, // For synced calendars
    external_provider: { type: 'string', nullable: true },
    sync_token: { type: 'string', nullable: true },
  }

  static relationships = {
    user: { type: 'belongsTo', model: 'User' },
    events: { type: 'hasMany', model: 'Event' },
    shares: { type: 'hasMany', model: 'CalendarShare' },
  }
}
```

## Calendar Service

### Fetching Events

```typescript
import { Calendar } from '@stacksjs/calendar'

// Get events for date range
const events = await Calendar.getEvents({
  from: dayjs().startOf('month'),
  to: dayjs().endOf('month'),
  calendars: [calendarId],
  includeRecurring: true,
})

// Get single event
const event = await Calendar.getEvent(eventId)

// Get events for a specific day
const dayEvents = await Calendar.getEventsForDay(new Date())

// Get user's agenda
const agenda = await Calendar.getAgenda(userId, {
  from: dayjs(),
  to: dayjs().add(7, 'days'),
})
```

### Creating Events

```typescript
// Create simple event
const event = await Calendar.createEvent({
  title: 'Team Meeting',
  start_at: dayjs().hour(10).minute(0),
  end_at: dayjs().hour(11).minute(0),
  calendar_id: calendarId,
  organizer_id: userId,
})

// Create all-day event
const allDayEvent = await Calendar.createEvent({
  title: 'Company Holiday',
  start_at: dayjs('2024-12-25'),
  end_at: dayjs('2024-12-25'),
  all_day: true,
  calendar_id: calendarId,
})

// Create event with attendees
const meetingEvent = await Calendar.createEvent({
  title: 'Project Kickoff',
  start_at: dayjs().add(1, 'day').hour(14),
  end_at: dayjs().add(1, 'day').hour(15),
  location: 'Conference Room A',
  description: 'Initial project planning meeting',
  attendees: [
    { email: 'john@example.com', status: 'pending' },
    { email: 'jane@example.com', status: 'pending' },
  ],
  reminders: [
    { type: 'email', before: 1440 }, // 24 hours
    { type: 'push', before: 30 },    // 30 minutes
  ],
})
```

### Recurring Events

```typescript
import { RRule } from '@stacksjs/calendar'

// Daily standup
const dailyEvent = await Calendar.createEvent({
  title: 'Daily Standup',
  start_at: dayjs().hour(9).minute(0),
  end_at: dayjs().hour(9).minute(15),
  recurrence_rule: RRule.daily({
    interval: 1,
    weekdays: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
    until: dayjs().add(3, 'months'),
  }),
})

// Weekly team meeting
const weeklyEvent = await Calendar.createEvent({
  title: 'Team Sync',
  start_at: dayjs().day(1).hour(10), // Monday 10am
  end_at: dayjs().day(1).hour(11),
  recurrence_rule: RRule.weekly({
    interval: 1,
    byday: [RRule.MO],
  }),
})

// Monthly review
const monthlyEvent = await Calendar.createEvent({
  title: 'Monthly Review',
  start_at: dayjs().date(1).hour(14), // 1st of month
  end_at: dayjs().date(1).hour(16),
  recurrence_rule: RRule.monthly({
    interval: 1,
    bymonthday: 1,
  }),
})

// Expand recurring events
const instances = await Calendar.expandRecurring(event, {
  from: dayjs(),
  to: dayjs().add(3, 'months'),
})
```

### Updating Events

```typescript
// Update single event
await Calendar.updateEvent(eventId, {
  title: 'Updated Meeting Title',
  start_at: newStartTime,
})

// Update recurring event instance
await Calendar.updateEventInstance(eventId, instanceDate, {
  title: 'Special Meeting',
})

// Update all future instances
await Calendar.updateEventSeries(eventId, instanceDate, {
  start_at: newTime,
}, { updateFuture: true })

// Cancel event
await Calendar.cancelEvent(eventId)
```

## Availability & Booking

### Check Availability

```typescript
import { Availability } from '@stacksjs/calendar'

// Check if time slot is available
const isAvailable = await Availability.check(userId, {
  start: dayjs().hour(14),
  end: dayjs().hour(15),
})

// Get available slots for a day
const slots = await Availability.getSlots(userId, {
  date: dayjs('2024-01-15'),
  duration: 30, // minutes
})

// [
//   { start: '09:00', end: '09:30', available: true },
//   { start: '09:30', end: '10:00', available: true },
//   { start: '10:00', end: '10:30', available: false }, // Existing meeting
//   ...
// ]

// Get availability for multiple users (find common time)
const commonSlots = await Availability.findCommon([userId1, userId2], {
  date: dayjs('2024-01-15'),
  duration: 60,
})
```

### Booking System

```typescript
import { Booking } from '@stacksjs/calendar'

// Create booking type
const bookingType = await Booking.createType({
  name: 'Consultation Call',
  duration: 30,
  color: '#10B981',
  description: 'A 30-minute consultation call',
  location: 'Zoom',
  availability: {
    days: [1, 2, 3, 4, 5], // Mon-Fri
    hours: { start: '09:00', end: '17:00' },
  },
  bufferBefore: 15,
  bufferAfter: 15,
  maxPerDay: 8,
  requireConfirmation: false,
  questions: [
    { type: 'text', label: 'What would you like to discuss?', required: true },
  ],
})

// Get booking page data
const bookingPage = await Booking.getPage(userId, bookingType.slug)

// Book a slot
const booking = await Booking.create({
  typeId: bookingType.id,
  hostId: userId,
  guestEmail: 'guest@example.com',
  guestName: 'John Doe',
  startAt: selectedSlot.start,
  answers: {
    'What would you like to discuss?': 'Project planning',
  },
})

// Confirm booking (if requireConfirmation is true)
await Booking.confirm(bookingId)

// Cancel booking
await Booking.cancel(bookingId, {
  reason: 'Schedule conflict',
  notifyGuest: true,
})

// Reschedule booking
await Booking.reschedule(bookingId, {
  newStartAt: newTime,
  notifyGuest: true,
})
```

### Booking Page Component

```stx
<!-- components/BookingPage.stx -->
<template>
  <div class="booking-page">
    <div class="booking-header">
      <x-avatar :src="host.avatar" size="lg" />
      <h1>{{ host.name }}</h1>
      <h2>{{ bookingType.name }}</h2>
      <p>{{ bookingType.description }}</p>
      <div class="flex items-center gap-2 text-gray-500">
        <x-icon name="clock" />
        <span>{{ bookingType.duration }} minutes</span>
      </div>
    </div>

    <div class="booking-calendar">
      <x-calendar
        v-model:selected="selectedDate"
        :min-date="minDate"
        :max-date="maxDate"
        :disabled-dates="disabledDates"
      />
    </div>

    <div v-if="selectedDate" class="booking-slots">
      <h3>Available times for {{ formatDate(selectedDate) }}</h3>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="slot in availableSlots"
          :key="slot.start"
          @click="selectSlot(slot)"
          :class="{ 'selected': selectedSlot === slot }"
          class="slot-button"
        >
          {{ formatTime(slot.start) }}
        </button>
      </div>
    </div>

    <div v-if="selectedSlot" class="booking-form">
      <x-form @submit="submitBooking">
        <x-input v-model="guestName" label="Your name" required />
        <x-input v-model="guestEmail" type="email" label="Email" required />

        <div v-for="question in bookingType.questions" :key="question.label">
          <x-textarea
            v-if="question.type === 'text'"
            v-model="answers[question.label]"
            :label="question.label"
            :required="question.required"
          />
        </div>

        <x-button type="submit" :loading="submitting">
          Confirm Booking
        </x-button>
      </x-form>
    </div>
  </div>
</template>
```

## Calendar Sync

### Google Calendar

```typescript
import { GoogleCalendar } from '@stacksjs/calendar'

// Connect Google Calendar
const authUrl = await GoogleCalendar.getAuthUrl(userId)
// Redirect user to authUrl

// Handle callback
await GoogleCalendar.handleCallback(userId, authCode)

// Sync calendars
const calendars = await GoogleCalendar.listCalendars(userId)
await GoogleCalendar.syncCalendar(userId, calendarId)

// Import events
await GoogleCalendar.importEvents(userId, calendarId, {
  from: dayjs().subtract(1, 'month'),
  to: dayjs().add(3, 'months'),
})

// Export event to Google
await GoogleCalendar.exportEvent(userId, event)

// Two-way sync
await GoogleCalendar.enableTwoWaySync(userId, calendarId)
```

### Outlook Calendar

```typescript
import { OutlookCalendar } from '@stacksjs/calendar'

// Connect Outlook
const authUrl = await OutlookCalendar.getAuthUrl(userId)

// Sync
await OutlookCalendar.sync(userId)
```

### iCal Export/Import

```typescript
import { ICal } from '@stacksjs/calendar'

// Export events to iCal format
const icalString = await ICal.export(events)

// Generate iCal feed URL
const feedUrl = await ICal.generateFeedUrl(userId, calendarId)
// https://myapp.com/calendar/feed/abc123.ics

// Import iCal file
const importedEvents = await ICal.import(icalFileContent)
await Calendar.createEvents(importedEvents)
```

## Reminders

### Setting Reminders

```typescript
import { Reminder } from '@stacksjs/calendar'

// Add reminder to event
await Reminder.create({
  event_id: eventId,
  type: 'email', // 'email' | 'push' | 'sms'
  before: 60, // minutes before event
})

// Default reminders based on event type
await Reminder.setDefaults(eventId, 'meeting')

// Custom reminder time
await Reminder.createAt({
  event_id: eventId,
  type: 'email',
  remind_at: dayjs(event.start_at).subtract(1, 'day').hour(9),
})
```

### Reminder Job

```typescript
// app/Jobs/SendEventReminders.ts
export default {
  schedule: '* * * * *', // Every minute

  async handle() {
    const dueReminders = await Reminder
      .where('sent_at', null)
      .where('remind_at', '<=', new Date())
      .with('event', 'event.organizer', 'event.attendees')
      .get()

    for (const reminder of dueReminders) {
      await this.sendReminder(reminder)
      await reminder.update({ sent_at: new Date() })
    }
  },

  async sendReminder(reminder) {
    const { event } = reminder

    switch (reminder.type) {
      case 'email':
        await Mail.send(new EventReminderEmail(event))
        break
      case 'push':
        await Push.send(event.organizer_id, {
          title: 'Upcoming Event',
          body: `${event.title} starts in ${reminder.before} minutes`,
        })
        break
    }
  },
}
```

## Calendar UI Components

### Calendar View

```stx
<x-calendar
  v-model:selected="selectedDate"
  v-model:view="calendarView"
  :events="events"
  :views="['month', 'week', 'day', 'agenda']"
  @event-click="openEvent"
  @date-click="createEvent"
  @event-drop="moveEvent"
  @event-resize="resizeEvent"
/>
```

### Event Form

```stx
<x-event-form
  v-model="event"
  :calendars="userCalendars"
  :attendees="teamMembers"
  @save="saveEvent"
  @cancel="closeForm"
/>
```

### Time Picker

```stx
<x-time-picker
  v-model="selectedTime"
  :min="'09:00'"
  :max="'17:00'"
  :interval="30"
  format="h:mm A"
/>
```

## Timezone Handling

```typescript
import { Calendar, Timezone } from '@stacksjs/calendar'

// Create event in specific timezone
const event = await Calendar.createEvent({
  title: 'Meeting',
  start_at: '2024-01-15T14:00:00',
  end_at: '2024-01-15T15:00:00',
  timezone: 'America/New_York',
})

// Convert to user's timezone
const localStart = Timezone.convert(
  event.start_at,
  event.timezone,
  userTimezone
)

// Get available timezones
const timezones = Timezone.list()

// Detect user timezone
const detected = Timezone.detect() // 'America/Los_Angeles'
```

## API Endpoints

```typescript
// routes/api.ts
router.group({ prefix: '/calendar', middleware: ['auth'] }, () => {
  // Calendars
  router.get('/calendars', CalendarController.index)
  router.post('/calendars', CalendarController.create)
  router.put('/calendars/:id', CalendarController.update)
  router.delete('/calendars/:id', CalendarController.destroy)

  // Events
  router.get('/events', EventController.index)
  router.post('/events', EventController.create)
  router.get('/events/:id', EventController.show)
  router.put('/events/:id', EventController.update)
  router.delete('/events/:id', EventController.destroy)

  // Availability
  router.get('/availability', AvailabilityController.check)
  router.get('/slots', AvailabilityController.slots)

  // Booking
  router.get('/booking/:slug', BookingController.show)
  router.post('/booking/:slug', BookingController.create)

  // Sync
  router.post('/sync/google', SyncController.google)
  router.post('/sync/outlook', SyncController.outlook)

  // Feed
  router.get('/feed/:token.ics', FeedController.ical)
})
```
