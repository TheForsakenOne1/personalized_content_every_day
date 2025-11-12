import type { User, LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data: ApiResponse<{ user: User; message: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Registration failed');
    }

    return data.data!.user;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: JSON.stringify(credentials),
    });

    const data: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }

    return data.data!;
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('accessToken');

    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    localStorage.removeItem('accessToken');
  },

  async refreshToken(): Promise<string> {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    const data: ApiResponse<{ accessToken: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error('Token refresh failed');
    }

    return data.data!.accessToken;
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: ApiResponse<{ user: User }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error('Failed to fetch user');
    }

    return data.data!.user;
  },
};
