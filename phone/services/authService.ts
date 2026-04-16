import { API_BASE_URL } from "@/constants/Config";
import { AuthResponse } from "@/app/types";
import { apiFetch } from "./apiClient";


let authToken: string | null = null;
let currentUserId: number | null = null;
let currentUsername: string | null = null;
let currentEmail: string | null = null;

export const authService = {
  setToken: (token: string) => {
    authToken = token;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) {
        currentUserId = payload.userId;
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  },

  getToken: () => {
    return authToken;
  },

  setUser: (id: number | null, username: string, email: string) => {
    if (id !== null) {
      currentUserId = id;
    }
    currentUsername = username;
    currentEmail = email;
  },

  getUserId: () => {
    return currentUserId;
  },

  getUsername: () => {
    return currentUsername;
  },

  getEmail: () => {
    return currentEmail;
  },

  logout: () => {
    authToken = null;
    currentUserId = null;
    currentUsername = null;
    currentEmail = null;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }
      
      const data: AuthResponse = await response.json();
      // data should contain { token, id, username, email, role }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  registerStudent: async (username: string, email: string, password: string) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/register/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      return await response.text();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
};
