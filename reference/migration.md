---
title: Migration Guides
description: Migrate to Stacks.js from Laravel, Next.js, Rails, and other frameworks
---

# Migration Guides

This guide helps developers migrate existing applications to Stacks.js from popular frameworks. Stacks.js draws inspiration from Laravel, Rails, and modern JavaScript frameworks, making migration familiar for developers from these backgrounds.

## From Laravel

Laravel developers will find Stacks.js immediately familiar. Many concepts translate directly.

### Concept Mapping

| Laravel | Stacks.js | Notes |
|---------|-----------|-------|
| Artisan | Buddy | CLI tool |
| Blade | STX | Template engine |
| Eloquent | ORM | Query builder |
| Migrations | Migrations | Same concept |
| Tinker | Tinker | Interactive REPL |
| Queues | Queues | Job processing |
| Events | Events | Event dispatching |
| Middleware | Middleware | Request/response |
| Service Providers | Providers | Service registration |
| Facades | Imports | Direct imports |

### Routes

```php
// Laravel
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::resource('posts', PostController::class);
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

```typescript
// Stacks.js
router.get('/users', UserController.index)
router.post('/users', UserController.store)
router.resource('posts', PostController)
router.group({ middleware: ['auth'] }, () => {
  router.get('/dashboard', DashboardController.index)
})
```

### Controllers

```php
// Laravel
class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->paginate();

        return response()->json($users);
    }

    public function store(CreateUserRequest $request)
    {
        $user = User::create($request->validated());
        return response()->json($user, 201);
    }
}
```

```typescript
// Stacks.js
export default class UserController extends Controller {
  async index(request: Request) {
    const users = await User.query()
      .when(request.query('status'), (q) => q.where('status', request.query('status')))
      .paginate()

    return response(users)
  }

  async store(request: CreateUserRequest) {
    const user = await User.create(request.validated())
    return response(user, 201)
  }
}
```

### Models

```php
// Laravel
class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password'];
    protected $casts = ['email_verified_at' => 'datetime'];

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
```

```typescript
// Stacks.js
export default class User extends Model {
  static fields = {
    name: { type: 'string', required: true },
    email: { type: 'string', unique: true },
    password: { type: 'string', hidden: true },
    email_verified_at: { type: 'datetime', nullable: true },
  }

  static relationships = {
    posts: { type: 'hasMany', model: 'Post' },
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
```

### Migrations

```php
// Laravel
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->rememberToken();
    $table->timestamps();
});
```

```typescript
// Stacks.js
export default {
  async up(schema) {
    await schema.create('users', (table) => {
      table.id()
      table.string('name')
      table.string('email').unique()
      table.timestamp('email_verified_at').nullable()
      table.string('password')
      table.rememberToken()
      table.timestamps()
    })
  },
}
```

### Blade to STX

```blade
{{-- Laravel Blade --}}
@extends('layouts.app')

@section('content')
    <h1>{{ $title }}</h1>

    @if($users->count())
        @foreach($users as $user)
            <div class="user">
                <span>{{ $user->name }}</span>
                @if($user->isAdmin)
                    <span class="badge">Admin</span>
                @endif
            </div>
        @endforeach
    @else
        <p>No users found.</p>
    @endif

    @include('partials.pagination', ['items' => $users])
@endsection
```

```stx
<!-- Stacks.js STX -->
<x-app-layout>
  <h1>{{ title }}</h1>

  @if(users.length)
    @foreach(users as user)
      <div class="user">
        <span>{{ user.name }}</span>
        @if(user.isAdmin)
          <span class="badge">Admin</span>
        @endif
      </div>
    @endforeach
  @else
    <p>No users found.</p>
  @endif

  <x-pagination :items="users" />
