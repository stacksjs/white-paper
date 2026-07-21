---
title: Dashboard
description: Auto-generated management UI with analytics, reporting, and data visualization
---

# Dashboard

Stacks.js Dashboard is a powerful, auto-generated management interface that provides complete visibility into your application. Every model automatically gets its own dedicated page with CRUD operations, data visualization, and analytics—all derived from your fully-typed model definitions.

## Overview

The Dashboard eliminates the need to build admin interfaces manually. Because Stacks.js models are fully typed, the framework knows:

- Field types and relationships
- Validation rules
- How to render appropriate form inputs
- How to visualize data trends
- What analytics are meaningful

```bash
# Access dashboard in development
buddy dev
# Navigate to http://localhost:3000/dashboard
```

## Configuration

### Dashboard Configuration

```typescript
// config/dashboard.ts
export default {
  // Dashboard settings
  enabled: true,
  path: '/dashboard',

  // Authentication
  auth: {
    guard: 'admin',
    middleware: ['auth', 'admin'],
  },

  // Branding
  branding: {
    name: 'My App Dashboard',
    logo: '/images/logo.svg',
    favicon: '/favicon.ico',
    theme: 'auto', // 'light' | 'dark' | 'auto'
    primaryColor: '#3B82F6',
  },

  // Features
  features: {
    analytics: true,
    reports: true,
    exports: true,
    bulkActions: true,
    activityLog: true,
    search: true,
  },

  // Home page widgets
  widgets: [
    'stats-overview',
    'recent-activity',
    'chart-users',
    'chart-revenue',
  ],
}
```

## Auto-Generated Model Pages

### Automatic CRUD Interface

Every model in `./app/Models/` automatically gets a fully-functional dashboard page:

```typescript
// app/Models/User.ts
export default class User extends Model {
  static fields = {
    name: { type: 'string', required: true },
    email: { type: 'string', unique: true },
    role: { type: 'enum', options: ['admin', 'user', 'guest'] },
    avatar: { type: 'string', nullable: true },
    is_active: { type: 'boolean', default: true },
    credits: { type: 'integer', default: 0 },
    last_login_at: { type: 'datetime', nullable: true },
    metadata: { type: 'json', default: {} },
  }

  static relationships = {
    posts: { type: 'hasMany', model: 'Post' },
    orders: { type: 'hasMany', model: 'Order' },
  }
}
```

This automatically generates:
- **List View**: Sortable, filterable table with pagination
- **Detail View**: Full record display with relationships
- **Create Form**: Type-appropriate inputs with validation
- **Edit Form**: Pre-filled form with inline validation
- **Delete Confirmation**: Safe deletion with dependency checks

### Smart Field Rendering

The dashboard renders appropriate UI components based on field types:

| Field Type | Dashboard Rendering |
|------------|---------------------|
| `string` | Text input |
| `text` | Textarea / Rich editor |
| `integer` | Number input with stepper |
| `decimal` | Decimal input with precision |
| `boolean` | Toggle switch |
| `enum` | Select dropdown |
| `date` | Date picker |
| `datetime` | DateTime picker |
| `json` | JSON editor with syntax highlighting |
| `foreignId` | Searchable relation picker |
| `file` | File uploader with preview |
| `image` | Image uploader with crop |

### Customizing Model Pages

```typescript
// app/Models/User.ts
export default class User extends Model {
  static fields = { /* ... */ }

  // Dashboard configuration
  static dashboard = {
    // Display settings
    icon: 'users',
    label: 'Users',
    labelPlural: 'Users',
    description: 'Manage user accounts',

    // List view columns
    columns: ['name', 'email', 'role', 'is_active', 'created_at'],

    // Default sorting
    defaultSort: { field: 'created_at', direction: 'desc' },

    // Searchable fields
    searchable: ['name', 'email'],

    // Available filters
    filters: [
      { field: 'role', type: 'select' },
      { field: 'is_active', type: 'boolean' },
      { field: 'created_at', type: 'date-range' },
    ],

    // Bulk actions
    bulkActions: ['delete', 'export', 'activate', 'deactivate'],

    // Per-row actions
    actions: ['view', 'edit', 'delete', 'impersonate'],

    // Form layout
    form: {
      layout: 'two-column',
      sections: [
        {
          title: 'Basic Information',
          fields: ['name', 'email', 'avatar'],
        },
        {
          title: 'Access & Permissions',
          fields: ['role', 'is_active'],
        },
        {
          title: 'Metadata',
          fields: ['credits', 'metadata'],
          collapsed: true,
        },
      ],
    },

    // Relationships to show
    relations: {
      posts: { display: 'table', limit: 5 },
      orders: { display: 'cards', limit: 10 },
    },
  }
}
```

