# Garnish App

A food ordering mobile application built with a monorepo architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | Expo, React Native, TypeScript, Expo Router, NativeWind/Tailwind, Zustand, TanStack Query, Axios |
| **API** | Express 5, TypeScript, Prisma, PostgreSQL, JWT, Zod, Helmet, CORS |
| **Shared** | TypeScript types, Zod schemas, enums, constants |
| **Tooling** | npm workspaces, Turborepo, ESLint, Prettier |

## Project Structure

```
garnish-app/
├── apps/
│   ├── mobile/          # Expo React Native app
│   │   ├── app/         # Expo Router file-based routing
│   │   ├── src/         # Application source code
│   │   │   ├── components/
│   │   │   │   ├── ui/        # Design system primitives
│   │   │   │   └── shared/    # App-level shared components
│   │   │   ├── constants/     # Static data, image imports
│   │   │   ├── features/      # Feature-based modules
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API client and service layer
│   │   │   ├── store/         # Zustand stores
│   │   │   ├── theme/         # Design tokens (colors, spacing, typography)
│   │   │   ├── types/         # TypeScript types
│   │   │   └── utils/         # Utility functions
│   │   └── assets/      # Fonts, icons, images
│   └── api/             # Express REST API
│       ├── src/
│       │   ├── config/        # Environment config
│       │   ├── libs/          # Prisma client
│       │   ├── middlewares/   # Auth, error, validation
│       │   ├── modules/       # Feature modules
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── restaurants/
│       │   │   ├── categories/
│       │   │   ├── products/
│       │   │   ├── cart/
│       │   │   ├── orders/
│       │   │   └── addresses/
│       │   └── utils/         # JWT, password, API errors
│       └── prisma/      # Prisma schema and migrations
└── packages/
    └── shared/          # Shared types, schemas, enums, constants
        └── src/
            ├── types/
            ├── schemas/
            ├── enums/
            └── constants/
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** running locally or remotely
- **Expo CLI** (`npx expo`)
- **Expo Go** app on your mobile device (or Android/iOS simulator)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

All workspaces are installed in a single command from the root.

### 2. Set Up Environment Variables

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your PostgreSQL connection string and JWT secrets

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
# Edit apps/mobile/.env with your API URL and Sentry DSN
```

### 3. Set Up the Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or create a migration (production)
npm run db:migrate -w @garnish/api
```

### 4. Start the API Server

```bash
npm run api
```

The API will start at `http://localhost:3000`. Health check: `GET /api/health`

### 5. Start the Mobile App

```bash
npm run mobile
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS simulator.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run mobile` | Start Expo dev server |
| `npm run mobile:android` | Start on Android |
| `npm run mobile:ios` | Start on iOS |
| `npm run api` | Start Express API in dev mode |
| `npm run api:build` | Build API for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:studio` | Open Prisma Studio |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/v1/auth/register` | No | Register user |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/refresh` | No | Refresh token |
| GET | `/api/v1/auth/me` | Yes | Get current user |
| GET | `/api/v1/restaurants` | Yes | List restaurants |
| GET | `/api/v1/categories` | Yes | List categories |
| GET | `/api/v1/products` | Yes | List/search products |
| GET | `/api/v1/products/:id` | Yes | Product detail |
| GET | `/api/v1/orders` | Yes | List orders |
| GET | `/api/v1/addresses` | Yes | List addresses |

## Architecture Decisions

- **npm workspaces** for monorepo management with Turborepo for task orchestration
- **Expo Router** (file-based routing) for mobile navigation
- **NativeWind/Tailwind** for styling (already established in the project)
- **Zustand** for global state (auth, cart)
- **Axios** with interceptors for API communication (auto token refresh)
- **expo-secure-store** for secure token storage on device
- **Prisma** as the ORM with PostgreSQL
- **Zod** for shared validation between frontend and backend
- **Module-based** API architecture (each module: route → controller → service)
- **JWT** with access + refresh token pattern

## License

Private
