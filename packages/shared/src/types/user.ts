export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  address: string;
  city: string;
  district: string;
  postalCode: string | null;
  isDefault: boolean;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}
