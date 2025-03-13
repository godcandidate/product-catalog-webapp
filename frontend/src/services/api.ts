import axios from 'axios';

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

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
  // Skip token validation for auth endpoints
  if (config.url?.startsWith('/auth/')) {
    return config;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  
  // Validate token format
  if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/.test(token)) {
    localStorage.removeItem('token'); // Clear invalid token
    throw new Error('Invalid authentication token. Please log in again.');
  }

  if (config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      throw new Error('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      // Store token immediately on successful login
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: AuthError; status?: number } };
        if (axiosError.response?.status === 401) {
          throw new Error('Invalid email or password');
        }
        const errorMessage = axiosError.response?.data?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      throw new Error('Login failed. Please check your connection and try again.');
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
    try {
      // Validate product data
      if (!product.name?.trim()) {
        throw new Error('Product name is required');
      }
      if (!product.category) {
        throw new Error('Product category is required');
      }
      if (!product.description?.trim()) {
        throw new Error('Product description is required');
      }
      if (!product.image_url?.trim()) {
        throw new Error('Product image URL is required');
      }
      if (typeof product.price !== 'number' || product.price <= 0) {
        throw new Error('Valid product price is required');
      }

      const response = await api.post<ProductResponse>('/api/products', {
        ...product,
        name: product.name.trim(),
        description: product.description.trim(),
        image_url: product.image_url.trim()
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw validation errors
      }
      const apiError = error as ApiError;
      if (apiError.response?.status === 422) {
        throw new Error('Invalid product data: ' + (apiError.response.data?.message || 'Please check your input'));
      }
      throw new Error('Failed to create product. Please try again.');
    }
  },

  // Get all products for the user
  getUserProducts: async (): Promise<Product[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.get<Product[]>('/api/products');
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response) {
        if (apiError.response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(apiError.response.data?.message || 'Failed to fetch products');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  // Update a product
  updateProduct: async (id: number, product: Omit<Product, 'id'>): Promise<ProductResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.put<ProductResponse>(`/api/products/${id}`, product);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response) {
        if (apiError.response.status === 422) {
          throw new Error('Invalid product data. Please check all fields are filled correctly.');
        } else if (apiError.response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(apiError.response.data?.message || 'Failed to update product');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  // Delete a product
  deleteProduct: async (id: number): Promise<ProductResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await api.delete<ProductResponse>(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response) {
        if (apiError.response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(apiError.response.data?.message || 'Failed to delete product');
      }
      throw new Error('An unexpected error occurred');
    }
  },
};

export default api;
