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

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data: ApiResponse<{ message: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to request password reset');
    }

    return data.data!;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data: ApiResponse<{ message: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to reset password');
    }

    return data.data!;
  },

  async sendVerificationEmail(): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: ApiResponse<{ message: string }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to send verification email');
    }

    return data.data!;
  },

  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });

    const data: ApiResponse<AuthResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Email verification failed');
    }

    return data.data!;
  },
};