</x-app-layout>
```

### Key Differences

| Aspect | Laravel | Stacks.js |
|--------|---------|-----------|
| Runtime | PHP | Bun (TypeScript) |
| Async | Sync by default | Async/await |
| Types | PHPDoc/Attributes | Full TypeScript |
| Frontend | Separate (Inertia/Livewire) | Unified STX |
| Package Manager | Composer | bun |
| Config | PHP arrays | TypeScript objects |

## From Next.js

Next.js developers will appreciate Stacks.js's full-stack approach with built-in backend capabilities.

### Concept Mapping

| Next.js | Stacks.js | Notes |
|---------|-----------|-------|
| pages/ or app/ | routes/ | Routing |
| API Routes | Controllers | Backend logic |
| getServerSideProps | Controller methods | Data fetching |
| Prisma/Drizzle | Built-in ORM | Database |
| NextAuth | Built-in Auth | Authentication |
| External packages | Built-in modules | Batteries included |

### Pages to Routes

```tsx
// Next.js - app/users/page.tsx
import { getUsers } from '@/lib/users'

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

```stx
<!-- Stacks.js - pages/users.stx -->
<template>
  <div>
    <h1>Users</h1>
    @foreach(users as user)
      <div>{{ user.name }}</div>
    @endforeach
  </div>
</template>

<script>
export default {
  async data() {
    return {
      users: await User.all(),
    }
  },
}
</script>
```

### API Routes to Controllers

```typescript
// Next.js - app/api/users/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const data = await request.json()
  const user = await prisma.user.create({ data })
  return NextResponse.json(user, { status: 201 })
}
```

```typescript
// Stacks.js - app/Controllers/UserController.ts
export default class UserController extends Controller {
  async index() {
    return User.all()
  }

  async store(request: Request) {
    const user = await User.create(request.validated())
    return response(user, 201)
  }
}

// routes/api.ts
router.get('/users', UserController.index)
router.post('/users', UserController.store)
```

### Database

```typescript
// Next.js with Prisma - prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Usage
const users = await prisma.user.findMany({
  where: { email: { contains: 'example' } },
  include: { posts: true },
})
```

```typescript
// Stacks.js - app/Models/User.ts
export default class User extends Model {
  static fields = {
    email: { type: 'string', unique: true },
    name: { type: 'string', nullable: true },
  }

  static relationships = {
    posts: { type: 'hasMany', model: 'Post' },
  }
}

// Usage
const users = await User
  .where('email', 'like', '%example%')
  .with('posts')
  .get()
```

### What Stacks.js Adds

| Feature | Next.js | Stacks.js |
|---------|---------|-----------|
| ORM | External (Prisma) | Built-in |
| Auth | External (NextAuth) | Built-in |
| Queue | External | Built-in |
| Email | External | Built-in |
| Validation | External | Built-in |
| Admin Dashboard | Build yourself | Auto-generated |

## From Ruby on Rails

Rails developers will find Stacks.js conceptually similar with TypeScript benefits.

### Concept Mapping

| Rails | Stacks.js | Notes |
|-------|-----------|-------|
| rails | buddy | CLI |
| ActiveRecord | ORM | Database models |
| ERB | STX | Templates |
| ActionMailer | Email | Mailing |
| ActiveJob | Queue | Background jobs |
| Devise | Auth | Authentication |
| Rails Console | Tinker | REPL |

### Models

```ruby
# Rails
class User < ApplicationRecord
  has_many :posts
  belongs_to :team

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  before_create :generate_token

  scope :active, -> { where(active: true) }

  def full_name
    "#{first_name} #{last_name}"
  end
end
```

```typescript
// Stacks.js
export default class User extends Model {
  static fields = {
    email: { type: 'string', required: true, unique: true },
    name: { type: 'string', required: true },
    active: { type: 'boolean', default: true },
    token: { type: 'string', nullable: true },
  }

  static relationships = {
    posts: { type: 'hasMany', model: 'Post' },
    team: { type: 'belongsTo', model: 'Team' },
  }

  static scopes = {
    active: (query) => query.where('active', true),
  }

  static hooks = {
    beforeCreate: async (user) => {
      user.token = generateToken()
    },
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
```

### Controllers

```ruby
# Rails
class UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :update, :destroy]

  def index
    @users = User.active.page(params[:page])
    render json: @users
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :email)
  end
end
```