## Data Visualization

### Automatic Charts & Graphs

The dashboard automatically generates visualizations based on your data types:

```typescript
// app/Models/Order.ts
export default class Order extends Model {
  static fields = {
    user_id: { type: 'foreignId', references: 'users' },
    total: { type: 'decimal', precision: 2 },
    status: { type: 'enum', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
    items_count: { type: 'integer' },
    created_at: { type: 'timestamp' },
  }

  // Auto-visualization settings
  static dashboard = {
    visualizations: {
      // Time series for numeric fields
      total: {
        chart: 'line',
        aggregate: 'sum',
        groupBy: 'day',
        label: 'Revenue Over Time',
      },

      // Distribution for enum fields
      status: {
        chart: 'pie',
        label: 'Orders by Status',
      },

      // Count over time
      count: {
        chart: 'bar',
        groupBy: 'week',
        label: 'Orders Per Week',
      },
    },
  }
}
```

### Chart Types

```typescript
// Available chart configurations
static dashboard = {
  visualizations: {
    // Line chart for trends
    revenue: {
      chart: 'line',
      aggregate: 'sum', // 'sum' | 'avg' | 'count' | 'min' | 'max'
      groupBy: 'day', // 'hour' | 'day' | 'week' | 'month' | 'year'
      color: '#3B82F6',
      fill: true,
    },

    // Bar chart for comparisons
    orders_by_region: {
      chart: 'bar',
      groupBy: 'region',
      stacked: false,
      horizontal: false,
    },

    // Pie/donut for distribution
    status_breakdown: {
      chart: 'donut', // 'pie' | 'donut'
      field: 'status',
      showPercentages: true,
    },

    // Area chart for cumulative data
    cumulative_users: {
      chart: 'area',
      aggregate: 'count',
      cumulative: true,
      groupBy: 'month',
    },

    // Scatter plot for correlations
    price_vs_quantity: {
      chart: 'scatter',
      x: 'price',
      y: 'quantity',
      size: 'total',
    },

    // Heatmap for patterns
    activity_heatmap: {
      chart: 'heatmap',
      x: 'hour',
      y: 'day_of_week',
      value: 'count',
    },
  },
}
```

### Custom Visualizations

```typescript
// app/Dashboard/Widgets/RevenueChart.ts
import { Widget } from '@stacksjs/dashboard'

export default new Widget({
  name: 'revenue-chart',
  title: 'Revenue Analytics',

  async data() {
    const orders = await Order
      .select(DB.raw('DATE(created_at) as date'), DB.raw('SUM(total) as revenue'))
      .where('created_at', '>=', dayjs().subtract(30, 'days'))
      .groupBy('date')
      .get()

    return {
      labels: orders.map(o => o.date),
      datasets: [{
        label: 'Revenue',
        data: orders.map(o => o.revenue),
        borderColor: '#3B82F6',
        fill: true,
      }],
    }
  },

  render() {
    return `
      <x-chart
        type="line"
        :data="data"
        :options="{
          responsive: true,
          plugins: {
            legend: { display: false },
          },
        }"
      />
    `
  },
})
```

## Analytics

### Built-in Analytics Dashboard

```typescript
// config/dashboard.ts
export default {
  analytics: {
    // Overview metrics
    metrics: [
      {
        name: 'Total Users',
        model: 'User',
        aggregate: 'count',
        icon: 'users',
        color: 'blue',
      },
      {
        name: 'Revenue',
        model: 'Order',
        field: 'total',
        aggregate: 'sum',
        format: 'currency',
        icon: 'dollar-sign',
        color: 'green',
      },
      {
        name: 'Avg Order Value',
        model: 'Order',
        field: 'total',
        aggregate: 'avg',
        format: 'currency',
        icon: 'trending-up',
        color: 'purple',
      },
      {
        name: 'Active Subscriptions',
        model: 'Subscription',
        aggregate: 'count',
        where: { status: 'active' },
        icon: 'refresh-cw',
        color: 'orange',
      },
    ],

    // Comparison periods
    comparisons: ['previous_period', 'previous_year'],

    // Real-time updates
    realtime: true,
    refreshInterval: 30000, // 30 seconds
  },
}
```

