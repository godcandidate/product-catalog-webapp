import React, { useState } from 'react';
import { Product } from '../services/api';
import { ProductCategory } from '../constants/categories';
import { useProducts } from '../hooks/useProducts';
import { X, Image, Upload, ChevronDown } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import { toast } from 'react-toastify';
interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState<{
    name: string;
    category: ProductCategory | '';
    price: string;
    description: string;
    image_url: string;
  }>({
    name: product?.name || '',
    category: product?.category && PRODUCT_CATEGORIES.includes(product.category as ProductCategory) ? (product.category as ProductCategory) : '',
    price: product?.price?.toString() || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
  });
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }
    
    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    } else if (!PRODUCT_CATEGORIES.includes(formData.category)) {
      newErrors.category = 'Please select a valid category';
    }
    
    // Price validation
    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price)) {
      newErrors.price = 'Please enter a valid number';
    } else if (price < 0) {
      newErrors.price = 'Price cannot be negative';
    } else if (price > 1000000) {
      newErrors.price = 'Price cannot exceed 1,000,000';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    
    // Image URL validation
    if (!formData.image_url.trim()) {
      newErrors.image_url = 'Image URL is required';
    } else {
      try {
        const url = new URL(formData.image_url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.image_url = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.image_url = 'Please enter a valid URL';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Clean and format the data before submission
    // Ensure category is selected before submission
    if (formData.category === '') {
      toast.error('Please select a category');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      category: formData.category as ProductCategory, // Now safe to cast
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      image_url: formData.image_url.trim()
    };

    try {
      if (product?.id) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
    if (errors.image_url) {
      setErrors({ ...errors, image_url: '' });
    }
  };

  const handleCategorySelect = (category: ProductCategory) => {
    setFormData({ ...formData, category });
    setShowCategoryDropdown(false);
    if (errors.category) {
      setErrors({ ...errors, category: '' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Product Details */}
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 rounded-lg border ${
                  errors.name ? 'border-red-300 ring-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`mt-1 relative w-full px-3 py-2 text-left rounded-lg border ${
                  errors.category ? 'border-red-300 ring-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 bg-white`}
              >
                <span className={formData.category ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.category || 'Select a category'}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </button>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
              {showCategoryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-auto">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-4 py-2 text-left hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none ${
                        formData.category === category ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 rounded-lg border ${
                  errors.price ? 'border-red-300 ring-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Right Column - Image and Description */}
          <div className="space-y-6">
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <div className={`mt-1 relative rounded-lg border ${
                errors.image_url ? 'border-red-300' : 'border-gray-300'
              } overflow-hidden`}>
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-40 object-cover"
                      onError={() => setImagePreview('')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-70 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gray-50">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <input
                  type="url"
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              {errors.image_url && (
                <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 rounded-lg border ${
                  errors.description ? 'border-red-300 ring-red-500' : 'border-gray-300'
                } shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150`}
                rows={4}
                placeholder="Describe your product..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {product ? 'Update' : 'Add'} Product
          </button>
        </div>
      </form>
    </div>
  );
};
