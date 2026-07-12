import React from 'react';

const ProductCard = ({ product, onViewDetail }) => {
  return (
    <div 
      id={`product-card-${product.id}`} 
      data-testid={`product-card-${product.id}`}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
    >
      <div className="relative pt-[100%] overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex-grow">{product.name}</h3>
        <p className="text-rose-600 font-bold text-xl mb-4">
          {product.price.toLocaleString('vi-VN')} đ
        </p>
        <button
          type="button"
          data-testid={`btn-view-product-${product.id}`}
          onClick={() => onViewDetail(product)}
          className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-rose-600 transition-colors duration-300 font-medium"
        >
          Xem Chi Tiết
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
