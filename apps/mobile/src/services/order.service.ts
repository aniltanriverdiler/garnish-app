import { API_ROUTES, PaymentMethod } from '@garnish/shared';
import type { ApiResponse, Order } from '@garnish/shared';
import { apiClient } from './api-client';

interface CreateOrderItem {
  productId: string;
  quantity: number;
  options?: {
    id: string;
    name: string;
    price: number;
    type: string;
  }[];
}

interface CreateOrderPayload {
  restaurantId: string;
  deliveryAddressId: string;
  paymentMethod: PaymentMethod;
  note?: string;
  items: CreateOrderItem[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<ApiResponse<Order>>(API_ROUTES.ORDERS.BASE, payload);
  return data.data;
}
