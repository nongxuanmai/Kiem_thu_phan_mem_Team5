import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RULES = {
  sdt: (v) => {
    if (!v) return '';
    if (v.length < 10) return `Số điện thoại chưa đủ (hiện có ${v.length}/10 số).`;
    if (!/^0(3|5|7|8|9)\d{8}$/.test(v)) return 'Số điện thoại không hợp lệ (phải đủ 10 số và bắt đầu bằng 03, 05, 07, 08, 09).';
    return '';
  },
  email: (v) => {
    if (!v) return '';
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())) {
      return 'Email không đúng định dạng (ví dụ: example@gmail.com).';
    }
    return '';
  }
};

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color: '#c62828', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
      ⚠️ {msg}
    </div>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ hoten: '', gioitinh: '', sdt: '', email: '', namsinh: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    authAPI.getMe().then(r => {
      const d = r.data;
      setForm({ hoten: d.hoten || '', gioitinh: d.gioitinh || '', sdt: d.sdt || '', email: d.email || '', namsinh: d.namsinh || '' });
      setLoading(false);
    });
  }, []);

  const getError = (field) => (touched[field] && RULES[field] ? RULES[field](form[field]) : '');

  const handleSave = async e => {
    e.preventDefault();
    setTouched({ sdt: true, email: true });
    if (RULES.sdt(form.sdt) || RULES.email(form.email)) {
      setMsg('Vui lòng kiểm tra và sửa thông tin bị lỗi trước khi lưu!');
      return;
    }

    setSaving(true); setMsg('');
    try {
      const res = await authAPI.updateMe({ ...form, namsinh: form.namsinh ? Number(form.namsinh) : null });
      login({ ...user, hoten: res.data.hoten }, localStorage.getItem('access_token'));
      setMsg('Cập nhật thành công!');
    } catch {
      setMsg('Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Playfair Display,serif', marginBottom: 8 }}>Hồ Sơ Cá Nhân</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>Cập nhật thông tin tài khoản của bạn</p>

          {msg && (
            <div style={{ background: msg.includes('thành công') ? '#d4edda' : '#ffeaea', border: `1px solid ${msg.includes('thành công') ? 'var(--success)' : 'var(--error)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: msg.includes('thành công') ? 'var(--success)' : 'var(--error)' }}>
              {msg.includes('thành công') ? '✓ ' : '⚠️ '}{msg}
            </div>
          )}

          <div className="card" style={{ padding: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, padding: '20px 24px', background: 'var(--bg)', borderRadius: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff' }}>
                👤
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.hoten || user.taikhoan}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>@{user.taikhoan} · {user.quyen === 'admin' ? '⚙️ Admin' : '👤 Khách hàng'}</div>
              </div>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Họ Tên</label>
                <input className="form-control" placeholder="Nguyễn Văn A" value={form.hoten} onChange={e => setForm({ ...form, hoten: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  />
                  <FieldError msg={getError('email')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số Điện Thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={form.sdt}
                    maxLength={10}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({ ...form, sdt: val });
                    }}
                    onBlur={() => setTouched(t => ({ ...t, sdt: true }))}
                    inputMode="numeric"
                  />
                  <FieldError msg={getError('sdt')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Giới Tính</label>
                  <select className="form-control" value={form.gioitinh} onChange={e => setForm({ ...form, gioitinh: e.target.value })}>
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Năm Sinh</label>
                  <input type="number" className="form-control" placeholder="2000" value={form.namsinh} onChange={e => setForm({ ...form, namsinh: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center', width: '100%' }}>
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
