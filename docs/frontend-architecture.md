# Frontend Architecture

This document covers the React Native (Expo) mobile app located in `apps/mobile/`.

---

## Folder Structure

```
apps/mobile/
├── app/                            # Expo Router pages (file-based routing)
│   ├── _layout.tsx                 # Root layout — fonts, Sentry, providers, auth/cart restore
│   ├── login-success.tsx           # Post-login confirmation screen
│   ├── product/
│   │   └── [id].tsx                # Product detail — options, add to cart
│   ├── (auth)/
│   │   ├── _layout.tsx             # Auth layout — hero image, logo, redirect if authenticated
│   │   ├── sign-in.tsx             # Sign in form
│   │   └── sign-up.tsx             # Sign up form
│   └── (tabs)/
│       ├── _layout.tsx             # Tab navigator — cart badge, redirect if unauthenticated
│       ├── index.tsx               # Home — offers, featured items
│       ├── search.tsx              # Search — category filter, product grid
│       ├── cart.tsx                # Cart — items, payment summary
│       └── profile.tsx             # User profile
├── src/
│   ├── components/
│   │   ├── shared/                 # App-level reusable components
│   │   │   ├── CartButton.tsx      # Header cart icon with item count badge
│   │   │   ├── CartItem.tsx        # Single cart item row (image, qty, delete)
│   │   │   ├── CustomHeader.tsx    # Navigation header with back/search buttons
│   │   │   ├── Filter.tsx          # Horizontal category filter chips
│   │   │   ├── MenuCard.tsx        # Product card for grids
│   │   │   └── SearchBar.tsx       # Debounced search input (300ms)
│   │   └── ui/                     # Design system primitives
│   │       ├── CustomButton.tsx    # Styled button with loading state
│   │       └── CustomInput.tsx     # Styled text input with label
│   ├── constants/
│   │   └── index.ts                # Image imports, OPTION_IMAGE_MAP, demo data
│   ├── services/
│   │   ├── api-client.ts           # Axios instance, token management, interceptors
│   │   ├── auth.service.ts         # login, register, getMe, logout
│   │   ├── product.service.ts      # getProducts, getCategories, getProductById
│   │   ├── cart.service.ts         # getCart, addToCart, updateCartItem, removeFromCart
│   │   ├── order.service.ts        # createOrder
│   │   ├── address.service.ts      # getAddresses
│   │   ├── user.service.ts         # getProfile, updateProfile
│   │   └── index.ts                # Barrel exports
│   ├── store/
│   │   ├── auth-store.ts           # Zustand — user, authentication state, session restore
│   │   └── cart-store.ts           # Zustand — cart items, synced with backend
│   ├── theme/                      # Design tokens (colors, spacing, typography)
│   ├── types/
│   │   └── index.ts                # App-specific types + re-exports from @garnish/shared
│   ├── hooks/                      # Custom React hooks (placeholder)
│   └── utils/                      # Utility functions (placeholder)
├── assets/                         # Fonts, images, icons
└── global.css                      # NativeWind / Tailwind CSS configuration
```

---

## Navigation System

The app uses **Expo Router** (file-based routing built on React Navigation).

### Route Groups

| Group | Purpose | Auth Required |
|-------|---------|:------------:|
| `(auth)` | Sign in, sign up screens | No (redirects away if authenticated) |
| `(tabs)` | Main app with tab navigation | Yes (redirects to sign-in if not) |
| Root | Login success, product detail | Varies |

### Navigation Flow

```
App Start → _layout.tsx (load fonts, restore auth session, fetch cart)
         ↓
    isAuthenticated?
    ├── No  → (auth)/_layout.tsx → sign-in.tsx
    └── Yes → (tabs)/_layout.tsx → index.tsx (Home)

Login Success → login-success.tsx → "Go to Homepage" → (tabs)/index.tsx
Product Detail → product/[id].tsx (accessed from search or home)
```

### Layout Hierarchy

```
_layout.tsx (Root: QueryClientProvider, Stack)
├── (auth)/_layout.tsx (KeyboardAvoidingView, ScrollView, hero image)
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── login-success.tsx
├── (tabs)/_layout.tsx (Tabs with floating tab bar)
│   ├── index.tsx
│   ├── search.tsx
│   ├── cart.tsx
│   └── profile.tsx
└── product/[id].tsx
```

---

## State Management

### Zustand Stores

**Auth Store (`auth-store.ts`)**
- `user`, `isAuthenticated`, `isLoading`
- `fetchAuthenticatedUser()` — restores session from stored tokens on app startup
- `signOut()` — clears tokens and resets state

**Cart Store (`cart-store.ts`)**
- `items` — local representation of server cart
- `fetchCart()` — syncs with backend on app startup
- `addItem()`, `removeItem()`, `increaseQty()`, `decreaseQty()` — all call backend API, then update local state from response
- `getTotalItems()`, `getTotalPrice()` — computed from local state for instant UI
- Optimistic updates: UI changes immediately, reconciles with server response

### React Query

Used for read-heavy server data:
- **Products:** `useQuery(['products', { search, categoryId }])`
- **Categories:** `useQuery(['categories'])`
- **Product detail:** `useQuery(['product', id])`

Configured with 5-minute stale time and 1 retry.

---

## API Communication

All HTTP requests go through a single Axios instance in `api-client.ts`:

1. **Base URL** is set from `EXPO_PUBLIC_API_URL`.
2. **Request interceptor** reads the access token from `expo-secure-store` and attaches it as `Authorization: Bearer <token>`.
3. **Response interceptor** catches 401 errors, attempts to refresh the token using the stored refresh token, and retries the failed request.
4. **Service modules** provide typed wrappers: `authService.login(email, password)` returns `{ user, tokens }`.

### Image URL Resolution

Product images are stored as relative paths in the database (e.g., `/images/burger.png`). The `product.service.ts` module has a `resolveImageUrl()` helper that converts these to absolute URLs using the server base URL.

---

## Component Architecture

### Shared Components

| Component | Usage |
|-----------|-------|
| `CartButton` | Header cart icon with badge — used on Home and Search screens |
| `CartItem` | Cart list item — image, name, price, quantity controls, delete |
| `MenuCard` | Product card in search grid — navigates to product detail |
| `Filter` | Horizontal category chips — "All" + API categories |
| `SearchBar` | Text input with 300ms debounce — prevents excessive API calls |

### UI Primitives

| Component | Props |
|-----------|-------|
| `CustomButton` | `title`, `onPress`, `isLoading`, `className` |
| `CustomInput` | `label`, `placeholder`, `value`, `onChangeText`, `secureTextEntry`, `keyboardType` |

---

## Styling

- **NativeWind v4** with **Tailwind CSS** for utility-first styling.
- **clsx** for conditional class composition: `cn('text-base', focused && 'text-primary')`.
- Custom component classes defined in `global.css` (e.g., `.cart-item`, `.tab-icon`).
- **Design tokens** in `src/theme/` for programmatic access to colors, spacing, and typography values.
- Path aliases: `@/*` → `./src/*`, `@assets/*` → `./assets/*`.
