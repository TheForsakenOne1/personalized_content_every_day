/**
 * Category API Service
 */

import { apiClient } from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isDefault: boolean;
  createdAt: string;
}

export const categoryService = {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ success: boolean; data: { categories: Category[] } }>(
      '/api/categories',
      { cache: true, cacheTime: 300000 } // Cache for 5 minutes
    );

    return response.data.categories;
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get<{ success: boolean; data: { category: Category } }>(
      `/api/categories/${id}`,
      { cache: true, cacheTime: 300000 }
    );

    return response.data.category;
  },

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get<{ success: boolean; data: { category: Category } }>(
      `/api/categories/slug/${slug}`,
      { cache: true, cacheTime: 300000 }
    );

    return response.data.category;
  },
};

export default categoryService;