```typescript
// Stacks.js
export default class UserController extends Controller {
  static middleware = ['auth']

  async index(request: Request) {
    const users = await User.active().paginate(request.query('page'))
    return response(users)
  }

  async store(request: CreateUserRequest) {
    const user = await User.create(request.validated())
    return response(user, 201)
  }
}
```

### Routes

```ruby
# Rails - config/routes.rb
Rails.application.routes.draw do
  resources :users do
    resources :posts
    member do
      post :activate
    end
  end

  namespace :api do
    namespace :v1 do
      resources :products
    end
  end
end
```

```typescript
// Stacks.js - routes/web.ts
router.resource('users', UserController)
router.resource('users.posts', UserPostController)
router.post('users/:id/activate', UserController.activate)

// routes/api.ts
router.prefix('/api/v1', () => {
  router.resource('products', ProductController)
})
```

### Key Differences

| Aspect | Rails | Stacks.js |
|--------|-------|-----------|
| Language | Ruby | TypeScript |
| Runtime | MRI/JRuby | Bun |
| Types | Duck typing | Static types |
| Convention | Strong | Strong (similar) |
| Frontend | Hotwire/Turbo | STX |

## From Express.js

Express developers can leverage their Node.js knowledge while gaining full-stack features.

### Concept Mapping

| Express | Stacks.js | Notes |
|---------|-----------|-------|
| app.get() | router.get() | Routes |
| middleware | middleware | Same concept |
| req, res | request, response | Request handling |
| External ORM | Built-in ORM | Database |
| External everything | Batteries included | Full stack |

### Routes

```javascript
// Express
const express = require('express')
const app = express()

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/users', validateUser, async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
```

```typescript
// Stacks.js
router.get('/users', UserController.index)
router.post('/users', [CreateUserRequest], UserController.store)

// UserController.ts
export default class UserController extends Controller {
  async index() {
    return User.all()
  }

  async store(request: CreateUserRequest) {
    const user = await User.create(request.validated())
    return response(user, 201)
  }
}
```

### Middleware

```javascript
// Express
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

app.use('/api', authMiddleware)
```

```typescript
// Stacks.js
export class AuthMiddleware extends Middleware {
  async handle(request: Request, next: Function) {
    const token = request.bearerToken()
    if (!token) {
      return response({ error: 'Unauthorized' }, 401)
    }

    try {
      request.user = await JWT.verify(token)
      return next()
    } catch {
      return response({ error: 'Invalid token' }, 401)
    }
  }
}

// routes/api.ts
router.group({ middleware: ['auth'] }, () => {
  // Protected routes
})
```

### What You Gain

| Feature | Express | Stacks.js |
|---------|---------|-----------|
| ORM | Add Sequelize/Prisma | Built-in |
| Validation | Add Joi/Yup | Built-in |
| Auth | Add Passport | Built-in |
| Email | Add Nodemailer | Built-in |
| Queue | Add Bull | Built-in |
| CLI | Build yourself | Buddy CLI |
| Frontend | Separate app | Unified |

## Migration Checklist

### Phase 1: Setup

```bash
# Create new Stacks project
bunx stacks create my-app

# Install dependencies
cd my-app && bun install

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

### Phase 2: Database

1. Create models matching your existing schema
2. Create migrations or use `buddy db:import`
3. Run migrations: `buddy migrate`
4. Verify data: `buddy tinker`

### Phase 3: Backend

1. Create controllers for each endpoint
2. Create form requests for validation
3. Set up routes matching your API
4. Migrate middleware
5. Test with existing frontend/clients

### Phase 4: Frontend

1. Convert templates to STX
2. Create components for reusable UI
3. Set up layouts
4. Migrate assets and styles

### Phase 5: Features

1. Set up authentication
2. Configure queues and jobs
3. Set up email templates
4. Configure caching
5. Set up scheduled tasks

### Phase 6: Deploy

1. Configure production environment
2. Set up ts-cloud infrastructure
3. Deploy: `buddy deploy`
4. Monitor with Dashboard
