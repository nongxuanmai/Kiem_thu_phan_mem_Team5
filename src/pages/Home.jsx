import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductList from '../components/ProductList';
import ProductDetail from '../components/ProductDetail';

const Home = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
  };

  return (
    <div id="home-page" className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Banner - Only show when not in detail view */}
        {!selectedProduct && (
          <section id="hero-banner" className="relative h-[60vh] bg-gray-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
                alt="Banner" 
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            <div className="relative z-10 text-center px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                Định Hình Phong Cách
              </h1>
              <p className="text-lg md:text-2xl text-gray-200 mb-8 font-light max-w-2xl mx-auto">
                Khám phá bộ sưu tập túi xách thời trang cao cấp dành riêng cho bạn.
              </p>
              <button 
                data-testid="btn-shop-now"
                className="bg-white text-gray-900 hover:bg-rose-500 hover:text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  document.getElementById('product-list-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Mua Sắm Ngay
              </button>
            </div>
          </section>
        )}

        {/* Dynamic Content: Either Product List or Detail */}
        {selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={handleBackToList} />
        ) : (
          <ProductList onViewDetail={handleViewDetail} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
