import React from 'react';
import ProductCard from './ProductCard';
import { products } from '../data/mockData';

const ProductList = ({ onViewDetail }) => {
  return (
    <section id="product-list-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10 uppercase tracking-wide">
          Sản Phẩm Nổi Bật
        </h2>
        <div 
          id="product-list-container" 
          data-testid="product-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onViewDetail={onViewDetail} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
