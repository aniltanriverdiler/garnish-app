# Garnish App

A full-stack food ordering mobile application built with React Native (Expo) and Express.js. Uses PostgreSQL with Prisma ORM for data persistence and a monorepo architecture with a shared type/schema package.

> **Türkçe dokümantasyon için:** [READMETR.md](./READMETR.md)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native, Expo, Expo Router |
| **Styling** | NativeWind v4, Tailwind CSS |
| **State** | Zustand (client), TanStack React Query (server) |
| **API Client** | Axios with interceptors |
| **Backend** | Express.js 5, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | JWT (access + refresh tokens) |
| **Validation** | Zod (shared schemas) |
| **Monitoring** | Sentry |

---

## Monorepo Structure

```
garnish-app/
├── apps/
│   ├── api/                  # Express.js REST API
│   └── mobile/               # React Native (Expo) mobile app
├── packages/
│   └── shared/               # Shared types, schemas, enums, constants
├── package.json              # Workspace root
└── README.md
```

The `@garnish/shared` package is consumed by both `@garnish/api` and `@garnish/mobile`, ensuring type safety and validation consistency across the stack.

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database (Neon, Supabase, or local)
- Android Emulator or iOS Simulator

### Installation

```bash
# Install dependencies (from project root)
npm install

# Build the shared package
cd packages/shared && npm run build && cd ../..
```

### Environment Variables

Create `.env` files for both the API and mobile app:

#### API (`apps/api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Access token signing key | — |
| `JWT_REFRESH_SECRET` | Refresh token signing key | — |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `CORS_ORIGIN` | Allowed origins (comma-separated or `*`) | `*` |

#### Mobile (`apps/mobile/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `http://192.168.1.5:3000/api/v1` |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | — |

### Database Setup

```bash
cd apps/api

# Push schema to database
npx prisma db push

# Generate Prisma Client
npm run db:generate

# Seed demo data (optional)
npm run db:seed
```

### Running the App

```bash
# Start the API server (from apps/api)
npm run dev

# Start the mobile app (from apps/mobile)
npx expo start
```

> **Note:** Stop the API server before running `prisma generate` to avoid file lock errors on Windows. The Prisma query engine DLL cannot be overwritten while the server process holds it.

---

## Scripts

### API (`apps/api`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled output |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and apply migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed demo data |

---

## Architecture Overview

### API

Modular architecture — each resource (auth, products, cart, orders) has its own folder under `src/modules/` with route, controller, service, and validation files.

```
src/
├── config/env.ts           # Zod-validated environment variables
├── libs/prisma.ts          # Singleton PrismaClient
├── middlewares/             # Auth, validation, error handling
├── modules/
│   ├── auth/               # Register, login, refresh, me
│   ├── cart/               # Persistent user cart (CRUD)
│   ├── orders/             # Order creation with server-side pricing
│   ├── products/           # Product listing and detail
│   ├── categories/         # Category listing
│   ├── restaurants/        # Restaurant listing
│   ├── users/              # User profile
│   └── addresses/          # Delivery addresses
└── utils/                  # JWT, bcrypt, ApiError helpers
```

### Mobile

File-based routing with Expo Router. Zustand for client state (auth, cart), React Query for server state (products, categories).

```
app/
├── (auth)/                 # Sign in, sign up (protected by auth layout)
├── (tabs)/                 # Home, search, cart, profile (tab navigation)
├── product/[id].tsx        # Product detail with toppings/sides
├── login-success.tsx       # Post-login confirmation
└── _layout.tsx             # Root layout (fonts, providers, auth restore)

src/
├── components/             # Shared + UI components
├── services/               # API client and service modules
├── store/                  # Zustand stores (auth, cart)
├── constants/              # Image imports, option maps
└── theme/                  # Design tokens
```

### Key Flows

- **Auth:** JWT access + refresh tokens, secure storage, automatic refresh on 401
- **Cart:** Backend-persisted, survives logout/login cycles, optimistic UI updates
- **Orders:** Server-side price validation, nested Prisma writes
- **Tab Bar Badge:** Real-time cart item count from Zustand store

---

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login |
| POST | `/auth/refresh` | — | Refresh tokens |
| GET | `/auth/me` | Yes | Current user |
| GET | `/products` | — | List products (filters: search, categoryId) |
| GET | `/products/:id` | — | Product detail |
| GET | `/categories` | — | List categories |
| GET | `/restaurants` | — | List restaurants |
| GET | `/cart` | Yes | Get cart |
| POST | `/cart/add` | Yes | Add to cart |
| PUT | `/cart/update` | Yes | Update quantity |
| DELETE | `/cart/:productId` | Yes | Remove from cart |
| DELETE | `/cart` | Yes | Clear cart |
| POST | `/orders` | Yes | Create order |
| GET | `/orders` | Yes | List orders |
| GET | `/orders/:id` | Yes | Order detail |
| GET | `/addresses` | Yes | List addresses |
| POST | `/addresses` | Yes | Add address |
| PATCH | `/addresses/:id` | Yes | Update address |
| DELETE | `/addresses/:id` | Yes | Delete address |

---

## Documentation

- [Full-Stack Architecture](./docs/full-stack-architecture.md) — System overview and data flows
- [Frontend Architecture](./docs/frontend-architecture.md) — Mobile app structure
- [Backend Architecture](./docs/backend-architecture.md) — API design and patterns

---

## License

Private project — not for redistribution.
