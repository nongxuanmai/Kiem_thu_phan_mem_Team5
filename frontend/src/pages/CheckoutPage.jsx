import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { donhangAPI } from '../services/api';

const IMG_BASE = '/uploads/';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
}

// ── Quy tắc kiểm tra Validation ──────────────────────────────────────────────
const RULES = {
  hoten: (v) => {
    if (!v || !v.trim()) return 'Họ tên không được để trống.';
    if (v.trim().length < 2) return 'Họ tên quá ngắn.';
    if (!/^[\p{L}\s]+$/u.test(v.trim())) return 'Họ tên chỉ được chứa chữ cái và khoảng trắng.';
    return '';
  },
  sdt: (v) => {
    if (!v) return 'Số điện thoại không được để trống.';
    if (!/^\d+$/.test(v)) return 'Số điện thoại chỉ được chứa chữ số.';
    if (v.length < 10) return `Số điện thoại chưa đủ (hiện có ${v.length}/10 số).`;
    if (v.length > 10) return `Số điện thoại vượt quá 10 số.`;
    if (!/^0(3|5|7|8|9)\d{8}$/.test(v)) return 'Số điện thoại không hợp lệ (phải đủ 10 số và bắt đầu bằng 03, 05, 07, 08, 09).';
    return '';
  },
  email: (v) => {
    if (!v || !v.trim()) return '';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())) {
      return 'Email không đúng định dạng (ví dụ: example@gmail.com).';
    }
    return '';
  },
  diachi: (v) => {
    if (!v || !v.trim()) return 'Địa chỉ giao hàng không được để trống.';
    const str = v.trim();
    if (str.length < 10) return 'Địa chỉ quá ngắn! Vui lòng ghi chi tiết: Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành.';
    
    const keywords = ['đường', 'phường', 'quận', 'huyện', 'tỉnh', 'thành', 'phố', 'xã', 'thôn', 'ấp', 'khu', 'ngõ', 'hẻm', 'số', 'tp', 'tp.'];
    const lower = str.toLowerCase();
    const hasKeyword = keywords.some(kw => lower.includes(kw));
    const hasPunctuationOrSpace = str.includes(',') || str.includes('-') || str.split(' ').length >= 3;

    if (!hasKeyword && !hasPunctuationOrSpace) {
      return 'Địa chỉ không đúng định dạng hoặc không hợp lệ! Ví dụ: Số 123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM.';
    }
    return '';
  }
};

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      color: '#c62828', fontSize: 12, marginTop: 6,
      display: 'flex', alignItems: 'center', gap: 4,
      fontWeight: 500
    }}>
      <span>⚠️</span> {msg}
    </div>
  );
}

function inputStyle(hasError) {
  return hasError ? { borderColor: '#ef5350', boxShadow: '0 0 0 3px rgba(239, 83, 80, 0.15)' } : {};
}

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hoten: user?.hoten || '',
    sdt: '',
    email: '',
    diachi: '',
    phuongthuc: 'COD',
    ghichu: ''
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" />;
  if (cartItems.length === 0) return <Navigate to="/products" />;

  const getError = (field) => (touched[field] && RULES[field] ? RULES[field](form[field]) : '');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    return Object.keys(RULES).every(field => !RULES[field](form[field]));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ hoten: true, sdt: true, email: true, diachi: true });
    
    if (!isFormValid()) {
      setError('Vui lòng kiểm tra và sửa thông tin còn thiếu hoặc sai sót bên dưới!');
      return;
    }

    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        items: cartItems.map(i => ({ id_sp: i.id_sp, soluong: i.soluong }))
      };
      await donhangAPI.create(payload);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container section">
        <h1 style={{ fontFamily: 'Playfair Display,serif', marginBottom: 36 }}>Thanh Toán</h1>

        {error && (
          <div style={{
            background: '#ffeaea', border: '1.5px solid #ef5350',
            borderRadius: 12, padding: '14px 18px', marginBottom: 24,
            color: '#c62828', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span> {error}
          </div>
        )}

        <div className="checkout-grid">
          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="card" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 24, fontFamily: 'Playfair Display,serif' }}>Thông Tin Giao Hàng</h3>
              
              {/* Họ Tên */}
              <div className="form-group">
                <label className="form-label">
                  Họ Tên <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  className="form-control"
                  placeholder="Nhập họ và tên đầy đủ..."
                  value={form.hoten}
                  style={inputStyle(!!getError('hoten'))}
                  onChange={e => handleChange('hoten', e.target.value)}
                  onBlur={() => handleBlur('hoten')}
                />
                <FieldError msg={getError('hoten')} />
              </div>

              {/* SĐT & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Số Điện Thoại <span style={{ color: '#e53935' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Nhập 10 chữ số (0912345678)"
                    value={form.sdt}
                    maxLength={10}
                    style={inputStyle(!!getError('sdt'))}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleChange('sdt', val);
                    }}
                    onBlur={() => handleBlur('sdt')}
                    inputMode="numeric"
                  />
                  <FieldError msg={getError('sdt')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@example.com"
                    value={form.email}
                    style={inputStyle(!!getError('email'))}
                    onChange={e => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                  />
                  <FieldError msg={getError('email')} />
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="form-group">
                <label className="form-label">
                  Địa Chỉ Giao Hàng <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  className="form-control"
                  placeholder="Ghi rõ: Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành"
                  value={form.diachi}
                  style={inputStyle(!!getError('diachi'))}
                  onChange={e => handleChange('diachi', e.target.value)}
                  onBlur={() => handleBlur('diachi')}
                />
                <FieldError msg={getError('diachi')} />
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
