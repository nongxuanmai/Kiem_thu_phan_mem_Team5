import React from 'react';

const ProductDetail = ({ product, onBack }) => {
  if (!product) return null;

  return (
    <div id="product-detail-view" data-testid="product-detail-modal" className="container mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        data-testid="btn-back-to-list"
        className="mb-6 flex items-center text-gray-600 hover:text-rose-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại danh sách
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Product Image */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center bg-gray-50">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full max-w-md h-auto rounded-xl shadow-md object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
          <p className="text-2xl text-rose-600 font-bold mb-6">{product.price.toLocaleString('vi-VN')} đ</p>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm:</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <div className="flex items-center border border-gray-300 rounded-lg w-fit">
              <button data-testid="btn-decrease-qty" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">-</button>
              <input 
                type="number" 
                name="quantity-input" 
                data-testid="quantity-input"
                defaultValue="1" 
                min="1" 
                className="w-16 text-center focus:outline-none py-2 border-x border-gray-300"
              />
              <button data-testid="btn-increase-qty" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">+</button>
            </div>
            
            <button 
              data-testid="btn-add-to-cart"
              className="flex-grow bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Thêm Vào Giỏ Hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