### Metric Cards

```stx
<!-- Auto-generated metric display -->
<x-dashboard-metrics>
  <x-metric
    title="Total Users"
    :value="metrics.users.current"
    :previous="metrics.users.previous"
    :trend="metrics.users.trend"
    format="number"
  />

  <x-metric
    title="Revenue"
    :value="metrics.revenue.current"
    :previous="metrics.revenue.previous"
    :trend="metrics.revenue.trend"
    format="currency"
    currency="USD"
  />

  <x-metric
    title="Conversion Rate"
    :value="metrics.conversion.current"
    :previous="metrics.conversion.previous"
    :trend="metrics.conversion.trend"
    format="percentage"
  />
</x-dashboard-metrics>
```

### Trend Analysis

```typescript
import { Analytics } from '@stacksjs/dashboard'

// Get trend data
const userTrend = await Analytics.trend('User', {
  aggregate: 'count',
  period: 'month',
  compare: 'previous_period',
})

// {
//   current: 1250,
//   previous: 1100,
//   change: 150,
//   changePercent: 13.6,
//   trend: 'up',
//   sparkline: [980, 1020, 1050, 1100, 1150, 1200, 1250],
// }

// Revenue breakdown
const revenueByProduct = await Analytics.breakdown('Order', {
  field: 'total',
  aggregate: 'sum',
  groupBy: 'product_category',
  period: 'month',
})
```

## Reporting

### Report Builder

```typescript
// app/Dashboard/Reports/MonthlyRevenue.ts
import { Report } from '@stacksjs/dashboard'

export default new Report({
  name: 'monthly-revenue',
  title: 'Monthly Revenue Report',
  description: 'Comprehensive monthly revenue breakdown',

  // Report parameters
  parameters: [
    { name: 'month', type: 'month', default: 'current' },
    { name: 'compare', type: 'boolean', default: true },
  ],

  // Data query
  async query({ month, compare }) {
    const start = dayjs(month).startOf('month')
    const end = dayjs(month).endOf('month')

    const orders = await Order
      .whereBetween('created_at', [start, end])
      .with('user', 'products')
      .get()

    const previousOrders = compare
      ? await Order
          .whereBetween('created_at', [
            start.subtract(1, 'month'),
            end.subtract(1, 'month'),
          ])
          .get()
      : []

    return {
      orders,
      previousOrders,
      summary: {
        total: orders.sum('total'),
        count: orders.length,
        average: orders.avg('total'),
        previousTotal: previousOrders.sum('total'),
      },
    }
  },

  // Report sections
  sections: [
    {
      title: 'Summary',
      type: 'metrics',
      metrics: ['total', 'count', 'average'],
    },
    {
      title: 'Revenue by Day',
      type: 'chart',
      chart: 'bar',
      data: (data) => ({
        labels: data.orders.groupBy('date').keys(),
        values: data.orders.groupBy('date').sum('total'),
      }),
    },
    {
      title: 'Top Products',
      type: 'table',
      columns: ['product', 'quantity', 'revenue'],
    },
    {
      title: 'Order Details',
      type: 'table',
      data: 'orders',
      columns: ['id', 'user.name', 'total', 'status', 'created_at'],
    },
  ],

  // Export formats
  exports: ['pdf', 'csv', 'xlsx'],

  // Schedule automated reports
  schedule: {
    frequency: 'monthly',
    day: 1,
    recipients: ['admin@example.com'],
  },
})
```

### Scheduled Reports

```typescript
// config/dashboard.ts
export default {
  reports: {
    scheduled: [
      {
        report: 'monthly-revenue',
        frequency: 'monthly',
        day: 1,
        time: '09:00',
        recipients: ['cfo@example.com', 'ceo@example.com'],
        format: 'pdf',
      },
      {
        report: 'weekly-users',
        frequency: 'weekly',
        day: 'monday',
        time: '08:00',
        recipients: ['growth@example.com'],
        format: 'xlsx',
      },
      {
        report: 'daily-orders',
        frequency: 'daily',
        time: '06:00',
        recipients: ['ops@example.com'],
        format: 'csv',
      },
    ],
  },
}
```

### Export Data

