import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const IMG_BASE = '/uploads/';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
}

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  // Lưu giá trị input tạm thời cho từng sản phẩm (chưa ấn Cập nhật)
  const [draftQty, setDraftQty] = useState({});
  // Thông báo lỗi kết nối CSDL
  const [dbError, setDbError] = useState('');

  const getDraft = (item) =>
    draftQty[item.id_sp] !== undefined ? draftQty[item.id_sp] : item.soluong;

  const handleQtyChange = (id_sp, val) => {
    setDraftQty(prev => ({ ...prev, [id_sp]: val }));
  };

  // Nút "Cập nhật" (Luồng cơ bản bước 2 & Luồng rẽ nhánh 1)
  const handleUpdate = (item) => {
    try {
      const newQty = Number(getDraft(item));
      if (isNaN(newQty) || newQty < 0) return;

      if (newQty === 0) {
        removeFromCart(item.id_sp);
      } else {
        updateQuantity(item.id_sp, Math.min(newQty, item.soluong_sp || 999));
      }
      setDraftQty(prev => {
        const next = { ...prev };
        delete next[item.id_sp];
        return next;
      });
    } catch (e) {
      setDbError('Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.');
    }
  };

  // Nút "Xóa" từng dòng (Luồng cơ bản bước 4)
  const handleRemove = (id_sp) => {
    try {
      removeFromCart(id_sp);
    } catch (e) {
      setDbError('Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.');
    }
  };

  // Nút "Xóa giỏ hàng" (Luồng cơ bản bước 5)
  const handleClearCart = () => {
    try {
      clearCart();
    } catch (e) {
      setDbError('Không thể kết nối đến cơ sở dữ liệu. Vui lòng thử lại sau.');
    }
  };

  // Nút "Thanh toán" (Luồng rẽ nhánh 2)
  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  // Nút "Tiếp tục mua hàng" (Luồng cơ bản bước 3a)
  const handleContinueShopping = () => {
    onClose();
    navigate('/products');
  };

  return (
    <>
      {/* Overlay phủ màn hình khi mở giỏ hàng */}
      <div className={`cart-drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      {/* Cart Drawer trượt từ bên phải */}
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🛍️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.2 }}>Giỏ Hàng Của Bạn</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({cartItems.length} mặt hàng)</span>
            </div>
          </div>
          <button id="DongGioHang" className="cart-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        {/* Thông báo lỗi CSDL (Luồng rẽ nhánh 3) */}
        {dbError && (
          <div style={{
            background: '#fff2f0', borderLeft: '4px solid #ff4d4f', color: '#cf1322',
            padding: '12px 16px', fontSize: 13, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', margin: '12px 16px 0', borderRadius: 8
          }}>
            <span>⚠️ {dbError}</span>
            <button onClick={() => setDbError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf1322', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Nội dung danh sách mặt hàng */}
        <div className="cart-items" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cartItems.length === 0 ? (
            /* Luồng 5 / Giỏ hàng rỗng */
            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
              <h3 style={{ marginBottom: 8, fontSize: 20 }}>Giỏ hàng rỗng</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                Hiện chưa có mặt hàng nào trong bảng GIOHANG.
              </p>
              <button id="TiepTucMuaHang" className="btn btn-primary" onClick={handleContinueShopping}>
                🛍️ Tiếp tục mua hàng
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cartItems.map(item => {
                const currentQty = getDraft(item);
                const isChanged = draftQty[item.id_sp] !== undefined && draftQty[item.id_sp] !== item.soluong;
                const subtotal = item.gia_sp * item.soluong;

                return (
                  <div
                    key={item.id_sp}
                    style={{
                      background: 'var(--bg)', borderRadius: 12, padding: 14,
                      border: '1px solid var(--border)', display: 'flex', gap: 12,
                      alignItems: 'center', position: 'relative'
                    }}
                  >
                    {/* Ảnh đại diện */}
                    <img
                      src={item.anh_sp ? `${IMG_BASE}${item.anh_sp}` : 'https://placehold.co/72x72/f0ddd0/c8956c?text=Túi'}
                      alt={item.ten_sp}
                      onError={e => { e.target.src = 'https://placehold.co/72x72/f0ddd0/c8956c?text=Túi'; }}
                      style={{
                        width: 70, height: 70, objectFit: 'cover', borderRadius: 10,
                        border: '1px solid var(--border)', flexShrink: 0, background: '#fff'
                      }}
                    />

                    {/* Chi tiết mặt hàng */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 14, color: 'var(--secondary)',
                        marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {item.ten_sp}
                      </div>

                      {/* Đơn giá & Thành tiền */}
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Giá: <strong style={{ color: 'var(--text)' }}>{formatPrice(item.gia_sp)}</strong></span>
                        <span style={{ color: 'var(--text-muted)' }}>|</span>
                        <span style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                          Thành tiền: {formatPrice(subtotal)}
                        </span>
                      </div>

                      {/* Bộ điều khiển Số lượng + Nút Cập nhật */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>SL:</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                          <button
                            id={`GiamSoLuong-${item.id_sp}`}
                            className="qty-btn"
                            style={{ width: 28, height: 28, borderRadius: 0, border: 'none' }}
                            onClick={() => handleQtyChange(item.id_sp, Math.max(0, Number(currentQty) - 1))}
                          >
                            −
                          </button>
                          <input
                            id={`SoLuong-${item.id_sp}`}
                            type="number"
                            min={0}
                            max={item.soluong_sp || 999}
                            value={currentQty}
                            onChange={e => handleQtyChange(item.id_sp, e.target.value === '' ? '' : Number(e.target.value))}
                            style={{
                              width: 44, textAlign: 'center', border: 'none',
                              fontSize: 14, fontWeight: 700, outline: 'none', padding: '2px 0'
                            }}
                          />
                          <button
                            id={`TangSoLuong-${item.id_sp}`}
                            className="qty-btn"
                            style={{ width: 28, height: 28, borderRadius: 0, border: 'none' }}
                            onClick={() => handleQtyChange(item.id_sp, Number(currentQty) + 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* Nút Cập nhật */}
                        {isChanged && (
                          <button
                            id={`CapNhatSoLuong-${item.id_sp}`}
                            onClick={() => handleUpdate(item)}
                            style={{
                              fontSize: 12, padding: '4px 10px', background: 'var(--primary)',
                              color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
                              fontWeight: 700, boxShadow: '0 2px 4px rgba(200,149,108,0.3)'
                            }}
                          >
                            ✓ Cập nhật
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Nút Xóa khỏi giỏ */}
                    <button
                      id={`XoaSanPham-${item.id_sp}`}
                      onClick={() => handleRemove(item.id_sp)}
                      title="Xóa mặt hàng khỏi giỏ"
                      style={{
                        background: '#fff0f0', border: '1px solid #ffccc7',
                        borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                        color: 'var(--error)', fontSize: 12, fontWeight: 600,
                        alignSelf: 'center', flexShrink: 0
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#ff4d4f'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff0f0'}
                    >
                      Xóa
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Tổng tiền + Các nút điều hướng */}
        {cartItems.length > 0 && (
          <div className="cart-footer" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: '#fff' }}>
            {/* Tổng tiền */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 14, padding: '12px 16px', background: 'var(--primary-light)',
              borderRadius: 12, border: '1px solid var(--border)'
            }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng tiền:</span>
              <span style={{ fontWeight: 800, fontSize: 19, color: 'var(--primary-dark)' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Hàng nút chức năng */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Nút Thanh toán */}
              <button
                id="ThanhToan"
                className="btn btn-primary w-full"
                onClick={handleCheckout}
                style={{ justifyContent: 'center', padding: '12px', fontSize: 15 }}
              >
                💳 Thanh Toán
              </button>

              {/* Nút Tiếp tục mua hàng & Xóa giỏ hàng */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  id="TiepTucMuaHang2"
                  className="btn btn-outline"
                  onClick={handleContinueShopping}
                  style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: 13 }}
                >
                  🛍️ Tiếp tục mua hàng
                </button>

                <button
                  id="XoaGioHang"
                  className="btn"
                  onClick={handleClearCart}
                  style={{
                    flex: 1, justifyContent: 'center', padding: '10px', fontSize: 13,
                    background: '#fff0f0', border: '1px solid #ffccc7', color: 'var(--error)',
                    borderRadius: 50, cursor: 'pointer', fontWeight: 600
                  }}
                >
                  🗑️ Xóa giỏ hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
