# Full-Stack Architecture

This document provides a system-level overview of the Garnish App, covering the monorepo structure, communication patterns, and end-to-end data flows.

---

## Monorepo Design

The project uses **npm workspaces** to manage three packages:

| Package | Path | Role |
|---------|------|------|
| `@garnish/api` | `apps/api` | Express REST API serving data and images |
| `@garnish/mobile` | `apps/mobile` | Expo React Native mobile client |
| `@garnish/shared` | `packages/shared` | Shared types, Zod schemas, enums, constants |

### Why a Monorepo?

- **Type safety across the stack:** A single `Product` type or `loginSchema` is defined once in `@garnish/shared` and used by both frontend and backend. No drift.
- **Shared validation:** Zod schemas validate data on the backend (middleware) and provide TypeScript types on the frontend — one source of truth.
- **Simplified development:** One `npm install`, one git repo, unified versioning.

### Dependency Graph

```
@garnish/mobile ──imports──→ @garnish/shared
@garnish/api    ──imports──→ @garnish/shared
```

Mobile and API never import from each other. They communicate exclusively via HTTP.

---

## Data Flow

```
┌────────────┐     HTTP/JSON      ┌────────────┐     Prisma ORM     ┌──────────────┐
│   Mobile    │ ◄───────────────► │   Express   │ ◄───────────────► │  PostgreSQL   │
│  (Expo RN)  │   Authorization   │    API      │   SQL Queries     │  (Neon/Local) │
└────────────┘   Bearer JWT       └────────────┘                    └──────────────┘
      │                                 │
      │  Zustand (auth, cart)           │  Static files (/images)
      │  React Query (products)         │
      ▼                                 ▼
  Local State                     public/images/
```

1. **Mobile → API:** Axios HTTP client with JWT auth header. Requests go to `/api/v1/*`.
2. **API → Database:** Prisma ORM translates TypeScript queries to SQL. UUID primary keys throughout.
3. **API → Mobile (images):** Product images are served as static files from `/images/*` with a 7-day cache header.
4. **Shared package:** Provides `API_ROUTES` constants so both sides reference the same paths.

---

## Authentication Flow

```
1. User submits email + password
2. API validates with Zod → auth.service hashes/compares with bcrypt
3. On success: generates access token (15min) + refresh token (7 days)
4. Mobile stores both tokens in expo-secure-store
5. Every API request: Axios interceptor attaches Authorization: Bearer <access>
6. On 401: interceptor automatically calls /auth/refresh with the refresh token
7. If refresh fails: user is signed out, redirected to sign-in
```

### Token Security

- Access and refresh tokens use **separate secret keys** — compromising one doesn't affect the other.
- Tokens contain only `userId` — no sensitive data in the payload.
- Passwords are hashed with bcrypt (12 salt rounds) — never stored as plain text.

---

## Cart Flow (Persistent)

The cart is persisted in the database, tied to the user via a 1:1 `User ↔ Cart` relationship.

```
1. App startup → fetchAuthenticatedUser() → fetchCart()
2. User adds product → POST /cart/add → backend creates/updates CartItem
3. Backend returns full cart with product details → local state updated
4. User changes quantity → PUT /cart/update → backend updates
5. Logout/login → cart is preserved in DB → fetched on next login
```

### Why Backend-Persisted Cart?

- Survives app reinstalls, device changes, logout/login cycles.
- Single source of truth — no sync conflicts between local and server state.
- Frontend uses optimistic updates for instant UI feedback, reconciles with server response.

---

## Order Flow

```
1. User taps "Order Now" from cart screen
2. Frontend sends items, address, payment method to POST /orders
3. Backend validates:
   - Address belongs to user
   - All products exist, are available, belong to same restaurant
   - Product options are valid
4. Backend calculates prices from DB (never trusts client prices)
5. Creates Order → OrderItems → OrderItemOptions in a single nested Prisma write
6. Returns complete order with restaurant and address details
```

---

## State Management Strategy

| Tool | Purpose | Scope |
|------|---------|-------|
| **Zustand** | Auth state (user, tokens, loading) | Global, persistent across screens |
| **Zustand** | Cart state (items, quantities, totals) | Global, synced with backend |
| **React Query** | Server data (products, categories) | Per-screen, with caching and stale-while-revalidate |

### Why This Split?

- **Zustand for auth/cart:** These need to be accessible everywhere (tab bar badge, headers, any screen). Zustand is lightweight and doesn't require a provider.
- **React Query for server data:** Products and categories are read-heavy, cache-friendly data. React Query handles caching, background refetching, and loading states out of the box.

---

## API Communication

All API calls go through a centralized Axios instance (`api-client.ts`):

- **Base URL** from `EXPO_PUBLIC_API_URL` environment variable.
- **Request interceptor** attaches `Authorization: Bearer <token>` to every request.
- **Response interceptor** catches 401, attempts token refresh, retries the original request.
- **Service modules** (`auth.service.ts`, `cart.service.ts`, etc.) wrap Axios calls with typed responses.
- **Image URLs** from the backend are relative paths (`/images/burger.png`). The frontend resolves them to absolute URLs using the server base URL.

---

## Database Relationships

```
User ──1:1── Cart ──1:N── CartItem ──1:N── CartItemOption
                          CartItem ──N:1── Product

User ──1:N── Order ──1:N── OrderItem ──1:N── OrderItemOption
User ──1:N── Address
User ──1:N── Favorite

Restaurant ──1:N── Product ──1:N── ProductOption
Category   ──1:N── Product

Order ──N:1── Restaurant
Order ──N:1── Address (delivery)
```

- All primary keys are UUIDs.
- Foreign keys have indexes for query performance.
- Cascade deletes are used where parent-child relationships are strict (e.g., deleting a user cascades to their cart, orders, addresses).
