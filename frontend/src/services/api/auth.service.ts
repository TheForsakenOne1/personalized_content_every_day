/**
 * Authentication API Service
 */

import { apiClient } from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/api/auth/register',
      credentials,
      { skipAuth: true }
    );

    if (response.success && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response.data;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/api/auth/login',
      credentials,
      { skipAuth: true }
    );

    if (response.success && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout', {}, { retry: 1 });
    } finally {
      localStorage.removeItem('accessToken');
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: { user: User } }>(
      '/api/auth/me',
      { enableCache: true, cacheTime: 60000 } // Cache for 1 minute
    );

    return response.data.user;
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; data: { message: string } }>(
      '/api/auth/forgot-password',
      { email },
      { skipAuth: true }
    );

    return response.data;
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; data: { message: string } }>(
      '/api/auth/reset-password',
      { token, password },
      { skipAuth: true }
    );

    return response.data;
  },

  /**
   * Send verification email
   */
  async sendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; data: { message: string } }>(
      '/api/auth/send-verification'
    );

    return response.data;
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/api/auth/verify-email',
      { token },
      { skipAuth: true }
    );

    if (response.success && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }

    return response.data;
  },
};

export default authService;
