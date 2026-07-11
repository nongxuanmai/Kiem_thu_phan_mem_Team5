import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ taikhoan: '', matkhau: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(form);
      login({ taikhoan: res.data.taikhoan, hoten: res.data.hoten, quyen: res.data.quyen }, res.data.access_token);
      navigate(res.data.quyen === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, color: 'var(--primary)' }}>FashionBag</div>
        </div>
        <h2 className="auth-title">Chào Mừng Trở Lại</h2>
        <p className="auth-sub">Đăng nhập để tiếp tục mua sắm</p>

        {error && (
          <div style={{ background: '#ffeaea', border: '1px solid var(--error)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: 'var(--error)', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tài Khoản</label>
            <input
              id="taikhoan"
              className="form-control"
              placeholder="Nhập tài khoản"
              value={form.taikhoan}
              onChange={e => setForm({ ...form, taikhoan: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật Khẩu</label>
            <input
              id="matkhau"
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={form.matkhau}
              onChange={e => setForm({ ...form, matkhau: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', marginTop: 8 }}>
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
