# Garnish App

Full-stack yemek sipariş uygulaması. React Native (Expo) mobil frontend + Express.js + PostgreSQL (Prisma ORM) backend. Monorepo yapısında, paylaşılan type/schema paketi ile geliştirilmiştir.

---

## Projeyi Çalıştırma

### Gereksinimler

- Node.js v18+
- PostgreSQL veritabanı (Neon, Supabase veya lokal)
- Expo CLI (`npx expo`)
- Android Emulator veya iOS Simulator

### Kurulum

```bash
# Bağımlılıkları yükle (root'ta — monorepo)
npm install

# Shared paketi build et
cd packages/shared && npm run build && cd ../..

# API .env dosyasını oluştur
cp apps/api/.env.example apps/api/.env
# DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET değerlerini doldur

# Mobile .env dosyasını oluştur
cp apps/mobile/.env.example apps/mobile/.env
# EXPO_PUBLIC_API_URL değerini ayarla (ör: http://192.168.x.x:3000/api/v1)
```

### Veritabanı

```bash
cd apps/api

# Schema'yı veritabanına push et
npx prisma db push

# Prisma Client'ı oluştur
npx prisma generate

# Seed data yükle (opsiyonel)
npx prisma db seed
```

### Sunucuları Başlat

```bash
# Backend (apps/api dizininde)
cd apps/api && npm run dev

# Mobile (apps/mobile dizininde)
cd apps/mobile && npx expo start
```

---

## Environment Değişkenleri

### Backend (`apps/api/.env`)

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `NODE_ENV` | Çalışma ortamı | `development` |
| `PORT` | Sunucu portu | `3000` |
| `DATABASE_URL` | PostgreSQL bağlantı URL'i | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Access token imza anahtarı | `my-secret-key` |
| `JWT_REFRESH_SECRET` | Refresh token imza anahtarı | `my-refresh-secret` |
| `JWT_EXPIRES_IN` | Access token süresi | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token süresi | `7d` |
| `CORS_ORIGIN` | İzin verilen origin'ler | `*` |

### Mobile (`apps/mobile/.env`)

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `http://192.168.1.5:3000/api/v1` |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry hata izleme DSN | `https://...@sentry.io/...` |

---

## Proje Yapısı

```
garnish-app/
├── apps/
│   ├── api/                    # Express.js backend
│   └── mobile/                 # React Native (Expo) frontend
├── packages/
│   └── shared/                 # Paylaşılan tipler, şemalar, sabitler
├── package.json                # Monorepo root
└── README.md
```

---

## Backend Mimarisi (`apps/api/`)

### Neden bu mimari?

Modüler yapı seçildi: her kaynak (auth, products, cart, orders) kendi klasöründe route/controller/service/validation dosyalarına sahip. Bu sayede:

- Yeni özellik eklemek kolay (yeni modül klasörü aç)
- Tek sorumluluk ilkesi korunuyor
- Test yazması basit

### Klasör Yapısı

