import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ taikhoan: '', matkhau: '', hoten: '', email: '', sdt: '', gioitinh: '', namsinh: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authAPI.register({ ...form, namsinh: form.namsinh ? Number(form.namsinh) : null });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '100px 0 40px' }}>
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 30, color: 'var(--primary)' }}>FashionBag</div>
        </div>
        <h2 className="auth-title">Tạo Tài Khoản</h2>
        <p className="auth-sub">Tham gia cộng đồng FashionBag</p>

        {error && (
          <div style={{ background: '#ffeaea', border: '1px solid var(--error)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: 'var(--error)', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Tài Khoản *</label>
              <input id="reg-taikhoan" className="form-control" placeholder="Tài khoản" value={form.taikhoan} onChange={e => setForm({ ...form, taikhoan: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mật Khẩu *</label>
              <input id="reg-matkhau" type="password" className="form-control" placeholder="Mật khẩu" value={form.matkhau} onChange={e => setForm({ ...form, matkhau: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Họ Tên</label>
            <input id="reg-hoten" className="form-control" placeholder="Nguyễn Văn A" value={form.hoten} onChange={e => setForm({ ...form, hoten: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input id="reg-email" type="email" className="form-control" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Số Điện Thoại</label>
              <input id="reg-sdt" className="form-control" placeholder="0901 234 567" value={form.sdt} onChange={e => setForm({ ...form, sdt: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Giới Tính</label>
              <select id="reg-gioitinh" className="form-control" value={form.gioitinh} onChange={e => setForm({ ...form, gioitinh: e.target.value })}>
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Năm Sinh</label>
              <input id="reg-namsinh" type="number" className="form-control" placeholder="2000" min={1900} max={2015} value={form.namsinh} onChange={e => setForm({ ...form, namsinh: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center' }}>
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
