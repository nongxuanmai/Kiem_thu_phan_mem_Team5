import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ── Quy tắc validate ──────────────────────────────────────────────────────────
const RULES = {
  taikhoan: (v) => {
    if (!v) return 'Tài khoản không được để trống.';
    if (v.length < 4 || v.length > 20) return 'Tài khoản phải từ 4 đến 20 ký tự.';
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Tài khoản chỉ được chứa chữ cái, số và dấu gạch dưới (_), không có khoảng trắng.';
    return '';
  },
  matkhau: (v) => {
    if (!v) return 'Mật khẩu không được để trống.';
    if (v.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    return '';
  },
};

// Component hiển thị lỗi inline
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      color: '#c62828', fontSize: 12, marginTop: 5,
      display: 'flex', alignItems: 'center', gap: 5
    }}>
      <span>⚠</span> {msg}
    </div>
  );
}

// Input có viền đỏ khi lỗi
function inputStyle(hasError) {
  return hasError ? { borderColor: '#e53935', boxShadow: '0 0 0 2px rgba(229,57,53,.15)' } : {};
}

export default function LoginPage() {
  const [form, setForm] = useState({ taikhoan: '', matkhau: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Lấy lỗi validate cho một field
  const getError = (field) => (touched[field] ? RULES[field](form[field]) : '');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Xóa server error khi user bắt đầu nhập lại
    if (serverError) setServerError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => Object.keys(RULES).every(f => !RULES[f](form[f]));

  const handleSubmit = async e => {
    e.preventDefault();
    // Mark tất cả fields là touched để show lỗi
    setTouched({ taikhoan: true, matkhau: true });
    if (!isFormValid()) return;

    setLoading(true);
    setServerError('');
    try {
      const res = await authAPI.login(form);
      login(
        { taikhoan: res.data.taikhoan, hoten: res.data.hoten, quyen: res.data.quyen },
        res.data.access_token
      );
      navigate(res.data.quyen === 'admin' ? '/admin' : '/');
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Sai tài khoản hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, color: 'var(--primary)' }}>
            FashionBag
          </div>
        </div>
        <h2 className="auth-title">Chào Mừng Trở Lại</h2>
        <p className="auth-sub">Đăng nhập để tiếp tục mua sắm</p>

        {/* Lỗi từ server */}
        {serverError && (
          <div style={{
            background: '#fff2f2', border: '1.5px solid #ef5350',
            borderRadius: 12, padding: '14px 16px', marginBottom: 20,
            color: '#c62828', fontSize: 14, display: 'flex', gap: 10, alignItems: 'center',
            boxShadow: '0 4px 12px rgba(229, 57, 53, 0.15)'
          }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700 }}>Đăng nhập thất bại</div>
              <div style={{ fontSize: 13, marginTop: 2, opacity: 0.9 }}>
                {serverError || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra và nhập lại!'}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Tài khoản */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-taikhoan">
              Tài Khoản <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              id="login-taikhoan"
              className="form-control"
              placeholder="Nhập tài khoản (4–20 ký tự)"
              value={form.taikhoan}
              style={inputStyle(!!getError('taikhoan'))}
              onChange={e => handleChange('taikhoan', e.target.value)}
              onBlur={() => handleBlur('taikhoan')}
              autoComplete="username"
            />
            <FieldError msg={getError('taikhoan')} />
          </div>

          {/* Mật khẩu */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-matkhau">
              Mật Khẩu <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              id="login-matkhau"
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              value={form.matkhau}
              style={inputStyle(!!getError('matkhau'))}
              onChange={e => handleChange('matkhau', e.target.value)}
              onBlur={() => handleBlur('matkhau')}
              autoComplete="current-password"
            />
            <FieldError msg={getError('matkhau')} />
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
