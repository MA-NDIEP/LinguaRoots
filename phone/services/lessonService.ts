import { API_BASE_URL } from "@/constants/Config";
import { Lesson } from "@/app/types";

import { authService } from "./authService";

export const lessonService = {
  getAllLessons: async (): Promise<Lesson[]> => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/lesson/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 204) {
        return [];
      }
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  createLesson: async (formData: FormData): Promise<Lesson> => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/lesson/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  updateLesson: async (formData: FormData): Promise<Lesson> => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/lesson/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/lesson/delete?lessonId=${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },
};
