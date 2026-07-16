import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { danhmucAPI } from '../services/api';
import CartDrawer from './CartDrawer';

const CAT_ICONS = {
  'Túi Xách Tay': '👜',
  'Túi Đeo Chéo': '🎒',
  'Túi Đeo Vai': '👝',
  'Balo': '🎽',
  'Ví': '💳',
  'Túi Clutch': '💼',
};

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    danhmucAPI.getAll().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMouseEnterCat = () => {
    clearTimeout(closeTimer.current);
    setCatOpen(true);
  };
  const handleMouseLeaveCat = () => {
    closeTimer.current = setTimeout(() => setCatOpen(false), 180);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
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

            {/* Dropdown Danh Mục */}
            <div
              className="nav-dropdown"
              ref={catRef}
              onMouseEnter={handleMouseEnterCat}
              onMouseLeave={handleMouseLeaveCat}
            >
              <button
                className={`nav-link nav-dropdown-btn${catOpen ? ' active' : ''}`}
                onClick={() => setCatOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={catOpen}
              >
                Danh Mục
                <span className={`dropdown-arrow${catOpen ? ' open' : ''}`}>▾</span>
              </button>

              {catOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">Danh Mục Sản Phẩm</div>
                  {categories.map(cat => (
                    <Link
                      key={cat.id_dm}
                      to={`/products?id_dm=${cat.id_dm}`}
                      className="dropdown-item"
                      onClick={() => setCatOpen(false)}
                    >
                      <span className="dropdown-item-icon">
                        {CAT_ICONS[cat.tendanhmuc] || '👜'}
                      </span>
                      <span>{cat.tendanhmuc}</span>
                    </Link>
                  ))}
                  <div className="dropdown-divider" />
                  <Link
                    to="/products"
                    className="dropdown-item dropdown-item-all"
                    onClick={() => setCatOpen(false)}
                  >
                    <span className="dropdown-item-icon">🛍️</span>
                    <span>Xem Tất Cả Sản Phẩm</span>
                  </Link>
                </div>
              )}
            </div>

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
                <button className="btn btn-outline btn-sm" onClick={() => setShowLogoutConfirm(true)}>
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

      {/* Modal xác nhận Đăng xuất */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div
            className="modal"
            style={{ maxWidth: 420, borderRadius: 20, padding: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: 18, color: 'var(--secondary)' }}>🚪 Xác nhận Đăng xuất</h3>
              <button
                className="cart-close"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ width: 32, height: 32, fontSize: 16 }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
              <p style={{ fontSize: 15, color: 'var(--text)', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
              </p>
            </div>
            <div
              className="modal-footer"
              style={{
                padding: '16px 24px', background: 'var(--bg)',
                borderRadius: '0 0 20px 20px', display: 'flex', gap: 12, justifyContent: 'flex-end'
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '8px 20px', fontSize: 14 }}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmLogout}
                style={{ padding: '8px 20px', fontSize: 14 }}
              >
                Đồng ý đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
