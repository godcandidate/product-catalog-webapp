import React, { createContext, useState, useCallback } from 'react';
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedProducts = await productApi.getUserProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await productApi.createProduct(product);
      toast.success('Product added successfully');
      await fetchProducts(); // Refresh the products list
    } catch (error) {
      toast.error('Failed to add product');
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
