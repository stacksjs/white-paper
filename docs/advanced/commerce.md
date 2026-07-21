---
title: E-Commerce
description: Build online stores and payment systems with Stacks.js Commerce
---

# E-Commerce

Stacks.js Commerce provides a complete toolkit for building online stores, handling payments, managing inventory, and processing orders.

## Configuration

### Commerce Configuration

```typescript
// config/commerce.ts
export default {
  // Currency settings
  currency: {
    default: 'USD',
    supported: ['USD', 'EUR', 'GBP', 'CAD'],
    locale: 'en-US',
  },

  // Tax configuration
  tax: {
    enabled: true,
    inclusive: false, // Tax included in price?
    defaultRate: 0.0, // Will be calculated per region
    provider: 'taxjar', // 'taxjar' | 'avalara' | 'manual'
  },

  // Inventory settings
  inventory: {
    trackStock: true,
    allowBackorders: false,
    lowStockThreshold: 10,
    reservationTimeout: 15, // minutes
  },

  // Shipping
  shipping: {
    providers: ['ups', 'fedex', 'usps'],
    freeShippingThreshold: 100,
    defaultMethod: 'standard',
  },

  // Payment providers
  payments: {
    default: 'stripe',
    providers: {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: 'sandbox', // 'sandbox' | 'live'
      },
    },
  },

  // Checkout settings
  checkout: {
    guestCheckout: true,
    requirePhone: false,
    requireShipping: true,
    termsRequired: true,
  },

  // Order settings
  orders: {
    numberPrefix: 'ORD-',
    numberLength: 8,
    statuses: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  },
}
```

## Products

### Product Model

```typescript
// app/Models/Product.ts
import { Model } from '@stacksjs/orm'
import { Commerce } from '@stacksjs/commerce'

export default class Product extends Model {
  use = [Commerce.Purchasable]

  static fields = {
    name: { type: 'string', required: true },
    slug: { type: 'string', unique: true },
    description: { type: 'text' },
    price: { type: 'decimal', precision: 10, scale: 2 },
    compare_at_price: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    cost: { type: 'decimal', precision: 10, scale: 2, nullable: true },
    sku: { type: 'string', unique: true },
    barcode: { type: 'string', nullable: true },
    weight: { type: 'decimal', nullable: true },
    weight_unit: { type: 'enum', values: ['g', 'kg', 'oz', 'lb'], default: 'g' },
    status: { type: 'enum', values: ['draft', 'active', 'archived'], default: 'draft' },
    featured: { type: 'boolean', default: false },
    taxable: { type: 'boolean', default: true },
    requires_shipping: { type: 'boolean', default: true },
  }

  // Relationships
  static relationships = {
    categories: { type: 'belongsToMany', model: 'Category' },
    variants: { type: 'hasMany', model: 'ProductVariant' },
    images: { type: 'hasMany', model: 'ProductImage' },
    reviews: { type: 'hasMany', model: 'Review' },
  }

  // Computed properties
  get isOnSale() {
    return this.compare_at_price && this.compare_at_price > this.price
  }

  get discount() {
    if (!this.isOnSale) return 0
    return Math.round((1 - this.price / this.compare_at_price) * 100)
  }

  get formattedPrice() {
    return Commerce.formatPrice(this.price)
  }
}
```

### Product Variants

```typescript
// app/Models/ProductVariant.ts
export default class ProductVariant extends Model {
  static fields = {
    product_id: { type: 'foreignId', references: 'products' },
    name: { type: 'string' },
    sku: { type: 'string', unique: true },
    price: { type: 'decimal', precision: 10, scale: 2 },
    stock_quantity: { type: 'integer', default: 0 },
    options: { type: 'json' }, // { color: 'Red', size: 'Large' }
  }

  get inStock() {
    return this.stock_quantity > 0
  }
}
```

### Managing Products

```typescript
import { Product } from '@/Models/Product'

// Create product
const product = await Product.create({
  name: 'Premium T-Shirt',
  slug: 'premium-t-shirt',
  description: 'Comfortable cotton t-shirt',
  price: 29.99,
  compare_at_price: 39.99,
  sku: 'TSHIRT-001',
  status: 'active',
})

// Add variants
await product.variants().createMany([
  { name: 'Small / Red', sku: 'TSHIRT-001-S-R', price: 29.99, stock_quantity: 50, options: { size: 'S', color: 'Red' } },
  { name: 'Medium / Red', sku: 'TSHIRT-001-M-R', price: 29.99, stock_quantity: 75, options: { size: 'M', color: 'Red' } },
  { name: 'Large / Red', sku: 'TSHIRT-001-L-R', price: 29.99, stock_quantity: 60, options: { size: 'L', color: 'Red' } },
])

// Add images
await product.images().create({
  url: '/images/products/tshirt-001.jpg',
  alt: 'Premium T-Shirt - Red',
  position: 1,
})

// Add to categories
await product.categories().attach([categoryId1, categoryId2])
```

