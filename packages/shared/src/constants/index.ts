import { OrderStatus } from "../enums";

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: "/users/profile",
  },
  RESTAURANTS: {
    BASE: "/restaurants",
    BY_ID: (id: string) => `/restaurants/${id}`,
    MENU: (id: string) => `/restaurants/${id}/menu`,
  },
  CATEGORIES: {
    BASE: "/categories",
    BY_ID: (id: string) => `/categories/${id}`,
  },
  PRODUCTS: {
    BASE: "/products",
    BY_ID: (id: string) => `/products/${id}`,
  },
  CART: {
    BASE: "/cart",
    ADD: "/cart/add",
    UPDATE: "/cart/update",
    REMOVE: (id: string) => `/cart/${id}`,
    CLEAR: "/cart/clear",
  },
  ORDERS: {
    BASE: "/orders",
    BY_ID: (id: string) => `/orders/${id}`,
    STATUS: (id: string) => `/orders/${id}/status`,
  },
  ADDRESSES: {
    BASE: "/addresses",
    BY_ID: (id: string) => `/addresses/${id}`,
  },
  FAVORITES: {
    BASE: "/favorites",
    TOGGLE: "/favorites/toggle",
    BY_ID: (id: string) => `/favorites/${id}`,
  },
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
} as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Beklemede",
  [OrderStatus.CONFIRMED]: "Onaylandı",
  [OrderStatus.PREPARING]: "Hazırlanıyor",
  [OrderStatus.READY]: "Hazır",
  [OrderStatus.ON_THE_WAY]: "Yolda",
  [OrderStatus.DELIVERED]: "Teslim Edildi",
  [OrderStatus.CANCELLED]: "İptal Edildi",
};
