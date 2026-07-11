import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { donhangAPI } from '../services/api';

const IMG_BASE = '/uploads/';
function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ hoten: user?.hoten || '', sdt: '', email: '', diachi: '', phuongthuc: 'COD', ghichu: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" />;
  if (cartItems.length === 0) return <Navigate to="/products" />;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        items: cartItems.map(i => ({ id_sp: i.id_sp, soluong: i.soluong }))
      };
      const res = await donhangAPI.create(payload);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đặt hàng thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        <h1 style={{ fontFamily: 'Playfair Display,serif', marginBottom: 36 }}>Thanh Toán</h1>

        {error && (
          <div style={{ background: '#ffeaea', border: '1px solid var(--error)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: 'var(--error)' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="checkout-grid">
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 24, fontFamily: 'Playfair Display,serif' }}>Thông Tin Giao Hàng</h3>
              <div className="form-group">
                <label className="form-label">Họ Tên *</label>
                <input className="form-control" placeholder="Nguyễn Văn A" value={form.hoten} onChange={e => setForm({ ...form, hoten: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Số Điện Thoại *</label>
                  <input className="form-control" placeholder="0901 234 567" value={form.sdt} onChange={e => setForm({ ...form, sdt: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Địa Chỉ Giao Hàng *</label>
                <input className="form-control" placeholder="Số nhà, đường, phường, quận, tỉnh/thành" value={form.diachi} onChange={e => setForm({ ...form, diachi: e.target.value })} required />
              </div>
            </div>

            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 24, fontFamily: 'Playfair Display,serif' }}>Phương Thức Thanh Toán</h3>
              {[['COD', '💵 Thanh toán khi nhận hàng (COD)'], ['Banking', '🏦 Chuyển khoản ngân hàng'], ['Momo', '📱 Ví MoMo']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${form.phuongthuc === val ? 'var(--primary)' : 'var(--border)'}`, marginBottom: 10, cursor: 'pointer', background: form.phuongthuc === val ? 'var(--primary-light)' : '#fff' }}>
                  <input type="radio" name="phuongthuc" value={val} checked={form.phuongthuc === val} onChange={e => setForm({ ...form, phuongthuc: e.target.value })} />
                  <span style={{ fontWeight: 600 }}>{label}</span>
                </label>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Ghi Chú</label>
              <textarea className="form-control" rows={3} placeholder="Ghi chú thêm về đơn hàng..." value={form.ghichu} onChange={e => setForm({ ...form, ghichu: e.target.value })} style={{ resize: 'vertical' }} />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', fontSize: 16, padding: '16px' }}>
              {loading ? 'Đang xử lý...' : `Đặt Hàng · ${formatPrice(totalPrice)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h3 style={{ fontFamily: 'Playfair Display,serif', marginBottom: 20 }}>Đơn Hàng ({cartItems.length} sản phẩm)</h3>
            {cartItems.map(item => (
              <div key={item.id_sp} className="checkout-item">
                <img
                  className="checkout-item-img"
                  src={item.anh_sp ? `${IMG_BASE}${item.anh_sp}` : 'https://placehold.co/60x60/f0ddd0/c8956c?text=Túi'}
                  alt={item.ten_sp}
                  onError={e => { e.target.src = 'https://placehold.co/60x60/f0ddd0/c8956c?text=Túi'; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.ten_sp}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>x{item.soluong}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(item.gia_sp * item.soluong)}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Miễn phí</span>
              </div>
              <div className="flex-between">
                <span style={{ fontWeight: 700, fontSize: 16 }}>Tổng cộng:</span>
                <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
