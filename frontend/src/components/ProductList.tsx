import React, { useState, useEffect } from 'react';
import { Product } from '../services/api';
import { useProducts } from '../hooks/useProducts';
import { ProductForm } from './ProductForm';
import { Pencil, Trash2, Plus, Search, X } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import { toast } from 'react-toastify';

export const ProductList: React.FC = () => {
  const { products, loading, deleteProduct, fetchProducts } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingProductId(id);
    toast.info(
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm mx-auto">
        <p className="mb-4 text-gray-700 text-center font-medium">Are you sure you want to delete this product?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              toast.dismiss();
              setDeletingProductId(null);
            }}
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md transition-colors"
          >
            No
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                await deleteProduct(id);
                // Success message is shown by ProductContext
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to delete product';
                toast.error(message);
              }
              setDeletingProductId(null);
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: 8000,
        closeOnClick: false,
        draggable: false,
        closeButton: true,
        className: 'w-full max-w-sm mx-auto'
      }
    );
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="w-40">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <ProductForm
            product={editingProduct}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-xl text-gray-600 mb-2">
            {searchQuery || selectedCategory ? 'No matching products found' : 'No products found'}
          </p>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCategory ? 'Try adjusting your search or filters' : 'Start by adding your first product'}
          </p>
          {!searchQuery && !selectedCategory && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 group">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <p className="text-lg font-bold text-indigo-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit product"
                    disabled={deletingProductId === product.id}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => product.id && handleDelete(product.id)}
                    className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                      deletingProductId === product.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Delete product"
                    disabled={deletingProductId === product.id}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
