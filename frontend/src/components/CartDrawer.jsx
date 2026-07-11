import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const IMG_BASE = '/uploads/';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className={`cart-drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>🛍️ Giỏ Hàng ({cartItems.length})</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <h3>Giỏ hàng trống</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                Hãy thêm sản phẩm vào giỏ hàng!
              </p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id_sp} className="cart-item">
                <img
                  className="cart-item-img"
                  src={item.anh_sp ? `${IMG_BASE}${item.anh_sp}` : 'https://placehold.co/72x72/f0ddd0/c8956c?text=Túi'}
                  alt={item.ten_sp}
                  onError={e => { e.target.src = 'https://placehold.co/72x72/f0ddd0/c8956c?text=Túi'; }}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.ten_sp}</div>
                  <div className="cart-item-price">{formatPrice(item.gia_sp)}</div>
                  <div className="cart-qty">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id_sp, item.soluong - 1)}>−</button>
                    <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.soluong}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id_sp, item.soluong + 1)}>+</button>
                    <button
                      onClick={() => removeFromCart(item.id_sp)}
                      style={{ marginLeft: 'auto', color: 'var(--error)', fontSize: 16 }}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Tổng cộng:</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <button className="btn btn-primary w-full" onClick={handleCheckout}>
              Tiến hành đặt hàng →
            </button>
            <button
              className="btn btn-outline w-full mt-16"
              onClick={clearCart}
              style={{ marginTop: 10 }}
            >
              Xóa giỏ hàng
            </button>
          </div>
        )}
      </div>
    </>
  );
}
