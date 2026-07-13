import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const currentYear = new Date().getFullYear();
const MAX_BIRTH_YEAR = currentYear - 10;

// ── Quy tắc validate ──────────────────────────────────────────────────────────
const RULES = {
  taikhoan: (v) => {
    if (!v) return 'Tài khoản không được để trống.';
    if (v.length < 4 || v.length > 20) return 'Tài khoản phải từ 4 đến 20 ký tự.';
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Chỉ được dùng chữ cái, chữ số và dấu gạch dưới (_), không có khoảng trắng.';
    return '';
  },
  matkhau: (v) => {
    if (!v) return 'Mật khẩu không được để trống.';
    if (v.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    return '';
  },
  hoten: (v) => {
    if (!v) return ''; // Không bắt buộc
    if (!/^[\p{L}\s]+$/u.test(v)) return 'Họ tên chỉ được chứa chữ cái (kể cả có dấu tiếng Việt) và khoảng trắng.';
    return '';
  },
  email: (v) => {
    if (!v) return ''; // Không bắt buộc
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())) {
      return 'Email không đúng định dạng (ví dụ: example@gmail.com).';
    }
    return '';
  },
  sdt: (v) => {
    if (!v) return ''; // Không bắt buộc
    if (v.length < 10) return `Số điện thoại chưa đủ 10 số (hiện mới có ${v.length}/10 số).`;
    if (!/^0(3|5|7|8|9)\d{8}$/.test(v)) return 'Số điện thoại không hợp lệ (phải đủ 10 số và bắt đầu bằng đầu số 03, 05, 07, 08, 09).';
    return '';
  },
  namsinh: (v) => {
    if (!v) return ''; // Không bắt buộc
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1930 || n > MAX_BIRTH_YEAR)
      return `Năm sinh phải từ 1930 đến ${MAX_BIRTH_YEAR}.`;
    return '';
  },
};

// ── Helper components ─────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      color: '#c62828', fontSize: 12, marginTop: 5,
      display: 'flex', alignItems: 'center', gap: 4,
      animation: 'fadeIn .2s ease'
    }}>
      <span>⚠</span> {msg}
    </div>
  );
}

function inputStyle(hasError) {
  return hasError
    ? { borderColor: '#e53935', boxShadow: '0 0 0 2px rgba(229,57,53,.15)' }
    : {};
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    taikhoan: '', matkhau: '', hoten: '',
    email: '', sdt: '', gioitinh: '', namsinh: ''
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const getError = (field) => (touched[field] ? RULES[field](form[field]) : '');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (serverError) setServerError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Kiểm tra toàn bộ form hợp lệ
  const isFormValid = () =>
    Object.keys(RULES).every(f => !RULES[f](form[f]));

  const handleSubmit = async e => {
    e.preventDefault();
    // Mark tất cả fields touched để hiện đầy đủ lỗi
    const allTouched = Object.keys(RULES).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    if (!isFormValid()) return;

    setLoading(true);
    setServerError('');
    try {
      await authAPI.register({
        ...form,
        namsinh: form.namsinh ? Number(form.namsinh) : null
      });
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '100px 0 40px' }}>
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-logo">
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 30, color: 'var(--primary)' }}>
            FashionBag
          </div>
        </div>
        <h2 className="auth-title">Tạo Tài Khoản</h2>
        <p className="auth-sub">Tham gia cộng đồng FashionBag</p>

        {/* Lỗi từ server */}
        {serverError && (
          <div style={{
            background: '#ffeaea', border: '1px solid #e53935',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            color: '#c62828', fontSize: 14, display: 'flex', gap: 8, alignItems: 'flex-start'
          }}>
            <span>⚠️</span> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Row: Tài khoản + Mật khẩu */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-taikhoan">
                Tài Khoản <span style={{ color: '#e53935' }}>*</span>
              </label>
              <input
                id="reg-taikhoan"
                className="form-control"
                placeholder="4–20 ký tự, không dấu cách"
                value={form.taikhoan}
                style={inputStyle(!!getError('taikhoan'))}
                onChange={e => handleChange('taikhoan', e.target.value)}
                onBlur={() => handleBlur('taikhoan')}
                autoComplete="username"
                maxLength={20}
              />
              <FieldError msg={getError('taikhoan')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-matkhau">
                Mật Khẩu <span style={{ color: '#e53935' }}>*</span>
              </label>
              <input
                id="reg-matkhau"
                type="password"
                className="form-control"
                placeholder="Ít nhất 6 ký tự"
                value={form.matkhau}
                style={inputStyle(!!getError('matkhau'))}
                onChange={e => handleChange('matkhau', e.target.value)}
                onBlur={() => handleBlur('matkhau')}
                autoComplete="new-password"
              />
              <FieldError msg={getError('matkhau')} />
            </div>
          </div>

          {/* Họ tên */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-hoten">Họ Tên</label>
            <input
              id="reg-hoten"
              className="form-control"
              placeholder="Nguyễn Văn A (không bắt buộc)"
              value={form.hoten}
              style={inputStyle(!!getError('hoten'))}
              onChange={e => handleChange('hoten', e.target.value)}
              onBlur={() => handleBlur('hoten')}
            />
            <FieldError msg={getError('hoten')} />
          </div>

          {/* Row: Email + SĐT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="text"
                className="form-control"
                placeholder="email@example.com"
                value={form.email}
                style={inputStyle(!!getError('email'))}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
              />
              <FieldError msg={getError('email')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-sdt">Số Điện Thoại</label>
              <input
                id="reg-sdt"
                type="tel"
                className="form-control"
                placeholder="0912345678 (10 số)"
                value={form.sdt}
                style={inputStyle(!!getError('sdt'))}
                onChange={e => {
                  // Chỉ cho nhập số, tối đa 10 ký tự
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleChange('sdt', val);
                }}
                onBlur={() => handleBlur('sdt')}
                maxLength={10}
                inputMode="numeric"
              />
              <FieldError msg={getError('sdt')} />
            </div>
          </div>

          {/* Row: Giới tính + Năm sinh */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-gioitinh">Giới Tính</label>
              <select
                id="reg-gioitinh"
                className="form-control"
                value={form.gioitinh}
                onChange={e => handleChange('gioitinh', e.target.value)}
              >
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-namsinh">Năm Sinh</label>
              <input
                id="reg-namsinh"
                type="number"
                className="form-control"
                placeholder={`1930 – ${MAX_BIRTH_YEAR}`}
                min={1930}
                max={MAX_BIRTH_YEAR}
                value={form.namsinh}
                style={inputStyle(!!getError('namsinh'))}
                onChange={e => handleChange('namsinh', e.target.value)}
                onBlur={() => handleBlur('namsinh')}
                inputMode="numeric"
              />
              <FieldError msg={getError('namsinh')} />
            </div>
          </div>

          {/* Ghi chú quy tắc */}
          <div style={{
            background: 'var(--bg)', borderRadius: 8, padding: '10px 14px',
            fontSize: 12, color: 'var(--text-muted)', marginBottom: 16,
            lineHeight: 1.7
          }}>
            <strong>Lưu ý:</strong> Tài khoản 4–20 ký tự, chỉ chữ/số/gạch dưới.
            SĐT đúng 10 số, bắt đầu bằng 0. Năm sinh 1930–{MAX_BIRTH_YEAR}.
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ justifyContent: 'center' }}
          >
            {loading ? 'Đang đăng ký...' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
