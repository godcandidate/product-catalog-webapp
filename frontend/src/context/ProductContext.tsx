import React, { createContext, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Product, productApi } from '../services/api';
import { toast } from 'react-toastify';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  fetchProducts: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productApi.getUserProducts();
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      if (!auth?.isAuthenticated) {
        toast.error('Please log in to add products');
        navigate('/login');
        return;
      }

      await productApi.createProduct(product);
      await fetchProducts(); // Refresh the products list
      toast.success('Product added successfully');
    } catch (error) {
      if (error instanceof Error) {
        // If token is invalid, redirect to login
        if (error.message.includes('Authentication required') || error.message.includes('log in')) {
          auth?.logout(); // Clear invalid token
          navigate('/login');
        }
        toast.error(error.message);
      } else {
        toast.error('Failed to add product');
      }
      throw error;
    }
  };

  const updateProduct = async (id: number, product: Omit<Product, 'id'>) => {
    try {
      await productApi.updateProduct(id, product);
      toast.success('Product updated successfully');
      await fetchProducts(); // Refresh the products list
    } catch (error) {
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await productApi.deleteProduct(id);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id)); // Optimistically remove from state
    } catch (error) {
      toast.error('Failed to delete product');
      throw error;
    }
  };

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
