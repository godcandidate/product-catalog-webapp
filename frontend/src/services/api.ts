import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Response types
export interface LoginResponse {
  token: string;
}

export interface SignupResponse {
  message: string;
}

export interface AuthError {
  message: string;
}

export interface Product {
  id?: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
}

export interface ProductResponse {
  message: string;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: AuthError } };
        const errorMessage = axiosError.response?.data?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      throw new Error('Login failed');
    }
  },

  signup: async (name: string, email: string, password: string): Promise<SignupResponse> => {
    try {
      const response = await api.post<SignupResponse>('/auth/signup', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: AuthError } };
        const errorMessage = axiosError.response?.data?.message || 'Signup failed';
        throw new Error(errorMessage);
      }
      throw new Error('Signup failed');
    }
  },
};

export const productApi = {
  // Create a new product
  createProduct: async (product: Omit<Product, 'id'>): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>(
      '/api/products',
      product,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  // Get all products for the user
  getUserProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>(
      '/api/products',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  // Update a product
  updateProduct: async (id: number, product: Omit<Product, 'id'>): Promise<ProductResponse> => {
    const response = await api.put<ProductResponse>(
      `/api/products/${id}`,
      product,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id: number): Promise<ProductResponse> => {
    const response = await api.delete<ProductResponse>(
      `/api/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },
};

export default api;
