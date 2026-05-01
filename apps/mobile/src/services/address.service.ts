import { API_ROUTES } from '@garnish/shared';
import type { Address, ApiResponse } from '@garnish/shared';
import { apiClient } from './api-client';

export async function getAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<ApiResponse<Address[]>>(API_ROUTES.ADDRESSES.BASE);
  return data.data;
}
