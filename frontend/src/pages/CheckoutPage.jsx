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

const VOUCHERS = [
  { code: 'FASHION10', name: 'Giảm 10% đơn hàng', type: 'percent', val: 10, freeship: false, desc: 'Giảm 10% trên tổng giá trị sản phẩm' },
  { code: 'FREESHIP30', name: 'Miễn phí vận chuyển 🚚', type: 'ship', val: 30000, freeship: true, desc: 'Miễn 100% phí giao hàng toàn quốc (30.000đ)' },
  { code: 'BAG50K', name: 'Voucher 50.000đ 🏷️', type: 'fixed', val: 50000, freeship: false, desc: 'Trừ trực tiếp 50k vào đơn mua túi' },
  { code: 'VIPBAG20', name: 'Ưu đãi VIP (20% + Miễn ship) 🔥', type: 'combo', val: 20, freeship: true, desc: 'Giảm ngay 20% và Miễn phí vận chuyển' }
];

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
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [voucherMsg, setVoucherMsg] = useState({ type: '', text: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <Navigate to="/login" />;
  if (cartItems.length === 0) return <Navigate to="/products" />;

  // Tính toán giảm giá & tổng tiền
  const originalShipping = 30000;
  const isFreeship = selectedVoucher?.freeship;
  const shippingFee = isFreeship ? 0 : originalShipping;

  let discountAmount = 0;
  if (selectedVoucher) {
    if (selectedVoucher.type === 'percent' || selectedVoucher.type === 'combo') {
      discountAmount = Math.round((totalPrice * selectedVoucher.val) / 100);
    } else if (selectedVoucher.type === 'fixed') {
      discountAmount = selectedVoucher.val;
    }
  }

  const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

  const applyVoucherCode = (codeToApply) => {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) {
      setSelectedVoucher(null);
      setVoucherMsg({ type: '', text: '' });
      return;
    }

    const found = VOUCHERS.find(v => v.code === code);
    if (found) {
      setSelectedVoucher(found);
      setInputCode(found.code);
      setVoucherMsg({ type: 'success', text: `✅ Đã áp dụng voucher: ${found.name}` });
    } else {
      setSelectedVoucher(null);
      setVoucherMsg({ type: 'error', text: '❌ Mã giảm giá không tồn tại hoặc đã hết hạn.' });
    }
  };

  const toggleVoucherSelect = (voucher) => {
    if (selectedVoucher?.code === voucher.code) {
      setSelectedVoucher(null);
      setInputCode('');
      setVoucherMsg({ type: '', text: '' });
    } else {
      setSelectedVoucher(voucher);
      setInputCode(voucher.code);
      setVoucherMsg({ type: 'success', text: `✅ Đã áp dụng voucher: ${voucher.name}` });
    }
  };

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
        tongtien: finalTotal,
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

            <button id="DatHang" type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', fontSize: 16, padding: '16px' }}>
              {loading ? 'Đang xử lý...' : `Đặt Hàng · ${formatPrice(finalTotal)}`}
            </button>
          </form>

          {/* Order Summary & Voucher Selector */}
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

            {/* Chọn Voucher / Mã Giảm Giá */}
            <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                🎟️ Chọn Mã Giảm Giá / Voucher Ship
              </div>

              {/* Ô nhập mã */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  id="MaGiamGia"
                  className="form-control"
                  placeholder="Nhập mã ưu đãi..."
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', fontWeight: 600 }}
                />
                <button
                  id="ApDungVoucher"
                  type="button"
                  className="btn btn-outline"
                  onClick={() => applyVoucherCode()}
                  style={{ flexShrink: 0 }}
                >
                  Áp dụng
                </button>
              </div>

              {/* Thông báo voucher */}
              {voucherMsg.text && (
                <div style={{
                  fontSize: 13, marginBottom: 14, fontWeight: 600,
                  color: voucherMsg.type === 'success' ? '#2e7d32' : '#c62828'
                }}>
                  {voucherMsg.text}
                </div>
              )}

              {/* Danh sách Voucher khả dụng */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                {VOUCHERS.map(v => {
                  const isSelected = selectedVoucher?.code === v.code;
                  return (
                    <div
                      key={v.code}
                      onClick={() => toggleVoucherSelect(v)}
                      style={{
                        padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: isSelected ? 'var(--primary-light)' : '#fff',
                        transition: 'all 0.2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--secondary)' }}>
                          {v.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {v.desc}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        padding: '4px 10px', borderRadius: 20,
                        background: isSelected ? 'var(--primary)' : '#f0f0f0',
                        color: isSelected ? '#fff' : 'var(--text)'
                      }}>
                        {isSelected ? '✓ Đã chọn' : 'Dùng mã'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chi tiết tính tổng tiền */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Tạm tính sản phẩm:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              {/* Phí vận chuyển */}
              <div className="flex-between" style={{ marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                {isFreeship ? (
                  <div>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: 6, fontSize: 12 }}>
                      {formatPrice(originalShipping)}
                    </span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>Miễn phí 🚚</span>
                  </div>
                ) : (
                  <span>{formatPrice(originalShipping)}</span>
                )}
              </div>

              {/* Giảm giá voucher */}
              {discountAmount > 0 && (
                <div className="flex-between" style={{ marginBottom: 8, color: '#e65100' }}>
                  <span>Giảm giá Voucher ({selectedVoucher.code}):</span>
                  <span style={{ fontWeight: 700 }}>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {/* Tổng thanh toán */}
              <div className="flex-between" style={{ borderTop: '1px dashed var(--border)', paddingTop: 12, marginTop: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Tổng thanh toán:</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary-dark)' }}>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
