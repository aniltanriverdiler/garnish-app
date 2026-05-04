import { API_ROUTES } from '@garnish/shared';
import { apiClient } from './api-client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CartOptionData {
  optionId: string;
  name: string;
  price: number;
  type: string;
}

export interface CartItemServer {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    restaurantId: string;
  };
  options: {
    id: string;
    optionId: string;
    name: string;
    price: number;
    type: string;
  }[];
}

export interface CartServer {
  id: string;
  userId: string;
  items: CartItemServer[];
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

function resolveImageUrl(image: string | null | undefined): string {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return `${SERVER_BASE_URL}${image}`;
}

function resolveCart(cart: CartServer): CartServer {
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: { ...item.product, image: resolveImageUrl(item.product.image) },
    })),
  };
}

export async function getCart(): Promise<CartServer> {
  const { data } = await apiClient.get<ApiResponse<CartServer>>(API_ROUTES.CART.BASE);
  return resolveCart(data.data);
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  options?: CartOptionData[]
): Promise<CartServer> {
  const { data } = await apiClient.post<ApiResponse<CartServer>>(API_ROUTES.CART.ADD, {
    productId,
    quantity,
    options,
  });
  return resolveCart(data.data);
}

export async function updateCartItem(productId: string, quantity: number): Promise<CartServer> {
  const { data } = await apiClient.put<ApiResponse<CartServer>>(API_ROUTES.CART.UPDATE, {
    productId,
    quantity,
  });
  return resolveCart(data.data);
}

export async function removeFromCart(productId: string): Promise<CartServer> {
  const { data } = await apiClient.delete<ApiResponse<CartServer>>(
    API_ROUTES.CART.REMOVE(productId)
  );
  return resolveCart(data.data);
}

export async function clearCart(): Promise<CartServer> {
  const { data } = await apiClient.delete<ApiResponse<CartServer>>(API_ROUTES.CART.BASE);
  return resolveCart(data.data);
}
