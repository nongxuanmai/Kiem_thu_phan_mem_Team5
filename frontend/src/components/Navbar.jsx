import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div>
              <div className="navbar-logo-text">FashionBag</div>
              <div className="navbar-logo-sub">Luxury Collection</div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="navbar-nav">
            <Link to="/" className="nav-link">Trang Chủ</Link>
            <Link to="/products" className="nav-link">Sản Phẩm</Link>
            {isAdmin && <Link to="/admin" className="nav-link">Quản Trị</Link>}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <>
                <Link to="/orders" className="nav-link" style={{ fontSize: 13 }}>
                  Đơn hàng
                </Link>
                <Link to="/profile" className="nav-link" style={{ fontSize: 13 }}>
                  👤 {user.hoten || user.taikhoan}
                </Link>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
              </>
            )}

            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛍️
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
