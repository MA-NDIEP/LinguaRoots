import { API_BASE_URL } from "@/constants/Config";
import { Post } from "@/app/types";

import { authService } from "./authService";

export const postService = {
  getAllPosts: async (): Promise<Post[]> => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/post/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },
};