## Shopping Cart

### Cart Operations

```typescript
import { Cart } from '@stacksjs/commerce'

// Get or create cart
const cart = await Cart.current(request) // Uses session/cookie

// Add item to cart
await cart.add({
  productId: product.id,
  variantId: variant.id,
  quantity: 2,
})

// Update quantity
await cart.updateQuantity(lineItemId, 3)

// Remove item
await cart.remove(lineItemId)

// Clear cart
await cart.clear()

// Get cart contents
const items = await cart.items()
const subtotal = await cart.subtotal()
const total = await cart.total()
const itemCount = await cart.count()

// Apply discount code
await cart.applyDiscount('SAVE20')

// Remove discount
await cart.removeDiscount()
```

### Cart API Endpoints

```typescript
// routes/api.ts
router.group({ prefix: '/cart' }, () => {
  router.get('/', CartController.show)
  router.post('/items', CartController.addItem)
  router.put('/items/:id', CartController.updateItem)
  router.delete('/items/:id', CartController.removeItem)
  router.post('/discount', CartController.applyDiscount)
  router.delete('/discount', CartController.removeDiscount)
})

// app/Controllers/CartController.ts
export default {
  async show(request: Request) {
    const cart = await Cart.current(request)

    return {
      items: await cart.items(),
      subtotal: await cart.subtotal(),
      discount: await cart.discount(),
      tax: await cart.tax(),
      shipping: await cart.shipping(),
      total: await cart.total(),
    }
  },

  async addItem(request: Request) {
    const { productId, variantId, quantity } = await request.validate({
      productId: 'required|exists:products,id',
      variantId: 'exists:product_variants,id',
      quantity: 'required|integer|min:1',
    })

    const cart = await Cart.current(request)
    await cart.add({ productId, variantId, quantity })

    return { success: true, cart: await cart.toJSON() }
  },
}
```

## Checkout

### Checkout Flow

```typescript
import { Checkout } from '@stacksjs/commerce'

// Initialize checkout from cart
const checkout = await Checkout.fromCart(cart)

// Set customer information
await checkout.setCustomer({
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
})

// Set shipping address
await checkout.setShippingAddress({
  line1: '123 Main St',
  line2: 'Apt 4',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
})

// Get available shipping methods
const shippingMethods = await checkout.getShippingMethods()

// Select shipping method
await checkout.setShippingMethod(shippingMethods[0].id)

// Set billing address (or use shipping)
await checkout.setBillingAddress(shippingAddress)
// Or: await checkout.useSameAddress()

// Calculate totals
const summary = await checkout.summary()
// { subtotal, discount, shipping, tax, total }

// Create payment intent
const paymentIntent = await checkout.createPaymentIntent()

// Complete checkout (after payment confirmation)
const order = await checkout.complete(paymentIntentId)
```

### Checkout Controller

```typescript
// app/Controllers/CheckoutController.ts
export default {
  async show(request: Request) {
    const cart = await Cart.current(request)

    if (await cart.isEmpty()) {
      return redirect('/cart')
    }

    const checkout = await Checkout.fromCart(cart)

    return view('checkout', { checkout })
  },

  async process(request: Request) {
    const data = await request.validate({
      email: 'required|email',
      shipping: 'required|object',
      billing: 'object',
      shippingMethod: 'required|string',
    })

    const cart = await Cart.current(request)
    const checkout = await Checkout.fromCart(cart)

    await checkout.setCustomer({ email: data.email })
    await checkout.setShippingAddress(data.shipping)
    await checkout.setShippingMethod(data.shippingMethod)

    if (data.billing) {
      await checkout.setBillingAddress(data.billing)
    } else {
      await checkout.useSameAddress()
    }

    // Create payment intent
    const { clientSecret } = await checkout.createPaymentIntent()

    return { clientSecret, checkoutId: checkout.id }
  },

  async complete(request: Request) {
    const { checkoutId, paymentIntentId } = request.body

    const checkout = await Checkout.find(checkoutId)
    const order = await checkout.complete(paymentIntentId)

    // Clear cart
    const cart = await Cart.current(request)
    await cart.clear()

    // Send confirmation email
    await order.sendConfirmation()

    return { order: order.toJSON() }
  },
}
```

