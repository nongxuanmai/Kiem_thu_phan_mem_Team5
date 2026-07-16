import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function ForgotPasswordPage() {
  const [matkhauMoi, setMatkhauMoi] = useState('');
  const [xacNhanLan1, setXacNhanLan1] = useState('');
  const [xacNhanLan2, setXacNhanLan2] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [showLan1, setShowLan1] = useState(false);
  const [showLan2, setShowLan2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    // Validate Mật khẩu mới
    if (!matkhauMoi) {
      setFormMsg({ type: 'error', text: 'Vui lòng nhập Mật khẩu mới.' });
      return;
    }
    if (matkhauMoi.length < 6) {
      setFormMsg({ type: 'error', text: 'Mật khẩu mới phải từ 6 ký tự trở lên.' });
      return;
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(matkhauMoi)) {
      setFormMsg({ type: 'error', text: 'Mật khẩu yếu! Nên bao gồm cả chữ cái và chữ số.' });
      return;
    }

    // Validate Xác nhận Lần 1
    if (!xacNhanLan1) {
      setFormMsg({ type: 'error', text: 'Vui lòng nhập Xác Nhận Mật Khẩu (Lần 1).' });
      return;
    }
    if (xacNhanLan1 !== matkhauMoi) {
      setFormMsg({ type: 'error', text: '❌ Xác nhận mật khẩu Lần 1 không trùng khớp với mật khẩu mới!' });
      return;
    }

    // Validate Xác nhận Lần 2
    if (!xacNhanLan2) {
      setFormMsg({ type: 'error', text: 'Vui lòng nhập Xác Nhận Mật Khẩu (Lần 2).' });
      return;
    }
    if (xacNhanLan2 !== matkhauMoi) {
      setFormMsg({ type: 'error', text: '❌ Xác nhận mật khẩu Lần 2 không trùng khớp với mật khẩu mới!' });
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPasswordDirect({ matkhau_moi: matkhauMoi });
      setFormMsg({
        type: 'success',
        text: `✅ ${res.data.message || 'Đặt lại mật khẩu thành công! Đang chuyển đến trang Đăng nhập...'}`
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setFormMsg({
        type: 'error',
        text: '❌ ' + (err.response?.data?.detail || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại!')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '80px 0 40px' }}>
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, color: 'var(--primary)' }}>
            FashionBag
          </div>
        </div>
        <h2 className="auth-title">Đặt Lại Mật Khẩu</h2>
        <p className="auth-sub">Tạo mật khẩu mới cho tài khoản của bạn</p>

        {/* Thông báo kết quả Form */}
        {formMsg.text && (
          <div style={{
            background: formMsg.type === 'success' ? '#d4edda' : '#ffeaea',
            border: `1px solid ${formMsg.type === 'success' ? 'var(--success)' : '#e53935'}`,
            borderRadius: 12, padding: '14px 16px', marginBottom: 20,
            color: formMsg.type === 'success' ? 'var(--success)' : '#c62828',
            fontSize: 14, fontWeight: 600, lineHeight: 1.5
          }}>
            {formMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Ô 1: Mật khẩu mới */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-new-pwd">
              Mật Khẩu Mới <span style={{ color: '#e53935' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-new-pwd"
                type={showPwd ? 'text' : 'password'}
                className="form-control"
                placeholder="Ít nhất 6 ký tự (bao gồm cả chữ & số)"
                value={matkhauMoi}
                onChange={e => setMatkhauMoi(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                title={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                  color: 'var(--text-muted)'
                }}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Ô 2: Xác nhận lại mật khẩu Lần 1 */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirm-lan1">
              Xác Nhận Mật Khẩu (Lần 1) <span style={{ color: '#e53935' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-confirm-lan1"
                type={showLan1 ? 'text' : 'password'}
                className="form-control"
                placeholder="Nhập lại mật khẩu mới lần 1"
                value={xacNhanLan1}
                onChange={e => setXacNhanLan1(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowLan1(!showLan1)}
                title={showLan1 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                  color: 'var(--text-muted)'
                }}
              >
                {showLan1 ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Ô 3: Xác nhận lại mật khẩu Lần 2 */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirm-lan2">
              Xác Nhận Mật Khẩu (Lần 2) <span style={{ color: '#e53935' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-confirm-lan2"
                type={showLan2 ? 'text' : 'password'}
                className="form-control"
                placeholder="Nhập lại mật khẩu mới lần 2"
                value={xacNhanLan2}
                onChange={e => setXacNhanLan2(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowLan2(!showLan2)}
                title={showLan2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                  color: 'var(--text-muted)'
                }}
              >
                {showLan2 ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 16, height: 48, fontSize: 15 }}
          >
            {loading ? 'Đang cập nhật mật khẩu...' : '🔑 Xác Nhận Đặt Lại Mật Khẩu'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 24 }}>
          Nhớ lại mật khẩu? <Link to="/login" style={{ fontWeight: 700 }}>Quay lại Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
