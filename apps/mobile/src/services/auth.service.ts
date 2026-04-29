import { API_ROUTES } from '@garnish/shared';
import type { ApiResponse, AuthTokens, User } from '@garnish/shared';
import { apiClient, storeTokens, clearTokens } from './api-client';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.LOGIN, {
    email,
    password,
  });

  if (data.data) {
    await storeTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
  }

  return data.data!;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.REGISTER, {
    name,
    email,
    password,
  });

  if (data.data) {
    await storeTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
  }

  return data.data!;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>(API_ROUTES.AUTH.ME);
  return data.data!;
}

export async function logout(): Promise<void> {
  await clearTokens();
}