```typescript
// Export from dashboard
import { Export } from '@stacksjs/dashboard'

// Export model data
await Export.model('User', {
  format: 'xlsx',
  columns: ['name', 'email', 'created_at'],
  filters: { is_active: true },
})

// Export report
await Export.report('monthly-revenue', {
  format: 'pdf',
  parameters: { month: '2024-01' },
})

// Bulk export with progress
const job = await Export.async('Order', {
  format: 'csv',
  all: true,
})

// Check progress
const status = await job.status()
// { progress: 75, total: 10000, processed: 7500 }
```

## Activity Log

### Automatic Activity Tracking

```typescript
// All model changes are automatically logged
// app/Models/User.ts
export default class User extends Model {
  static dashboard = {
    // Enable activity logging
    trackActivity: true,

    // What to track
    track: ['created', 'updated', 'deleted'],

    // Fields to exclude from diff
    excludeFromDiff: ['password', 'remember_token'],
  }
}
```

### Activity Feed

```stx
<!-- Dashboard activity feed -->
<x-activity-feed :limit="20">
  <template #item="{ activity }">
    <div class="flex items-center gap-3 py-2">
      <x-avatar :src="activity.user.avatar" size="sm" />
      <div>
        <span class="font-medium">{{ activity.user.name }}</span>
        <span class="text-gray-500">{{ activity.description }}</span>
        <span class="text-gray-400 text-sm">{{ activity.time_ago }}</span>
      </div>
    </div>
  </template>
</x-activity-feed>
```

### Query Activity

```typescript
import { Activity } from '@stacksjs/dashboard'

// Get recent activity
const recent = await Activity.recent(20)

// Get activity for specific model
const userActivity = await Activity.for('User', userId)

// Get activity by user
const byUser = await Activity.by(adminId)

// Filter activity
const deletions = await Activity
  .where('action', 'deleted')
  .where('created_at', '>=', dayjs().subtract(7, 'days'))
  .get()
```

## Dashboard Widgets

### Built-in Widgets

```typescript
// config/dashboard.ts
export default {
  // Home page layout
  layout: [
    // Row 1: Metrics
    { widget: 'metrics-overview', cols: 12 },

    // Row 2: Charts
    { widget: 'chart-revenue', cols: 8 },
    { widget: 'chart-orders', cols: 4 },

    // Row 3: Tables
    { widget: 'recent-orders', cols: 6 },
    { widget: 'top-users', cols: 6 },

    // Row 4: Activity
    { widget: 'activity-feed', cols: 12 },
  ],
}
```

### Custom Widgets

```typescript
// app/Dashboard/Widgets/TopProducts.ts
import { Widget } from '@stacksjs/dashboard'

export default new Widget({
  name: 'top-products',
  title: 'Top Products',
  icon: 'package',

  // Widget size
  size: {
    cols: 6, // 1-12 grid columns
    rows: 2, // Height units
  },

  // Refresh settings
  refresh: {
    auto: true,
    interval: 60000, // 1 minute
  },

  // Data fetching
  async data() {
    return await Product
      .select('products.*', DB.raw('SUM(order_items.quantity) as sold'))
      .join('order_items', 'products.id', 'order_items.product_id')
      .groupBy('products.id')
      .orderBy('sold', 'desc')
      .limit(10)
      .get()
  },

  // Render widget
  render(products) {
    return `
      <x-card>
        <x-card-header>
          <h3>Top Selling Products</h3>
        </x-card-header>
        <x-card-body>
          <x-table :data="products">
            <x-column field="name" label="Product" />
            <x-column field="sold" label="Units Sold" />
            <x-column field="price" label="Price" format="currency" />
          </x-table>
        </x-card-body>
      </x-card>
    `
  },
})
```

## Search & Filters

### Global Search

```typescript
// Dashboard global search searches across all models
// config/dashboard.ts
export default {
  search: {
    enabled: true,

    // Models to include in global search
    models: ['User', 'Order', 'Product', 'Post'],

    // Keyboard shortcut
    shortcut: 'cmd+k',

    // Results limit per model
    limit: 5,
  },
}
```

### Model Filters

```typescript
// app/Models/Order.ts
export default class Order extends Model {
  static dashboard = {
    filters: [
      // Select filter
      {
        field: 'status',
        type: 'select',
        options: ['pending', 'processing', 'shipped', 'delivered'],
        multiple: true,
      },

      // Date range filter
      {
        field: 'created_at',
        type: 'date-range',
        presets: ['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month'],
      },

      // Numeric range filter
      {
        field: 'total',
        type: 'range',
        min: 0,
        max: 10000,
        step: 100,
      },

      // Boolean filter
      {
        field: 'is_paid',
        type: 'boolean',
        labels: { true: 'Paid', false: 'Unpaid' },
      },

      // Relationship filter
      {
        field: 'user_id',
        type: 'relation',
        model: 'User',
        searchable: true,
      },

      // Custom filter
      {
        name: 'high_value',
        label: 'High Value Orders',
        apply: (query) => query.where('total', '>', 1000),
      },
    ],

    // Saved filter presets
    presets: [
      {
        name: 'Pending Orders',
        filters: { status: 'pending' },
      },
      {
        name: 'This Month',
        filters: { created_at: 'this_month' },
      },
    ],
  }
}
```

