import React from 'react';
import { ProductList } from '../components/ProductList';

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and organize your product catalog
        </p>
      </div>
      <ProductList />
    </div>
  );
};

export default Dashboard;