```
apps/api/
├── prisma/
│   ├── schema.prisma           # Veritabanı şeması (tüm modeller)
│   └── seed.ts                 # Demo veri yükleme scripti
├── public/
│   └── images/                 # Statik ürün görselleri
├── src/
│   ├── app.ts                  # Express uygulama ayarları, middleware'ler, route mount
│   ├── server.ts               # Sunucuyu başlatan dosya
│   ├── config/
│   │   └── env.ts              # Zod ile ortam değişkeni validasyonu
│   ├── libs/
│   │   └── prisma.ts           # Singleton PrismaClient instance
│   ├── middlewares/
│   │   ├── auth.middleware.ts   # JWT doğrulama + req.user atama
│   │   ├── error.middleware.ts  # Global hata yakalama (ApiError, Zod, Prisma)
│   │   └── validation.middleware.ts # Zod schema ile body/query/params doğrulama
│   ├── modules/
│   │   ├── auth/               # Kimlik doğrulama
│   │   │   ├── auth.route.ts   # POST /login, /register, /refresh; GET /me
│   │   │   ├── auth.controller.ts  # HTTP handler'lar
│   │   │   ├── auth.service.ts     # İş mantığı (hash, token, DB sorguları)
│   │   │   └── auth.validation.ts  # Zod şemaları (shared'dan re-export)
│   │   ├── users/              # Kullanıcı profili
│   │   │   └── users.route.ts  # GET /me, PATCH /me
│   │   ├── restaurants/        # Restoran listesi
│   │   │   └── restaurants.route.ts
│   │   ├── categories/         # Kategori listesi
│   │   │   └── categories.route.ts
│   │   ├── products/           # Ürün listesi ve detay
│   │   │   └── products.route.ts   # GET / (filtre: search, categoryId), GET /:id
│   │   ├── cart/               # Sepet yönetimi (kalıcı, user bazlı)
│   │   │   └── cart.route.ts   # GET /, POST /add, PUT /update, DELETE /:productId, DELETE /
│   │   ├── orders/             # Sipariş oluşturma ve listeleme
│   │   │   └── orders.route.ts # POST /, GET /, GET /:id
│   │   └── addresses/          # Adres yönetimi
│   │       └── addresses.route.ts
│   └── utils/
│       ├── api-error.ts        # Özel hata sınıfı + factory fonksiyonları
│       ├── jwt.ts              # Token oluşturma ve doğrulama
│       └── password.ts         # bcrypt hash/compare
```

### Veritabanı İlişkileri

```
User ──1:N── Address
User ──1:N── Order
User ──1:N── Favorite
User ──1:1── Cart ──1:N── CartItem ──1:N── CartItemOption
                          CartItem ──N:1── Product

Restaurant ──1:N── Product
Category   ──1:N── Product
Product    ──1:N── ProductOption
Product    ──1:N── OrderItem
Product    ──1:N── Favorite

Order ──1:N── OrderItem ──1:N── OrderItemOption
Order ──N:1── Address (deliveryAddress)
Order ──N:1── Restaurant
```

### API Akışı

Tüm endpoint'ler `/api/v1/` prefix'i altında. Kimlik doğrulama gerektiren route'lar `authenticate` middleware'i kullanır.

| Method | Path | Auth | Açıklama |
|--------|------|------|----------|
| POST | `/auth/register` | - | Kayıt ol |
| POST | `/auth/login` | - | Giriş yap |
| POST | `/auth/refresh` | - | Token yenile |
| GET | `/auth/me` | Evet | Kullanıcı bilgisi |
| GET | `/products` | - | Ürün listesi (filtre: search, categoryId) |
| GET | `/products/:id` | - | Ürün detayı (options, restaurant, category dahil) |
| GET | `/categories` | - | Kategori listesi |
| GET | `/restaurants` | - | Restoran listesi |
| GET | `/cart` | Evet | Sepeti getir |
| POST | `/cart/add` | Evet | Sepete ürün ekle |
| PUT | `/cart/update` | Evet | Sepet ürün miktarını güncelle |
| DELETE | `/cart/:productId` | Evet | Sepetten ürün çıkar |
| DELETE | `/cart` | Evet | Sepeti temizle |
| POST | `/orders` | Evet | Sipariş oluştur |
| GET | `/orders` | Evet | Siparişleri listele |
| GET | `/orders/:id` | Evet | Sipariş detayı |
| GET | `/addresses` | Evet | Adres listesi |
| POST | `/addresses` | Evet | Adres ekle |
| PATCH | `/addresses/:id` | Evet | Adres güncelle |
| DELETE | `/addresses/:id` | Evet | Adres sil |

### Auth Akışı

