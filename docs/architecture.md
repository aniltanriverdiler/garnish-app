# Architecture Overview

## Monorepo Structure

The project uses **npm workspaces** with **Turborepo** for task orchestration.

### Workspaces

| Package | Path | Description |
|---------|------|-------------|
| `@garnish/mobile` | `apps/mobile` | Expo React Native mobile app |
| `@garnish/api` | `apps/api` | Express REST API |
| `@garnish/shared` | `packages/shared` | Shared types, schemas, enums, constants |

### Dependency Graph

```
@garnish/mobile ──→ @garnish/shared
@garnish/api ────→ @garnish/shared
```

## Mobile App (`apps/mobile`)

### Routing (Expo Router)

```
app/
├── _layout.tsx          # Root layout (fonts, Sentry, auth check)
├── (auth)/
│   ├── _layout.tsx      # Auth layout (login graphic, redirect if authenticated)
│   ├── sign-in.tsx      # Sign in screen
│   └── sign-up.tsx      # Sign up screen
└── (tabs)/
    ├── _layout.tsx      # Tab navigator (redirect if not authenticated)
    ├── index.tsx        # Home screen (offers)
    ├── search.tsx       # Search screen
    ├── cart.tsx          # Cart screen
    └── profile.tsx      # Profile screen
```

### Source Organization (`src/`)

| Directory | Purpose |
|-----------|---------|
| `components/ui/` | Design system primitives (Button, Input) |
| `components/shared/` | App-level reusable components (CartButton, MenuCard, etc.) |
| `constants/` | Static data, image/icon imports |
| `features/` | Feature-based modules for future development |
| `hooks/` | Custom React hooks |
| `services/` | API client (Axios) and service functions |
| `store/` | Zustand stores (auth, cart) |
| `theme/` | Design tokens (colors, spacing, typography) |
| `types/` | TypeScript type definitions |
| `utils/` | Utility functions |

### Path Aliases

| Alias | Resolves To |
|-------|-------------|
| `@/*` | `./src/*` |
| `@assets/*` | `./assets/*` |

### State Management

- **Zustand** for global state (auth store, cart store)
- **TanStack Query** available for server state management
- Auth tokens stored securely via `expo-secure-store`

### Styling

- **NativeWind v4** with **Tailwind CSS** for utility-first styling
- **clsx** for conditional class composition
- **Design tokens** in `src/theme/` for programmatic access to design values
- Custom component classes defined in `global.css`

## API (`apps/api`)

### Module Architecture

Each API module follows the pattern:

```
modules/auth/
├── auth.route.ts         # Express Router with route definitions
├── auth.controller.ts    # Request/response handling
├── auth.service.ts       # Business logic
└── auth.validation.ts    # Zod schema imports from @garnish/shared
```

### Middleware Stack

1. **Helmet** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **express.json()** - Body parsing
4. **Rate Limiter** - 100 requests per 15 minutes
5. **Auth Middleware** - JWT verification (per route)
6. **Validation Middleware** - Zod schema validation
7. **Error Middleware** - Centralized error handling

### Authentication Flow

1. User registers or logs in → API returns access + refresh tokens
2. Mobile app stores tokens in secure storage
3. Axios interceptor attaches access token to requests
4. On 401, interceptor automatically tries to refresh the token
5. If refresh fails, user is signed out

### Database

- **PostgreSQL** with **Prisma ORM**
- UUID primary keys
- Proper indexes on foreign keys and frequently queried fields
- Cascading deletes where appropriate

### Data Models

- **User** - Authentication and profile
- **Address** - Delivery addresses per user
- **Restaurant** - Food providers
- **Category** - Product categories
- **Product** - Menu items with options
- **ProductOption** - Customizations (sides, toppings, sizes)
- **Order** / **OrderItem** / **OrderItemOption** - Order tracking
- **Favorite** - User favorites (unique per user+product)

## Shared Package (`packages/shared`)

### Contents

| Export | Description |
|--------|-------------|
| **Types** | User, Address, Restaurant, Category, Product, Order, CartItem, ApiResponse, AuthTokens |
| **Schemas** | Zod validation schemas for auth, user, product, order operations |
| **Enums** | OrderStatus, PaymentMethod, PaymentStatus, OptionType, UserRole |
| **Constants** | API_ROUTES, PAGINATION_DEFAULTS, ORDER_STATUS_LABELS |

### Usage

```typescript
// In mobile app
import { User, loginSchema, API_ROUTES, OrderStatus } from '@garnish/shared';

// In API
import { registerSchema, OrderStatus } from '@garnish/shared';
```

## Feature Modules (Future Development)

The `src/features/` directory is prepared for feature-based development:

| Feature | Description |
|---------|-------------|
| `auth` | Authentication flow screens and logic |
| `home` | Home screen, offers, promotions |
| `search` | Restaurant and product search |
| `cart` | Shopping cart management |
| `checkout` | Order placement flow |
| `orders` | Order history and tracking |
| `profile` | User profile management |
| `addresses` | Address management |
| `favorites` | Favorite products |
| `restaurants` | Restaurant listing and detail |

## Environment Variables

### Mobile (`apps/mobile/.env`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN |

### API (`apps/api/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment (development/production/test) |
| `PORT` | Server port |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT access token secret |
| `JWT_REFRESH_SECRET` | JWT refresh token secret |
| `JWT_EXPIRES_IN` | Access token expiry (default: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: 7d) |
| `CORS_ORIGIN` | Allowed origins |