## Payments

### Stripe Integration

```typescript
import { Payment } from '@stacksjs/commerce'

// Create payment intent
const intent = await Payment.stripe().createIntent({
  amount: 2999, // in cents
  currency: 'usd',
  metadata: { orderId: order.id },
})

// Confirm payment
const result = await Payment.stripe().confirmIntent(intentId)

// Capture payment (for manual capture)
await Payment.stripe().capture(intentId)

// Refund payment
await Payment.stripe().refund(paymentIntentId, {
  amount: 1000, // Partial refund
  reason: 'customer_request',
})
```

### Stripe Webhooks

```typescript
// routes/api.ts
router.post('/webhooks/stripe', StripeWebhookController.handle)

// app/Controllers/StripeWebhookController.ts
import { Payment } from '@stacksjs/commerce'

export default {
  async handle(request: Request) {
    const event = await Payment.stripe().constructWebhookEvent(
      request.body,
      request.headers.get('stripe-signature'),
    )

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break

      case 'charge.refunded':
        await handleRefund(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break
    }

    return { received: true }
  },
}

async function handlePaymentSuccess(paymentIntent) {
  const order = await Order.where('payment_intent_id', paymentIntent.id).first()

  if (order) {
    await order.update({ status: 'processing', paid_at: new Date() })
    await order.sendConfirmation()
    await order.reduceInventory()
  }
}
```

### PayPal Integration

```typescript
import { Payment } from '@stacksjs/commerce'

// Create PayPal order
const paypalOrder = await Payment.paypal().createOrder({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: {
      currency_code: 'USD',
      value: '29.99',
    },
  }],
})

// Capture payment after approval
const capture = await Payment.paypal().captureOrder(paypalOrderId)
```

## Orders

### Order Model

```typescript
// app/Models/Order.ts
export default class Order extends Model {
  static fields = {
    number: { type: 'string', unique: true },
    customer_id: { type: 'foreignId', references: 'customers', nullable: true },
    email: { type: 'string' },
    status: { type: 'string', default: 'pending' },
    subtotal: { type: 'decimal', precision: 10, scale: 2 },
    discount_total: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    shipping_total: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    tax_total: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    total: { type: 'decimal', precision: 10, scale: 2 },
    currency: { type: 'string', default: 'USD' },
    shipping_address: { type: 'json' },
    billing_address: { type: 'json' },
    payment_method: { type: 'string' },
    payment_intent_id: { type: 'string', nullable: true },
    paid_at: { type: 'datetime', nullable: true },
    shipped_at: { type: 'datetime', nullable: true },
    delivered_at: { type: 'datetime', nullable: true },
    notes: { type: 'text', nullable: true },
  }

  static relationships = {
    customer: { type: 'belongsTo', model: 'Customer' },
    items: { type: 'hasMany', model: 'OrderItem' },
    transactions: { type: 'hasMany', model: 'Transaction' },
    shipments: { type: 'hasMany', model: 'Shipment' },
  }

  // Generate order number
  static boot() {
    this.creating(async (order) => {
      order.number = await Order.generateNumber()
    })
  }

  static async generateNumber() {
    const prefix = config('commerce.orders.numberPrefix')
    const lastOrder = await Order.orderBy('id', 'desc').first()
    const nextNumber = (lastOrder?.id || 0) + 1
    return `${prefix}${String(nextNumber).padStart(8, '0')}`
  }

  async sendConfirmation() {
    await Mail.to(this.email).send(new OrderConfirmation(this))
  }

  async reduceInventory() {
    for (const item of await this.items) {
      if (item.variant_id) {
        await ProductVariant.where('id', item.variant_id)
          .decrement('stock_quantity', item.quantity)
      }
    }
  }
}
```

### Order Management

```typescript
// Fetch orders
const orders = await Order.with('items', 'customer')
  .orderBy('created_at', 'desc')
  .paginate(20)

// Update order status
await order.update({ status: 'processing' })

// Create shipment
const shipment = await order.shipments().create({
  carrier: 'ups',
  tracking_number: '1Z999AA10123456784',
  shipped_at: new Date(),
})

// Mark as shipped
await order.update({
  status: 'shipped',
  shipped_at: new Date(),
})

// Send shipping notification
await Mail.to(order.email).send(new ShipmentNotification(order, shipment))

// Process refund
const refund = await order.refund({
  amount: order.total,
  reason: 'Customer request',
})
```

