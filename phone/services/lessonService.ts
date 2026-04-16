import { API_BASE_URL } from "@/constants/Config";
import { Lesson } from "@/app/types";
import { apiFetch } from "./apiClient";

import { authService } from "./authService";

export const lessonService = {
  getAllLessons: async (userId?: number): Promise<Lesson[]> => {
    try {
      const token = authService.getToken();
      const url = `${API_BASE_URL}/lesson/student?studentId=${userId}`

        
      const response = await apiFetch(url, {
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

  completeLesson: async (studentId: number, lessonOrder: number): Promise<void> => {
    try {
      const token = authService.getToken();
      const response = await apiFetch(`${API_BASE_URL}/lesson/complete?studentId=${studentId}&lessonOrder=${lessonOrder}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to complete lesson');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  },
};