## Bulk Actions

### Define Bulk Actions

```typescript
// app/Models/User.ts
export default class User extends Model {
  static dashboard = {
    bulkActions: [
      // Built-in actions
      'delete',
      'export',

      // Custom actions
      {
        name: 'activate',
        label: 'Activate Users',
        icon: 'check-circle',
        action: async (ids) => {
          await User.whereIn('id', ids).update({ is_active: true })
          return { message: `${ids.length} users activated` }
        },
      },
      {
        name: 'deactivate',
        label: 'Deactivate Users',
        icon: 'x-circle',
        confirm: 'Are you sure you want to deactivate these users?',
        action: async (ids) => {
          await User.whereIn('id', ids).update({ is_active: false })
          return { message: `${ids.length} users deactivated` }
        },
      },
      {
        name: 'send_email',
        label: 'Send Email',
        icon: 'mail',
        form: [
          { name: 'subject', type: 'text', required: true },
          { name: 'message', type: 'textarea', required: true },
        ],
        action: async (ids, { subject, message }) => {
          const users = await User.whereIn('id', ids).get()
          for (const user of users) {
            await Mail.to(user.email).send(new BulkEmail(subject, message))
          }
          return { message: `Email sent to ${ids.length} users` }
        },
      },
    ],
  }
}
```

## Access Control

### Role-Based Access

```typescript
// config/dashboard.ts
export default {
  auth: {
    // Required role to access dashboard
    roles: ['admin', 'editor'],

    // Permission-based access
    permissions: {
      'dashboard.view': ['admin', 'editor', 'viewer'],
      'dashboard.edit': ['admin', 'editor'],
      'dashboard.delete': ['admin'],
      'dashboard.export': ['admin', 'editor'],
    },
  },
}

// Model-level permissions
// app/Models/User.ts
export default class User extends Model {
  static dashboard = {
    permissions: {
      view: ['admin', 'hr'],
      create: ['admin'],
      edit: ['admin', 'hr'],
      delete: ['admin'],
    },

    // Field-level permissions
    fieldPermissions: {
      salary: { view: ['admin', 'hr'], edit: ['admin'] },
      ssn: { view: ['admin'], edit: ['admin'] },
    },
  }
}
```

## Real-Time Updates

### Live Data

```typescript
// config/dashboard.ts
export default {
  realtime: {
    enabled: true,

    // Update dashboard when models change
    subscribe: ['User', 'Order', 'Product'],

    // Refresh interval for widgets
    refreshInterval: 30000,
  },
}
```

### Live Notifications

```typescript
// Dashboard receives real-time notifications
import { Dashboard } from '@stacksjs/dashboard'

// Send notification to dashboard users
Dashboard.notify({
  title: 'New Order',
  message: `Order #${order.id} received`,
  type: 'success',
  action: {
    label: 'View Order',
    url: `/dashboard/orders/${order.id}`,
  },
})
```

## CLI Commands

```bash
# Generate dashboard widget
buddy make:widget TopProducts

# Generate dashboard report
buddy make:report MonthlyRevenue

# Clear dashboard cache
buddy dashboard:cache:clear

# Export dashboard data
buddy dashboard:export users --format=xlsx

# Run scheduled reports
buddy dashboard:reports:run
```

## Best Practices

### Performance

```typescript
// Optimize dashboard queries
static dashboard = {
  // Use eager loading
  with: ['user', 'category'],

  // Select only needed columns
  select: ['id', 'name', 'status', 'created_at'],

  // Cache expensive widgets
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
  },
}
```

### Security

```typescript
// Never expose sensitive data
static dashboard = {
  // Hide sensitive columns
  hidden: ['password', 'api_key', 'secret'],

  // Mask partially
  masked: {
    email: (value) => maskEmail(value),
    phone: (value) => maskPhone(value),
  },

  // Audit all actions
  audit: true,
}
```
