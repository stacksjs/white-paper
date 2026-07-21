---
title: Validation
description: Type-safe schema validation with fluent API in Stacks.js
---

# Validation

Stacks.js includes `ts-validation`, a lightweight, type-safe validation library with a fluent chainable API. It provides blazing-fast performance, comprehensive error reporting, and full TypeScript support.

> **Protocol context** — This guide covers the Stacks.js implementation of the draft [Validation contract](https://github.com/stacksjs/white-paper#43-validation). The fluent APIs shown here are implementation-specific.

## Overview

```typescript
import { v } from '@stacksjs/validation'

// Create a schema validator
const userSchema = v.object({
  name: v.string().min(2).max(100).required(),
  email: v.string().email().required(),
  password: v.string().min(8).matches(/[A-Z]/, 'Must contain uppercase').required(),
  role: v.enum(['user', 'admin', 'moderator']).required(),
  age: v.integer().min(18).max(120).optional(),
  preferences: v.object({
    newsletter: v.boolean(),
    theme: v.enum(['light', 'dark']),
  }).optional(),
})

// Validate data
const result = userSchema.validate(userData)

if (result.valid) {
  console.log('User is valid!')
} else {
  console.error('Validation errors:', result.errors)
}
```

## Schema Types

### String Validation

```typescript
import { v } from '@stacksjs/validation'

// Basic string validation
const nameValidator = v.string().min(2).max(50).required()

// Email validation
const emailValidator = v.string().email().required()

// URL validation
const websiteValidator = v.string().url().optional()

// Pattern matching with regex
const zipCodeValidator = v.string().matches(/^\d{5}$/).required()
const phoneValidator = v.string().matches(/^\+?[\d\s-()]+$/).required()

// Character restrictions
const usernameValidator = v.string().alphanumeric().required()
const codeValidator = v.string().alpha().required()
const numericStringValidator = v.string().numeric().required()

// Exact length
const countryCodeValidator = v.string().length(2).required()

// Text (specialized for longer content)
const bioValidator = v.text().max(500).optional()

// Equality check
const confirmEmail = v.string().equals(email).required()
```

### Number Validation

```typescript
// Basic number validation
const ageValidator = v.number().min(18).max(120).required()

// Integer validation (whole numbers only)
const quantityValidator = v.integer().min(1).required()

// Positive/negative numbers
const positiveValidator = v.integer().positive().required()
const temperatureValidator = v.number().negative().optional()

// Float validation (decimal numbers)
const priceValidator = v.float().min(0.01).required()

// Decimal with precision
const ratingValidator = v.decimal().min(0).max(5).required()

// Small integer (-32,768 to 32,767)
const smallNumberValidator = v.smallint().required()
```

### Boolean Validation

```typescript
// Simple boolean
const activeValidator = v.boolean().required()

// With default (in object context)
const termsAcceptedValidator = v.boolean().required()
```

### Array Validation

```typescript
// Basic array
const tagsValidator = v.array().min(1).max(10).required()

// Validate each item in the array
const numbersValidator = v.array().each(v.number().positive()).required()

// Array of strings with constraints
const emailsValidator = v.array().each(v.string().email()).min(1).required()

// Fixed length array
const coordinatesValidator = v.array().length(2).each(v.number()).required()

// Array of objects
const itemsValidator = v.array().each(
  v.object({
    name: v.string().required(),
    quantity: v.integer().min(1).required(),
    price: v.float().min(0).required(),
  })
).required()
```

### Object Validation

```typescript
// Basic object schema
const addressValidator = v.object({
  street: v.string().required(),
  city: v.string().required(),
  state: v.string().length(2).required(),
  zip: v.string().matches(/^\d{5}$/).required(),
  country: v.string().optional(),
})

// Nested objects
const userValidator = v.object({
  name: v.string().min(2).required(),
  email: v.string().email().required(),
  address: addressValidator, // Reuse validators
  billing: v.object({
    cardLast4: v.string().length(4).required(),
    expiryMonth: v.integer().min(1).max(12).required(),
    expiryYear: v.integer().min(2024).required(),
  }).optional(),
})

// Strict mode (no extra fields allowed)
const strictValidator = v.object().strict().shape({
  id: v.number().required(),
  name: v.string().required(),
})
```

### Enum Validation

```typescript
// String enum
const statusValidator = v.enum(['active', 'inactive', 'pending']).required()

// Role enum
const roleValidator = v.enum(['user', 'admin', 'moderator', 'guest']).required()

// With optional
const priorityValidator = v.enum(['low', 'medium', 'high', 'critical']).optional()
```

### Date and Time Validation

```typescript
// Basic date validation
const dateValidator = v.date()
dateValidator.test(new Date()) // true
dateValidator.test(new Date('invalid')) // false

// Datetime (MySQL DATETIME compatible)
const datetimeValidator = v.datetime()
datetimeValidator.test(new Date('2024-01-01')) // true

// Time (24-hour format)
const timeValidator = v.time()
timeValidator.test('14:30') // true
timeValidator.test('25:00') // false (invalid hour)

// Unix timestamp
const unixValidator = v.unix()
unixValidator.test(1683912345) // true (seconds)
unixValidator.test(1683912345000) // true (milliseconds)

// Timestamp (MySQL TIMESTAMP compatible)
const timestampValidator = v.timestamp()

// Timestamp with timezone
const timestampTzValidator = v.timestampTz()
```

### Password Validation

```typescript
// Comprehensive password validation
const passwordValidator = v.password()
  .min(8)
  .max(128)
  .alphanumeric()
  .hasUppercase()
  .hasLowercase()
  .hasNumbers()
  .hasSpecialCharacters()

const result = passwordValidator.validate('MySecureP@ss123')

// Password confirmation matching
const confirmPasswordValidator = v.password().matches('MySecureP@ss123')

// Custom password rules
const customPasswordValidator = v.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Must contain at least one lowercase letter')
  .matches(/\d/, 'Must contain at least one number')
  .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character')
  .required()
```

### JSON Validation

```typescript
// JSON string validation
const jsonValidator = v.json()

jsonValidator.test('{"name": "John"}') // true
jsonValidator.test('{"a": 1, "b": 2}') // true
jsonValidator.test('123') // false (primitive)
jsonValidator.test('not json') // false
```

### BigInt Validation

```typescript
// BigInt validation with range
const bigIntValidator = v.bigint().min(0n).max(1000000n).required()
```

### Binary and Blob Validation

```typescript
// Binary data
const binaryValidator = v.binary()

// Blob validation
const blobValidator = v.blob()
```

## Custom Validation

### Inline Custom Rules

```typescript
// Simple custom validator
const isEven = (val: number) => val % 2 === 0
const evenNumberValidator = v.custom(isEven, 'Number must be even')

// Custom string validation
const noSpacesValidator = v.string()
  .custom((value) => !value.includes(' '), 'Spaces are not allowed')
  .required()

// Complex validation with regex
const slugValidator = v.string()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .required()
```

### Custom Error Messages

```typescript
const userValidator = v.object({
  name: v.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),

  email: v.string()
    .email('Please provide a valid email address')
    .required('Email is required'),

  age: v.integer()
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Invalid age')
    .required('Age is required'),
})
```

### Conditional Validation

```typescript
const userValidator = v.object({
  name: v.string().required(),
  email: v.string().email().required(),
  age: v.integer().min(0).required(),

  // Conditional: guardian info required if under 18
  guardianInfo: v.object({
    name: v.string().required(),
    phone: v.string().required(),
  }).custom((value, data) => {
    // Required if user is under 18
    return data.age >= 18 || value !== null
  }, 'Guardian information required for users under 18'),
})
```

## Validation Methods

### validate() - Full Validation

```typescript
const emailValidator = v.string().email().required()
const result = emailValidator.validate('john@example.com')

if (result.valid) {
  console.log('Valid!')
} else {
  // Access error messages
  result.errors.forEach((error) => {
    console.log(error.message)
  })
}
```

### test() - Quick Boolean Check

```typescript
const emailValidator = v.string().email().required()

// Returns boolean - quick check
const isValid = emailValidator.test('john@example.com') // true
const isInvalid = emailValidator.test('invalid') // false
```

### Object Validation Results

```typescript
const userValidator = v.object({
  name: v.string().required(),
  email: v.string().email().required(),
})

const result = userValidator.validate({
  name: '',
  email: 'invalid-email',
})

if (!result.valid) {
  // Errors are organized by field
  Object.entries(result.errors).forEach(([field, errors]) => {
    console.log(`${field}:`)
    errors.forEach((error) => {
      console.log(`  - ${error.message}`)
    })
  })
}

// Output:
// name:
//   - Must be at least 1 character long
// email:
//   - Must be a valid email address
```

## Reusable Validators

### Creating Reusable Schemas

```typescript
import { v } from '@stacksjs/validation'

// Define reusable validators
const emailValidator = v.string().email().required()
const phoneValidator = v.string().matches(/^\+?[\d\s-()]+$/).required()
const passwordValidator = v.password()
  .min(8)
  .hasUppercase()
  .hasLowercase()
  .hasNumbers()
  .required()

// Reuse in different schemas
const contactFormValidator = v.object({
  email: emailValidator,
  phone: phoneValidator,
  message: v.text().min(10).max(1000).required(),
})

const registrationValidator = v.object({
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: passwordValidator,
})

const profileValidator = v.object({
  primaryEmail: emailValidator,
  secondaryEmail: emailValidator.optional(), // Make optional
  phone: phoneValidator.optional(),
})
```

### Schema Composition

```typescript
// Address schema (reusable)
const addressSchema = v.object({
  street: v.string().required(),
  city: v.string().required(),
  state: v.string().length(2).required(),
  zipCode: v.string().matches(/^\d{5}(-\d{4})?$/).required(),
})

// User schema with address
const userSchema = v.object({
  name: v.string().min(2).required(),
  email: v.string().email().required(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
})

// Order schema
const orderSchema = v.object({
  userId: v.integer().required(),
  items: v.array().each(
    v.object({
      productId: v.integer().required(),
      quantity: v.integer().min(1).required(),
    })
  ).min(1).required(),
  shippingAddress: addressSchema,
})
```

## Controller Integration

### Form Request Validation

```typescript
// app/Requests/CreateUserRequest.ts
import { v, FormRequest } from '@stacksjs/validation'

export default class CreateUserRequest extends FormRequest {
  // Define validation schema
  schema() {
    return v.object({
      name: v.string().min(2).max(100).required(),
      email: v.string().email().required(),
      password: v.password()
        .min(8)
        .hasUppercase()
        .hasNumbers()
        .required(),
      role: v.enum(['user', 'admin']).optional(),
    })
  }

  // Authorization check
  authorize() {
    return true
  }

  // Prepare data before validation
  prepareForValidation() {
    this.merge({
      email: this.email?.toLowerCase().trim(),
      name: this.name?.trim(),
    })
  }
}
```

### Using in Controllers

```typescript
// app/Controllers/UserController.ts
export default class UserController extends Controller {
  async store(request: CreateUserRequest) {
    // Request is already validated
    const user = await User.create(request.validated())
    return response(user, 201)
  }

  // Or inline validation
  async update(request: Request) {
    const schema = v.object({
      name: v.string().min(2).optional(),
      email: v.string().email().optional(),
    })

    const result = schema.validate(request.body)

    if (!result.valid) {
      return response({ errors: result.errors }, 422)
    }

    const user = await User.find(request.params.id)
    await user.update(request.body)
    return response(user)
  }
}
```

## API Validation

### Request Validation Middleware

```typescript
// middleware/ValidateRequest.ts
import { v } from '@stacksjs/validation'

export function validateRequest(schema: ReturnType<typeof v.object>) {
  return async (request: Request, next: Function) => {
    const result = schema.validate(request.body)

    if (!result.valid) {
      return response({
        message: 'Validation failed',
        errors: result.errors,
      }, 422)
    }

    request.validated = request.body
    return next()
  }
}

// Usage in routes
const createUserSchema = v.object({
  name: v.string().min(2).required(),
  email: v.string().email().required(),
})

router.post('/api/users',
  validateRequest(createUserSchema),
  UserController.store
)
```

### Real-time Field Validation

```typescript
// API endpoint for field validation
router.post('/api/validate/:field', async (request) => {
  const { field } = request.params
  const value = request.body[field]

  const validators: Record<string, any> = {
    email: v.string().email().required(),
    username: v.string().alphanumeric().min(3).max(20).required(),
    password: v.password().min(8).hasUppercase().hasNumbers().required(),
  }

  const validator = validators[field]
  if (!validator) {
    return response({ valid: true })
  }

  const result = validator.validate(value)

  return response({
    valid: result.valid,
    errors: result.valid ? [] : result.errors.map(e => e.message),
  })
})
```

## Model Validation

### Automatic Model Validation

```typescript
// app/Models/User.ts
import { v } from '@stacksjs/validation'

export default class User extends Model {
  static fields = {
    name: { type: 'string', required: true },
    email: { type: 'string', unique: true },
    password: { type: 'string' },
    role: { type: 'enum', options: ['user', 'admin'] },
    age: { type: 'integer', nullable: true },
  }

  // Validation schema
  static schema = v.object({
    name: v.string().min(2).max(100).required(),
    email: v.string().email().required(),
    password: v.password().min(8).hasUppercase().required(),
    role: v.enum(['user', 'admin']).required(),
    age: v.integer().min(0).max(150).optional(),
  })

  // Enable auto-validation on create/update
  static validate = true
}

// Validation runs automatically
try {
  await User.create({ name: 'J', email: 'invalid' })
} catch (error) {
  console.log(error.errors)
  // { name: [...], email: [...] }
}
```

## TypeScript Integration

### Type Inference

```typescript
import { v } from '@stacksjs/validation'

// Define schema
const userSchema = v.object({
  name: v.string().required(),
  email: v.string().email().required(),
  age: v.integer().min(18).optional(),
  role: v.enum(['user', 'admin', 'moderator']).required(),
  preferences: v.object({
    newsletter: v.boolean(),
    theme: v.enum(['light', 'dark']),
  }).optional(),
})

// Infer type from schema (similar to Zod)
type User = {
  name: string
  email: string
  age?: number
  role: 'user' | 'admin' | 'moderator'
  preferences?: {
    newsletter: boolean
    theme: 'light' | 'dark'
  }
}

// Use with validation
const result = userSchema.validate(userData)
if (result.valid) {
  const user: User = userData
  // TypeScript knows user is valid
}
```

## Frontend Integration

### Form Validation Component

```stx
<template>
  <form @submit.prevent="submit">
    <div class="field">
      <label for="email">Email</label>
      <x-input
        v-model="form.email"
        id="email"
        type="email"
        :error="errors.email?.[0]?.message"
        @blur="validateField('email')"
      />
    </div>

    <div class="field">
      <label for="password">Password</label>
      <x-input
        v-model="form.password"
        id="password"
        type="password"
        :error="errors.password?.[0]?.message"
        @blur="validateField('password')"
      />
    </div>

    <x-button type="submit" :loading="submitting">
      Submit
    </x-button>
  </form>
</template>

<script>
import { v } from '@stacksjs/validation'

const schema = v.object({
  email: v.string().email('Please enter a valid email').required(),
  password: v.password().min(8).hasUppercase().hasNumbers().required(),
})

export default {
  data() {
    return {
      form: { email: '', password: '' },
      errors: {},
      submitting: false,
    }
  },

  methods: {
    validateField(field) {
      const fieldSchema = {
        email: v.string().email().required(),
        password: v.password().min(8).hasUppercase().hasNumbers().required(),
      }

      const result = fieldSchema[field].validate(this.form[field])
      this.errors[field] = result.valid ? null : result.errors
    },

    async submit() {
      const result = schema.validate(this.form)

      if (!result.valid) {
        this.errors = result.errors
        return
      }

      this.submitting = true
      try {
        await this.$api.post('/register', this.form)
        this.$router.push('/dashboard')
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
```

## Configuration

### Global Configuration

```typescript
// validation.config.ts
import type { ValidationOptions } from '@stacksjs/validation'

const config: ValidationOptions = {
  // Enable detailed error messages
  verbose: true,

  // Stop on first error
  strictMode: false,

  // Cache validation results
  cacheResults: true,

  // Custom error messages
  errorMessages: {
    required: '{field} is required',
    email: '{field} must be a valid email address',
    min: '{field} must be at least {min} characters',
    max: '{field} cannot exceed {max} characters',
    matches: '{field} format is invalid',
  },
}

export default config
```

## Testing

### Testing Validators

```typescript
import { v } from '@stacksjs/validation'
import { describe, it, expect } from 'bun:test'

describe('User Validation', () => {
  const userSchema = v.object({
    name: v.string().min(2).required(),
    email: v.string().email().required(),
  })

  it('validates correct user data', () => {
    const result = userSchema.validate({
      name: 'John Doe',
      email: 'john@example.com',
    })

    expect(result.valid).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = userSchema.validate({
      name: 'John Doe',
      email: 'invalid-email',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.email).toBeDefined()
  })

  it('rejects short name', () => {
    const result = userSchema.validate({
      name: 'J',
      email: 'john@example.com',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.name[0].message).toContain('at least 2')
  })

  it('validates using test() for quick checks', () => {
    const emailValidator = v.string().email()

    expect(emailValidator.test('valid@email.com')).toBe(true)
    expect(emailValidator.test('invalid')).toBe(false)
  })
})
```

## Performance Tips

1. **Reuse validators**: Create validators once and reuse them
2. **Use specific validators**: Use `v.integer()` instead of `v.number()` when possible
3. **Order rules efficiently**: Put most likely to fail rules first
4. **Use `.optional()`**: Skip validation for undefined optional fields
5. **Cache schemas**: Define schemas at module level, not in functions

```typescript
// Good - schema defined once
const userSchema = v.object({
  name: v.string().required(),
  email: v.string().email().required(),
})

function validateUser(data: unknown) {
  return userSchema.validate(data)
}

// Bad - schema recreated on every call
function validateUser(data: unknown) {
  const schema = v.object({
    name: v.string().required(),
    email: v.string().email().required(),
  })
  return schema.validate(data)
}
```

## Available Validators

| Type | Description |
|------|-------------|
| `v.string()` | String validation with min/max/email/url/matches |
| `v.text()` | Text content (longer strings) |
| `v.number()` | Number validation with min/max |
| `v.integer()` | Integer validation |
| `v.float()` | Floating point numbers |
| `v.decimal()` | Decimal precision numbers |
| `v.smallint()` | Small integers (-32,768 to 32,767) |
| `v.bigint()` | BigInt validation |
| `v.boolean()` | Boolean validation |
| `v.array()` | Array validation with each/min/max/length |
| `v.object()` | Object schema validation |
| `v.enum()` | Enum value validation |
| `v.date()` | Date object validation |
| `v.datetime()` | Datetime validation |
| `v.time()` | Time string validation (HH:MM) |
| `v.timestamp()` | Timestamp validation |
| `v.timestampTz()` | Timestamp with timezone |
| `v.unix()` | Unix timestamp |
| `v.json()` | JSON string validation |
| `v.password()` | Password validation with security rules |
| `v.binary()` | Binary data validation |
| `v.blob()` | Blob validation |
| `v.custom()` | Custom validation function |
