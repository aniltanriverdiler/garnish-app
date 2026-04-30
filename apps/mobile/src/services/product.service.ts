import { API_ROUTES } from '@garnish/shared';
import { apiClient } from './api-client';
import type { Product, Category, Restaurant, ProductOption } from '@garnish/shared';

interface GetProductsParams {
  search?: string;
  categoryId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

// Helper function to resolve image URL
function resolveImageUrl(image: string | null | undefined): string {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return `${SERVER_BASE_URL}${image}`;
}

// Get Products
export async function getProducts(params?: GetProductsParams): Promise<Product[]> {
  const { data } = await apiClient.get<ApiResponse<Product[]>>(API_ROUTES.PRODUCTS.BASE, {
    params: {
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
    },
  });
  return data.data.map((p) => ({ ...p, image: resolveImageUrl(p.image) }));
}

// Get Categories
export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>(API_ROUTES.CATEGORIES.BASE);
  return data.data.map((c) => ({ ...c, image: resolveImageUrl(c.image) }));
}

// Get Product Detail
export type ProductDetail = Product & {
  options?: ProductOption[];
  restaurant?: Restaurant;
  category?: Category;
};

// Get Product Detail by ID
export async function getProductById(id: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(API_ROUTES.PRODUCTS.BY_ID(id));

  return {
    ...data.data,
    image: resolveImageUrl(data.data.image),
    restaurant: data.data.restaurant
      ? { ...data.data.restaurant, image: resolveImageUrl(data.data.restaurant.image) }
      : undefined,
  };
}