1. Kullanıcı `/auth/register` veya `/auth/login` ile giriş yapar
2. Backend JWT access token (15dk) + refresh token (7 gün) döner
3. Frontend token'ları `expo-secure-store`'da saklar
4. Her API isteğinde `Authorization: Bearer <accessToken>` header'ı gönderilir
5. Token süresi dolunca `api-client` interceptor'ı otomatik refresh yapar
6. `authenticate` middleware'i token'ı doğrular, `req.user`'a kullanıcı bilgisini atar

### Cart Akışı (Backend Kalıcı Sepet)

1. Her kullanıcının tek bir `Cart`'ı vardır (`userId` unique)
2. `GET /cart` → sepet yoksa otomatik oluşturulur (`upsert`)
3. `POST /cart/add` → ürün varsa quantity artırılır, yoksa yeni `CartItem` oluşturulur
4. `PUT /cart/update` → quantity güncellenir (0 ise silinir)
5. `DELETE /cart/:productId` → ilgili ürün sepetten çıkarılır
6. `DELETE /cart` → tüm sepet temizlenir
7. Kullanıcı çıkış yapıp tekrar giriş yapsa bile sepet korunur

---

## Frontend Mimarisi (`apps/mobile/`)

### Klasör Yapısı

```
apps/mobile/
├── app/                        # Expo Router sayfaları
│   ├── _layout.tsx             # Root layout (fonts, Sentry, React Query, auth/cart restore)
│   ├── login-success.tsx       # Başarılı giriş sonrası onay ekranı
│   ├── product/
│   │   └── [id].tsx            # Ürün detay sayfası (toppings, sides, sepete ekle)
│   ├── (auth)/
│   │   ├── _layout.tsx         # Auth layout (hero image, logo, redirect if logged in)
│   │   ├── sign-in.tsx         # Giriş formu
│   │   └── sign-up.tsx         # Kayıt formu
│   └── (tabs)/
│       ├── _layout.tsx         # Tab bar (Home, Search, Cart, Profile) + sepet badge
│       ├── index.tsx           # Ana sayfa (öne çıkan kampanyalar, ürünler)
│       ├── search.tsx          # Arama + kategori filtresi + ürün grid
│       ├── cart.tsx            # Sepet ve ödeme özeti
│       └── profile.tsx         # Kullanıcı profili
├── src/
│   ├── components/
│   │   ├── shared/             # Yeniden kullanılabilir bileşenler
│   │   │   ├── CartButton.tsx  # Header sepet ikonu + badge
│   │   │   ├── CartItem.tsx    # Sepet satırı (görsel, miktar, sil)
│   │   │   ├── CustomHeader.tsx # Geri/arama butonları
│   │   │   ├── Filter.tsx      # Yatay kategori filtreleri
│   │   │   ├── MenuCard.tsx    # Ürün kartı (arama/ana sayfa)
│   │   │   └── SearchBar.tsx   # Debounced arama input'u
│   │   └── ui/                 # Temel UI bileşenleri
│   │       ├── CustomButton.tsx # Stillenmiş buton
│   │       └── CustomInput.tsx  # Stillenmiş input
│   ├── constants/
│   │   └── index.ts            # Görsel importları, OPTION_IMAGE_MAP, demo veriler
│   ├── services/
│   │   ├── api-client.ts       # Axios instance, token yönetimi, interceptor'lar
│   │   ├── auth.service.ts     # Login, register, getMe, logout
│   │   ├── product.service.ts  # Ürün ve kategori API çağrıları
│   │   ├── cart.service.ts     # Sepet API çağrıları (CRUD)
│   │   ├── order.service.ts    # Sipariş oluşturma
│   │   ├── address.service.ts  # Adres listeleme
│   │   ├── user.service.ts     # Profil okuma/güncelleme
│   │   └── index.ts            # Barrel export
│   ├── store/
│   │   ├── auth-store.ts       # Zustand: kullanıcı durumu, oturum yönetimi
│   │   └── cart-store.ts       # Zustand: sepet (backend source of truth)
│   ├── theme/                  # Renk, spacing, tipografi sabitleri
│   ├── types/
│   │   └── index.ts            # Uygulama tipleri + shared re-export'lar
│   └── hooks/                  # Placeholder (henüz boş)
├── assets/                     # Font dosyaları, görseller, ikonlar
└── global.css                  # NativeWind / Tailwind CSS config
```