## Inventory

### Stock Management

```typescript
import { Inventory } from '@stacksjs/commerce'

// Check stock
const available = await Inventory.available(variantId)
const reserved = await Inventory.reserved(variantId)

// Reserve stock (during checkout)
const reservation = await Inventory.reserve(variantId, quantity, {
  expiresIn: 15 * 60, // 15 minutes
  reference: checkoutId,
})

// Commit reservation (after payment)
await Inventory.commit(reservation.id)

// Release reservation (if checkout abandoned)
await Inventory.release(reservation.id)

// Adjust stock
await Inventory.adjust(variantId, -5, 'Damaged goods')
await Inventory.adjust(variantId, 100, 'New shipment received')

// Get stock history
const history = await Inventory.history(variantId)
```

### Low Stock Alerts

```typescript
// app/Jobs/CheckLowStock.ts
export default {
  schedule: '0 9 * * *', // Daily at 9 AM

  async handle() {
    const lowStock = await ProductVariant
      .where('stock_quantity', '<=', config('commerce.inventory.lowStockThreshold'))
      .with('product')
      .get()

    if (lowStock.length > 0) {
      await Mail.to('inventory@example.com')
        .send(new LowStockAlert(lowStock))
    }
  },
}
```

## Discounts & Coupons

### Creating Discounts

```typescript
import { Discount } from '@stacksjs/commerce'

// Percentage discount
const discount = await Discount.create({
  code: 'SAVE20',
  type: 'percentage',
  value: 20,
  minOrderAmount: 50,
  maxUses: 1000,
  startsAt: new Date(),
  expiresAt: new Date('2024-12-31'),
})

// Fixed amount discount
await Discount.create({
  code: 'FLAT10',
  type: 'fixed',
  value: 10,
  currency: 'USD',
})

// Free shipping
await Discount.create({
  code: 'FREESHIP',
  type: 'free_shipping',
})

// Product-specific discount
await Discount.create({
  code: 'TSHIRT15',
  type: 'percentage',
  value: 15,
  applicableProducts: [productId1, productId2],
})
```

### Applying Discounts

```typescript
// In cart
await cart.applyDiscount('SAVE20')

// Validate discount
const validation = await Discount.validate('SAVE20', cart)
if (!validation.valid) {
  console.log(validation.error) // 'Minimum order amount not met'
}

// Calculate discount amount
const discountAmount = await Discount.calculate('SAVE20', cart)
```

## Subscriptions

### Subscription Products

```typescript
import { Subscription } from '@stacksjs/commerce'

// Create subscription plan
const plan = await Subscription.createPlan({
  name: 'Monthly Box',
  slug: 'monthly-box',
  price: 29.99,
  interval: 'month',
  intervalCount: 1,
  trialDays: 14,
})

// Subscribe customer
const subscription = await Subscription.create({
  customerId: customer.id,
  planId: plan.id,
  paymentMethodId: paymentMethod.id,
})

// Manage subscription
await subscription.pause()
await subscription.resume()
await subscription.cancel()
await subscription.cancelAtPeriodEnd()

// Change plan
await subscription.changePlan(newPlanId)

// Update payment method
await subscription.updatePaymentMethod(newPaymentMethodId)
```

## Taxes

### Tax Calculation

```typescript
import { Tax } from '@stacksjs/commerce'

// Calculate tax for order
const taxAmount = await Tax.calculate({
  subtotal: 100,
  shippingAddress: {
    state: 'CA',
    postalCode: '90210',
    country: 'US',
  },
  items: cart.items,
})

// Get tax rate for location
const rate = await Tax.rateFor({
  state: 'CA',
  city: 'Los Angeles',
  country: 'US',
})
```

## Reporting

### Sales Reports

```typescript
import { Commerce } from '@stacksjs/commerce'

// Sales summary
const summary = await Commerce.reports.sales({
  from: startDate,
  to: endDate,
})
// { totalSales, orderCount, averageOrderValue, ... }

// Best selling products
const topProducts = await Commerce.reports.topProducts({
  limit: 10,
  period: 'month',
})

// Revenue by category
const byCategory = await Commerce.reports.revenueByCategory({
  period: 'year',
})

// Customer acquisition
const customers = await Commerce.reports.customerAcquisition({
  period: 'month',
})
```
