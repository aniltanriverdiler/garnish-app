import { API_ROUTES } from '@garnish/shared';
import type { ApiResponse, User } from '@garnish/shared';
import { apiClient } from './api-client';

export type ProfileUser = User & {
  addresses: {
    id: string;
    title: string;
    address: string;
    city: string;
    district: string;
    postalCode: string | null;
    isDefault: boolean;
  }[];
};

export async function getProfile(): Promise<ProfileUser> {
  const { data } = await apiClient.get<ApiResponse<ProfileUser>>('/users/me');
  return data.data;
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>('/users/me', payload);
  return data.data;
}