### State Yönetimi

| Araç | Kullanım | Dosya |
|------|----------|-------|
| Zustand | Auth durumu (user, isAuthenticated, isLoading) | `store/auth-store.ts` |
| Zustand | Sepet durumu (items, CRUD, toplam hesaplama) | `store/cart-store.ts` |
| React Query | Server state (ürünler, kategoriler, ürün detayı) | Doğrudan ekran dosyalarında |

### Kullanılan Ana Paketler

| Paket | Kullanım |
|-------|----------|
| `expo-router` | Dosya tabanlı navigasyon |
| `@tanstack/react-query` | Server state yönetimi, caching |
| `zustand` | Client state yönetimi |
| `axios` | HTTP istekleri |
| `expo-secure-store` | Token güvenli saklama |
| `nativewind` + `tailwindcss` | Stil sistemi |
| `clsx` | Conditional className birleştirme |
| `@sentry/react-native` | Hata izleme |
| `react-native-safe-area-context` | Safe area yönetimi |

---

## Shared Paket (`packages/shared/`)

Frontend ve backend arasında paylaşılan kod:

```
packages/shared/src/
├── index.ts              # Barrel export
├── enums/
│   └── index.ts          # OrderStatus, PaymentMethod, OptionType, UserRole
├── types/
│   ├── user.ts           # User, Address, CreateUserInput
│   ├── product.ts        # Restaurant, Category, Product, ProductOption
│   ├── order.ts          # CartItem, CartItemOption, OrderItem, Order, Favorite
│   └── api.ts            # ApiResponse, AuthTokens, PaginatedResponse
├── schemas/
│   ├── auth.schema.ts    # loginSchema, registerSchema (Zod)
│   ├── user.schema.ts    # updateUserSchema, createAddressSchema
│   ├── product.schema.ts # getProductsSchema, createProductSchema
│   └── order.schema.ts   # createOrderSchema, updateOrderStatusSchema
└── constants/
    └── index.ts          # API_ROUTES, PAGINATION_DEFAULTS, ORDER_STATUS_LABELS
```

---

## Önemli Akışlar

### Login → Login Successful → Ana Sayfa

1. `sign-in.tsx`: `authService.login()` çağrılır
2. Başarılıysa `router.replace('/login-success')` ile yönlendirme
3. `login-success.tsx`: Onay mesajı + "Go to Homepage" butonu
4. Buton `router.replace('/')` ile tabs ana sayfasına götürür

### Sepet (Persistent Cart)

1. Uygulama açılışında `_layout.tsx` → `fetchAuthenticatedUser()` → `fetchCart()`
2. Kullanıcı ürün eklediğinde `cart-store.addItem()` → `POST /cart/add` (backend)
3. Backend `CartItem` oluşturur veya miktarı artırır
4. Dönen güncel cart verisi local state'e yansıtılır
5. Logout/login sonrası sepet backend'de korunur

### Ürün Detay + Toppings/Sides

1. `product/[id].tsx`: React Query ile ürün ve option'lar çekilir
2. Option'lar `OptionType.TOPPING` ve `OptionType.SIDE` olarak filtrelenir
3. Kullanıcı option'lara tıklayarak seçim yapar (toggle)
4. Seçili option'lar fiyata eklenir ve "Add to cart" ile backend'e gönderilir

### Tabbar Badge

1. `(tabs)/_layout.tsx`: `useCartStore.getTotalItems()` ile toplam ürün sayısı alınır
2. Cart tab'ın `tabBarIcon`'una `badge` prop'u olarak verilir
3. Sepet her değiştiğinde badge otomatik güncellenir
4. 0 ürün varsa badge gizlenir
