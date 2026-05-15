import { API_BASE_URL } from "@/constants/Config";
import { Lesson } from "@/app/types";
import { apiFetch } from "./apiClient";
import { authService } from "./authService";

export const lessonService = {
  /**
   * Fetches all lessons for the given student.
   *
   * Returns `unknown` intentionally — the backend may wrap the array inside an
   * object (e.g. `{ data: [] }`, `{ content: [] }`, Spring Page<T>, etc.).
   * The caller (`LessonsScreen`) uses `extractLessons()` to safely unwrap
   * whichever shape is returned.
   */
  getAllLessons: async (userId?: number): Promise<unknown> => {
    try {
      const token = authService.getToken();

      // Only append the query param when we actually have a userId.
      const url = userId != null
        ? `${API_BASE_URL}/lesson/student?studentId=${userId}`
        : `${API_BASE_URL}/lesson/student`;

      const response = await apiFetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch lessons (HTTP ${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching lessons:", error);
      throw error;
    }
  },

  completeLesson: async (studentId: number, lessonOrder: number): Promise<void> => {
    try {
      const token = authService.getToken();
      const response = await apiFetch(
        `${API_BASE_URL}/lesson/complete?studentId=${studentId}&lessonOrder=${lessonOrder}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to complete lesson (HTTP ${response.status})`);
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      throw error;
    }
  },
};