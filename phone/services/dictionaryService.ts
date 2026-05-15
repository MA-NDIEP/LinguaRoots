import { API_BASE_URL } from "@/constants/Config";
import { AlphabetEntry, WordEntry } from "@/app/types/types";
import { apiFetch } from "./apiClient";
import { authService } from "./authService";

export const dictionaryService = {
  getAllAlphabets: async (): Promise<AlphabetEntry[]> => {
    try {
      const token = authService.getToken();
      const response = await apiFetch(`${API_BASE_URL}/alphabet/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch alphabets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching alphabets:', error);
      throw error;
    }
  },

  getAllWords: async (): Promise<WordEntry[]> => {
    try {
      const token = authService.getToken();
      const response = await apiFetch(`${API_BASE_URL}/word/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching words:', error);
      throw error;
    }
  },
};
