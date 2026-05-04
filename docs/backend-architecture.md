# Backend Architecture

This document provides a detailed walkthrough of the Express.js API located in `apps/api/`. It is written to be educational — if you're new to the codebase, start here.

---

## Folder Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma             # Database schema — all models, enums, relations
│   └── seed.ts                   # Demo data seeder — restaurants, categories, products, options
├── public/
│   └── images/                   # Static product images served via /images/*
├── src/
│   ├── server.ts                 # Entry point — loads env, starts HTTP server
│   ├── app.ts                    # Express app — middleware stack, route mounting
│   ├── config/
│   │   └── env.ts                # Zod-validated environment variables (fail-fast on missing)
│   ├── libs/
│   │   └── prisma.ts             # Singleton PrismaClient (globalThis pattern for dev hot-reload)
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # JWT verification, req.user population, role checking
│   │   ├── validation.middleware.ts  # Zod schema validation for body/query/params
│   │   └── error.middleware.ts   # Global error handler (ApiError, ZodError, Prisma errors)
│   ├── modules/
│   │   ├── auth/                 # Authentication (register, login, refresh, me)
│   │   ├── users/                # User profile (list, get, update)
│   │   ├── restaurants/          # Restaurant listing
│   │   ├── categories/           # Category listing
│   │   ├── products/             # Product listing and detail
│   │   ├── cart/                 # Persistent cart (CRUD)
│   │   ├── orders/               # Order creation and listing
│   │   └── addresses/            # Delivery address management
│   └── utils/
│       ├── api-error.ts          # Custom error class + factory functions
│       ├── jwt.ts                # Token generation and verification
│       └── password.ts           # bcrypt hash and compare
└── package.json                  # Scripts, dependencies
```

---

## Module System

Each API module follows a consistent pattern:

```
modules/auth/
├── auth.route.ts           # Express Router — endpoint definitions
├── auth.controller.ts      # Request/response handlers (HTTP layer)
├── auth.service.ts         # Business logic (database, hashing, tokens)
└── auth.validation.ts      # Zod schema imports from @garnish/shared
```

### Why This Separation?

| Layer | Responsibility | Knows About |
|-------|---------------|-------------|
| **Route** | URL mapping, middleware chaining | Express Router, middleware functions |
| **Controller** | HTTP request/response handling | req, res, service functions |
| **Service** | Business logic, data access | Prisma, utils (jwt, password, api-error) |
| **Validation** | Input schema definitions | Zod, @garnish/shared |

This separation means:
- **Services are testable** without HTTP — you can call `loginUser({ email, password })` directly.
- **Controllers are thin** — they only translate HTTP to service calls and format responses.
- **Validation is centralized** — changing a schema in `@garnish/shared` updates both frontend and backend.

> Not all modules have all four files. Simpler modules (categories, restaurants) use inline route handlers since they don't have complex business logic.

---

## Request Lifecycle

Here's what happens when a request hits the server:

```
Client Request
    │
    ▼
1. Helmet (security headers)
2. CORS (origin check)
3. express.json() (body parsing)
4. Rate Limiter (100 req / 15 min per IP)
    │
    ▼
5. Router Match (/api/v1/auth, /api/v1/cart, etc.)
    │
    ▼
6. Route-level Middleware (in order):
   a. validate({ body: schema })  → Zod parse, throws ZodError
   b. authenticate                → JWT verify, loads user from DB
    │
    ▼
7. Controller / Route Handler
   → calls service functions
   → sends JSON response
    │
    ▼
8. Error Middleware (if any middleware or handler threw/called next(error))
   → maps error type to HTTP status
   → sends error JSON response
```

---

## Authentication System

### Token Architecture

The app uses a **dual-token** system:

| Token | Lifetime | Secret | Purpose |
|-------|----------|--------|---------|
| Access Token | 15 minutes | `JWT_SECRET` | Sent with every API request |
| Refresh Token | 7 days | `JWT_REFRESH_SECRET` | Used only to get new access tokens |

### Why Two Tokens?

- **Short-lived access tokens** limit the damage window if a token is stolen.
- **Long-lived refresh tokens** avoid forcing users to re-login every 15 minutes.
- **Separate secrets** mean compromising one key doesn't compromise the other.

### Auth Middleware (`auth.middleware.ts`)

This is the most critical middleware. It:

1. Extracts the Bearer token from the `Authorization` header.
2. Verifies the JWT signature and expiration using `jsonwebtoken`.
3. Looks up the user in the database by the `userId` from the token payload.
4. Attaches the user object to `req.user` for downstream handlers.
5. Maps JWT-specific errors (`JsonWebTokenError`, `TokenExpiredError`) to user-friendly 401 responses.

The `requireRole()` factory creates middleware that checks `req.user.role` against a list of allowed roles.

### Password Security (`password.ts`)

- Uses **bcrypt** with 12 salt rounds.
- Salt rounds determine computational cost — 12 is the recommended balance between security and speed.
- The same password produces different hashes (due to random salt), making rainbow table attacks ineffective.

---

## Validation System

### How It Works

1. Zod schemas are defined in `@garnish/shared` (e.g., `loginSchema`, `createOrderSchema`).
2. The `validate()` middleware factory accepts schemas for `body`, `query`, and/or `params`.
3. On success: parsed/transformed data replaces `req.body` (strip unknown fields, apply transforms).
4. On failure: `ZodError` is thrown → caught by error middleware → returned as field-level error messages.

### Example Flow

```typescript
// In route definition:
router.post("/register", validate({ body: registerSchema }), authController.register);

