import React from 'react';

const Header = () => {
  return (
    <header id="header-container" className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <div className="mb-4 md:mb-0">
          <a href="#" data-testid="header-home-link" className="text-3xl font-bold text-rose-600 tracking-wider">
            FashionBag
          </a>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <div className="relative">
            <input
              type="text"
              name="search-input"
              data-testid="search-input"
              placeholder="Tìm kiếm túi xách..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
            <button
              type="button"
              data-testid="btn-search"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-rose-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-6">
          <a href="#" data-testid="header-menu-home" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">Trang Chủ</a>
          <a href="#" data-testid="header-menu-products" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">Sản Phẩm</a>
          <a href="#" data-testid="header-menu-about" className="text-gray-700 hover:text-rose-600 font-medium transition-colors">Giới Thiệu</a>
          <button 
            type="button" 
            data-testid="header-cart-btn" 
            className="flex items-center text-gray-700 hover:text-rose-600 transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span data-testid="cart-badge" className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
