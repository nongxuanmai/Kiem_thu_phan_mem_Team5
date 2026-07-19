import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
  const { user, login, logout } = useAuth();
  const [form, setForm] = useState({ hoten: '', gioitinh: '', sdt: '', email: '', namsinh: '' });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // State modal đổi mật khẩu
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ matkhau_cu: '', matkhau_moi: '', nhaplai_matkhau_moi: '' });
  const [pwdTouched, setPwdTouched] = useState({});
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmNewPwd, setShowConfirmNewPwd] = useState(false);
  const [showPwdConfirmModal, setShowPwdConfirmModal] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  // State xóa tài khoản
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    authAPI.getMe()
      .then(r => {
        const d = r.data;
        if (d) {
          setForm({
            hoten: d.hoten || '',
            gioitinh: d.gioitinh || '',
            sdt: d.sdt || '',
            email: d.email || '',
            namsinh: d.namsinh || ''
          });
        }
      })
      .catch(() => {
        if (user) {
          setForm(prev => ({
            ...prev,
            hoten: user.hoten || '',
            sdt: user.sdt || '',
            email: user.email || ''
          }));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const getError = (field) => (touched[field] && RULES[field] ? RULES[field](form[field]) : '');

  const getPwdError = (field) => {
    if (!pwdTouched[field]) return '';
    const v = pwdForm[field];
    if (field === 'matkhau_cu') {
      if (!v) return 'Vui lòng nhập mật khẩu hiện tại.';
    }
    if (field === 'matkhau_moi') {
      if (!v) return 'Mật khẩu mới không được để trống.';
      if (v.length < 6) return 'Mật khẩu mới phải từ 6 ký tự trở lên.';
      if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(v)) return 'Mật khẩu yếu! Nên bao gồm cả chữ cái và chữ số.';
      if (v === pwdForm.matkhau_cu) return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    }
    if (field === 'nhaplai_matkhau_moi') {
      if (!v) return 'Vui lòng xác thực lại mật khẩu mới.';
      if (v !== pwdForm.matkhau_moi) return '❌ Mật khẩu xác thực không trùng khớp! Vui lòng kiểm tra lại.';
    }
    return '';
  };

  const handleSubmitInfo = (e) => {
    e.preventDefault();
    setTouched({ sdt: true, email: true });
    if (RULES.sdt(form.sdt) || RULES.email(form.email)) {
      setMsg('Vui lòng kiểm tra và sửa thông tin bị lỗi trước khi lưu!');
      return;
    }
    setMsg('');
    setShowConfirm(true);
  };

  const executeSaveInfo = async () => {
    setShowConfirm(false);
    setSaving(true);
    setMsg('');
    try {
      const res = await authAPI.updateMe({ ...form, namsinh: form.namsinh ? Number(form.namsinh) : null });
      login({ ...user, hoten: res.data.hoten }, localStorage.getItem('access_token'));
      setMsg('Cập nhật thông tin thành công!');
    } catch {
      setMsg('Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteMsg('');
    try {
      await authAPI.deleteMe();
      setDeleteMsg('__success__');
      setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, 2000);
    } catch {
      setDeleteMsg('Xóa tài khoản thất bại. Vui lòng thử lại sau.');
      setDeleting(false);
    }
  };

  const openPwdModal = () => {
    setPwdForm({ matkhau_cu: '', matkhau_moi: '', nhaplai_matkhau_moi: '' });
    setPwdTouched({});
    setPwdMsg({ type: '', text: '' });
    setShowOldPwd(false);
    setShowNewPwd(false);
    setShowConfirmNewPwd(false);
    setShowPwdModal(true);
  };

  const closePwdModal = () => {
    setShowPwdModal(false);
    setPwdMsg({ type: '', text: '' });
  };

  const handlePreChangePassword = (e) => {
    e.preventDefault();
    setPwdTouched({ matkhau_cu: true, matkhau_moi: true, nhaplai_matkhau_moi: true });
    setPwdMsg({ type: '', text: '' });
    if (
      !pwdForm.matkhau_cu ||
      !pwdForm.matkhau_moi ||
      pwdForm.matkhau_moi.length < 6 ||
      !/^(?=.*[a-zA-Z])(?=.*\d)/.test(pwdForm.matkhau_moi) ||
      pwdForm.matkhau_moi === pwdForm.matkhau_cu ||
      pwdForm.nhaplai_matkhau_moi !== pwdForm.matkhau_moi
    ) {
      setPwdMsg({ type: 'error', text: 'Vui lòng kiểm tra và sửa các thông tin mật khẩu bị lỗi bên dưới!' });
      return;
    }
    setShowPwdConfirmModal(true);
  };

  const executeChangePassword = async () => {
    setShowPwdConfirmModal(false);
    setPwdSaving(true);
    setPwdMsg({ type: '', text: '' });
    try {
      await authAPI.changePassword({
        matkhau_cu: pwdForm.matkhau_cu,
        matkhau_moi: pwdForm.matkhau_moi
      });
      setPwdForm({ matkhau_cu: '', matkhau_moi: '', nhaplai_matkhau_moi: '' });
      setPwdTouched({});
      setPwdMsg({ type: 'success', text: '✅ Đổi mật khẩu thành công! Hãy nhớ mật khẩu mới cho lần đăng nhập sau.' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: '❌ ' + (err.response?.data?.detail || 'Đổi mật khẩu thất bại. Mật khẩu hiện tại không chính xác.') });
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Playfair Display,serif', marginBottom: 8 }}>Hồ Sơ Cá Nhân</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>Cập nhật thông tin cá nhân và quản lý mật khẩu tài khoản</p>

          {/* Card Thông tin cá nhân */}
          <div className="card" style={{ padding: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: '20px 24px', background: 'var(--bg)', borderRadius: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff' }}>
                👤
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.hoten || user.taikhoan}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>@{user.taikhoan} · {user.quyen === 'admin' ? '⚙️ Admin' : '👤 Khách hàng'}</div>
              </div>
            </div>

            <h3 style={{ fontSize: 18, color: 'var(--secondary)', marginBottom: 20, fontFamily: 'Playfair Display,serif' }}>
              📝 Thông Tin Cá Nhân
            </h3>

            {msg && (
              <div style={{ background: msg.includes('thành công') ? '#d4edda' : '#ffeaea', border: `1px solid ${msg.includes('thành công') ? 'var(--success)' : 'var(--error)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: msg.includes('thành công') ? 'var(--success)' : 'var(--error)' }}>
                {msg.includes('thành công') ? '✓ ' : '⚠️ '}{msg}
              </div>
            )}

            <form onSubmit={handleSubmitInfo} noValidate>
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

              <button type="submit" className="btn btn-primary" id="btn-save-profile" disabled={saving} style={{ justifyContent: 'center', width: '100%' }}>
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Thông Tin'}
              </button>
            </form>

            {/* Nút Đổi Mật Khẩu & Xóa Tài Khoản */}
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                id="btn-open-change-password"
                type="button"
                onClick={openPwdModal}
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', gap: 8 }}
              >
                🔒 Đổi Mật Khẩu
              </button>
              <button
                id="btn-open-delete-account"
                type="button"
                onClick={() => { setDeleteMsg(''); setShowDeleteModal(true); }}
                className="btn"
                style={{ width: '100%', justifyContent: 'center', gap: 8, background: 'transparent', border: '1px solid #c62828', color: '#c62828' }}
              >
                🗑️ Xóa Tài Khoản
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Xác nhận Thay Đổi Thông Tin Cá Nhân */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" style={{ maxWidth: 460, borderRadius: 20, padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: 18, color: 'var(--secondary)' }}>📝 Xác Nhận Thay Đổi Thông Tin</h3>
              <button className="cart-close" onClick={() => setShowConfirm(false)} style={{ width: 32, height: 32, fontSize: 16 }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                Bạn có chắc chắn muốn cập nhật thông tin cá nhân với các nội dung sau?
              </p>
              <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 12, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border)' }}>
                <div><strong>Họ tên:</strong> {form.hoten || '(Chưa nhập)'}</div>
                <div><strong>Email:</strong> {form.email || '(Chưa nhập)'}</div>
                <div><strong>Số điện thoại:</strong> {form.sdt || '(Chưa nhập)'}</div>
                <div><strong>Giới tính:</strong> {form.gioitinh || '(Chưa chọn)'}</div>
                <div><strong>Năm sinh:</strong> {form.namsinh || '(Chưa nhập)'}</div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', background: 'var(--bg)', borderRadius: '0 0 20px 20px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} style={{ padding: '8px 20px', fontSize: 14 }}>Hủy</button>
              <button className="btn btn-primary" onClick={executeSaveInfo} style={{ padding: '8px 20px', fontSize: 14 }}>✓ Xác Nhận Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đổi Mật Khẩu */}
      {showPwdModal && (
        <div className="modal-overlay" onClick={closePwdModal}>
          <div className="modal" style={{ maxWidth: 520, borderRadius: 20, padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: 18, color: 'var(--secondary)' }}>🔒 Đổi Mật Khẩu</h3>
              <button className="cart-close" onClick={closePwdModal} style={{ width: 32, height: 32, fontSize: 16 }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
                Để bảo mật tài khoản, không nên chia sẻ mật khẩu cho người khác.
              </p>

              {pwdMsg.text && (
                <div style={{
                  background: pwdMsg.type === 'success' ? '#d4edda' : '#ffeaea',
                  border: `1px solid ${pwdMsg.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                  color: pwdMsg.type === 'success' ? 'var(--success)' : 'var(--error)',
                  fontWeight: 600, fontSize: 14
                }}>
                  {pwdMsg.text}
                </div>
              )}

              <form id="form-change-password" onSubmit={handlePreChangePassword} noValidate>
                {/* Mật khẩu cũ */}
                <div className="form-group">
                  <label className="form-label">Mật Khẩu Hiện Tại <span style={{ color: '#e53935' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showOldPwd ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Nhập mật khẩu hiện tại của bạn"
                      value={pwdForm.matkhau_cu}
                      onChange={e => setPwdForm({ ...pwdForm, matkhau_cu: e.target.value })}
                      onBlur={() => setPwdTouched(t => ({ ...t, matkhau_cu: true }))}
                      style={{ paddingRight: 40 }}
                    />
                    <button type="button" onClick={() => setShowOldPwd(!showOldPwd)} title={showOldPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                      {showOldPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <FieldError msg={getPwdError('matkhau_cu')} />
                </div>

                {/* Mật khẩu mới & Xác thực */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Mật Khẩu Mới <span style={{ color: '#e53935' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Ít nhất 6 ký tự, gồm chữ & số"
                        value={pwdForm.matkhau_moi}
                        onChange={e => setPwdForm({ ...pwdForm, matkhau_moi: e.target.value })}
                        onBlur={() => setPwdTouched(t => ({ ...t, matkhau_moi: true }))}
                        style={{ paddingRight: 40 }}
                      />
                      <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} title={showNewPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                        {showNewPwd ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <FieldError msg={getPwdError('matkhau_moi')} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Xác Thực Mật Khẩu Mới <span style={{ color: '#e53935' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmNewPwd ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Nhập lại mật khẩu mới"
                        value={pwdForm.nhaplai_matkhau_moi}
                        onChange={e => setPwdForm({ ...pwdForm, nhaplai_matkhau_moi: e.target.value })}
                        onBlur={() => setPwdTouched(t => ({ ...t, nhaplai_matkhau_moi: true }))}
                        style={{ paddingRight: 40 }}
                      />
                      <button type="button" onClick={() => setShowConfirmNewPwd(!showConfirmNewPwd)} title={showConfirmNewPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                        {showConfirmNewPwd ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <FieldError msg={getPwdError('nhaplai_matkhau_moi')} />
                  </div>
                </div>

                <button
                  id="btn-submit-change-password"
                  type="submit"
                  className="btn btn-primary"
                  disabled={pwdSaving}
                  style={{ justifyContent: 'center', width: '100%', marginTop: 8 }}
                >
                  {pwdSaving ? 'Đang đổi mật khẩu...' : '🔑 Đổi Mật Khẩu'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Đổi Mật Khẩu */}
      {showPwdConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowPwdConfirmModal(false)}>
          <div className="modal" style={{ maxWidth: 460, borderRadius: 20, padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: 18, color: 'var(--secondary)' }}>🔒 Xác Nhận Đổi Mật Khẩu</h3>
              <button className="cart-close" onClick={() => setShowPwdConfirmModal(false)} style={{ width: 32, height: 32, fontSize: 16 }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 16 }}>
                Bạn có chắc chắn muốn thay đổi mật khẩu tài khoản không?
              </p>
              <div style={{ background: '#fff8e1', padding: '14px 16px', borderRadius: 12, border: '1px solid #ffe082', fontSize: 13, color: '#5d4037', lineHeight: 1.5 }}>
                ⚠️ <strong>Lưu ý:</strong> Mật khẩu cũ sẽ bị vô hiệu hóa ngay lập tức. Bạn cần sử dụng mật khẩu mới để đăng nhập trong các lần truy cập tiếp theo.
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', background: 'var(--bg)', borderRadius: '0 0 20px 20px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowPwdConfirmModal(false)} style={{ padding: '8px 20px', fontSize: 14 }}>Hủy bỏ</button>
              <button className="btn btn-primary" onClick={executeChangePassword} style={{ padding: '8px 20px', fontSize: 14, background: '#c62828', borderColor: '#c62828' }}>
                🔑 Xác Nhận Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Tài Khoản */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 460, borderRadius: 20, padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '20px 24px', background: '#ffeaea', borderRadius: '20px 20px 0 0' }}>
              <h3 style={{ fontSize: 18, color: '#c62828' }}>🗑️ Xóa Tài Khoản</h3>
              {!deleting && (
                <button className="cart-close" onClick={() => setShowDeleteModal(false)} style={{ width: 32, height: 32, fontSize: 16 }}>✕</button>
              )}
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {deleteMsg === '__success__' ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--success)', marginBottom: 8 }}>
                    Xóa tài khoản thành công!
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Đang chuyển về trang đăng nhập...
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>
                    Bạn có chắc chắn muốn <strong style={{ color: '#c62828' }}>xóa vĩnh viễn</strong> tài khoản <strong>@{user.taikhoan}</strong> không?
                  </p>
                  <div style={{ background: '#ffeaea', padding: '14px 16px', borderRadius: 12, border: '1px solid #ef9a9a', fontSize: 13, color: '#b71c1c', lineHeight: 1.6, marginBottom: 16 }}>
                    ⚠️ <strong>Cảnh báo:</strong> Hành động này <strong>không thể hoàn tác</strong>. Toàn bộ thông tin cá nhân và lịch sử đơn hàng của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </div>
                  {deleteMsg && (
                    <div style={{ background: '#ffeaea', border: '1px solid var(--error)', borderRadius: 10, padding: '10px 14px', color: 'var(--error)', fontWeight: 600, fontSize: 13 }}>
                      ❌ {deleteMsg}
                    </div>
                  )}
                </>
              )}
            </div>
            {deleteMsg !== '__success__' && (
              <div className="modal-footer" style={{ padding: '16px 24px', background: 'var(--bg)', borderRadius: '0 0 20px 20px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  style={{ padding: '8px 20px', fontSize: 14 }}
                >
                  Hủy bỏ
                </button>
                <button
                  id="btn-confirm-delete-account"
                  className="btn btn-primary"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  style={{ padding: '8px 20px', fontSize: 14, background: '#c62828', borderColor: '#c62828' }}
                >
                  {deleting ? 'Đang xóa...' : '🗑️ Xác Nhận Xóa'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

  );
}
