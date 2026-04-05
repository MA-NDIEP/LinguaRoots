import { API_BASE_URL } from "@/constants/Config";


let authToken: string | null = null;
let currentUsername: string | null = null;
let currentEmail: string | null = null;

export const authService = {
  setToken: (token: string) => {
    authToken = token;
  },

  getToken: () => {
    return authToken;
  },

  setUser: (username: string, email: string) => {
    currentUsername = username;
    currentEmail = email;
  },

  getUsername: () => {
    return currentUsername;
  },

  getEmail: () => {
    return currentEmail;
  },

  logout: () => {
    authToken = null;
    currentUsername = null;
    currentEmail = null;
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
      
      const token = await response.text();
      currentEmail = email;
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  registerStudent: async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/student`, {
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
