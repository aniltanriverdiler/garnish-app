import { OrderStatus } from "../enums";

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  options: CartItemOption[];
}

export interface OrderItemOption {
  id: string;
  orderItemId: string;
  name: string;
  price: number;
  type: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  options: OrderItemOption[];
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  deliveryFee: number;
  deliveryAddress: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}