// registerSchema (from @garnish/shared):
z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
})

// If validation fails, client receives:
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Invalid email"],
    "password": ["String must contain at least 6 character(s)"]
  }
}
```

---

## Error Handling

All errors flow through the global error middleware (`error.middleware.ts`). This centralizes error formatting:

| Error Type | HTTP Status | When It Happens |
|------------|------------|-----------------|
| `ApiError` (custom) | Varies (400-409) | `throw unauthorized()`, `throw notFound()`, etc. |
| `ZodError` | 400 | Validation middleware rejects input |
| Prisma `P2002` | 409 | Unique constraint violation (duplicate email, etc.) |
| Prisma `P2025` | 404 | Record not found during update/delete |
| Other | 500 | Unexpected errors (details hidden in production) |

### ApiError Factory Functions

```typescript
throw badRequest("Invalid input");        // 400
throw unauthorized("Invalid token");      // 401
throw forbidden("Admin only");            // 403
throw notFound("User not found");         // 404
throw conflict("Email already exists");   // 409
```

---

## Prisma Usage

### Singleton Client (`prisma.ts`)

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Why globalThis?** In development, `tsx watch` reloads modules on file change. Without the global reference, each reload creates a new `PrismaClient`, exhausting the database connection pool.

### Common Query Patterns

**Select (exclude sensitive fields):**
```typescript
prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, name: true }, // password is never included
});
```

**Upsert (create or update):**
```typescript
prisma.cart.upsert({
  where: { userId },
  create: { userId },
  update: {},
  include: { items: { include: { product: true } } },
});
```

**Nested create (order with items and options):**
```typescript
prisma.order.create({
  data: {
    userId, restaurantId, totalPrice,
    items: {
      create: items.map(item => ({
        productId: item.id, quantity: item.qty,
        options: {
          create: item.options.map(opt => ({ name: opt.name, price: opt.price })),
        },
      })),
    },
  },
});
```

**Filtered queries:**
```typescript
prisma.product.findMany({
  where: {
    isAvailable: true,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  },
});
```

---

## Database Schema

### Models Overview

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| `User` | Authentication, profile | Has one Cart, many Orders, Addresses, Favorites |
| `Cart` | Persistent shopping cart | Belongs to User, has many CartItems |
| `CartItem` | Single product in cart | Belongs to Cart and Product, has CartItemOptions |
| `CartItemOption` | Selected topping/side for cart item | Belongs to CartItem |
| `Product` | Menu item | Belongs to Restaurant and Category, has ProductOptions |
| `ProductOption` | Available customization | Belongs to Product, typed as TOPPING/SIDE/SIZE/EXTRA |
| `Order` | Placed order | Belongs to User, Restaurant, Address; has OrderItems |
| `OrderItem` | Product in an order | Snapshot of product name/price at order time |
| `OrderItemOption` | Selected option in order | Snapshot of option name/price at order time |
| `Restaurant` | Food provider | Has many Products and Orders |
| `Category` | Product grouping | Has many Products |
| `Address` | Delivery location | Belongs to User, referenced by Orders |
| `Favorite` | User's saved products | Unique constraint on [userId, productId] |

### Key Design Decisions

- **UUID primary keys:** Globally unique, safe for distributed systems, no sequential guessing.
- **Cascade deletes:** Deleting a user removes their cart, orders, addresses, and favorites automatically.
- **Order snapshots:** OrderItem stores `name` and `price` at order time — if the product price changes later, historical orders aren't affected.
- **Separate Cart and Order models:** Cart is mutable (add/remove/update). Orders are immutable once created.

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | USER, ADMIN, RESTAURANT_OWNER |
| `OrderStatus` | PENDING, CONFIRMED, PREPARING, READY, ON_THE_WAY, DELIVERED, CANCELLED |
| `PaymentMethod` | CASH, CREDIT_CARD, DEBIT_CARD |
| `PaymentStatus` | PENDING, COMPLETED, FAILED, REFUNDED |
| `OptionType` | SIDE, TOPPING, SIZE, EXTRA |

---

## Static File Serving

Product images are stored in `public/images/` and served via Express static middleware:

```typescript
app.use("/images", express.static(path.join(__dirname, "../public/images"), { maxAge: "7d" }));
```

- `crossOriginResourcePolicy: "cross-origin"` in Helmet allows the mobile app to fetch images.
- Database stores relative paths (e.g., `/images/burger.png`). The mobile app prepends the server base URL.

---

## Environment Configuration (`env.ts`)

Uses Zod to validate environment variables at startup:

- If any required variable is missing → the process exits immediately with a clear error message.
- Provides TypeScript types for all env values — no `process.env.PORT as string` casting needed.
- Default values are set for non-critical variables (`NODE_ENV`, `PORT`, `JWT_EXPIRES_IN`).

---

## Troubleshooting

### Prisma Generate File Lock (Windows)

**Problem:** `EPERM: operation not permitted, rename query_engine-windows.dll.node`

**Cause:** The Prisma query engine DLL is loaded by the running Node.js process. Windows locks loaded DLLs, preventing overwrite.

**Solution:** Always stop the dev server (`Ctrl+C`) before running `npm run db:generate` or `npx prisma generate`.

### Connection Pool Exhaustion

**Problem:** `Too many clients already` or similar database errors.

**Cause:** Multiple `PrismaClient` instances created during development hot-reload.

**Solution:** The singleton pattern in `prisma.ts` prevents this. Never create `new PrismaClient()` outside of `libs/prisma.ts`.
