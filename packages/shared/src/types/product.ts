import { OptionType } from "../enums";

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  calories: number | null;
  protein: number | null;
  rating: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  price: number;
  type: OptionType;
}
