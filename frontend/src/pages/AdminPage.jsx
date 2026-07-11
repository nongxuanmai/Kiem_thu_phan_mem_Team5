import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sanphamAPI, danhmucAPI, donhangAPI, authAPI } from '../services/api';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
}

const TABS = [
  { key: 'dashboard', label: '📊 Tổng Quan' },
  { key: 'products', label: '👜 Sản Phẩm' },
  { key: 'categories', label: '🗂️ Danh Mục' },
  { key: 'orders', label: '📦 Đơn Hàng' },
  { key: 'users', label: '👥 Người Dùng' },
];

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, oRes, uRes] = await Promise.all([
        sanphamAPI.getAll(), danhmucAPI.getAll(), donhangAPI.getAll(), authAPI.getUsers()
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
      setOrders(oRes.data);
      setUsers(uRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.tongtien || 0), 0);

  // ── Product Modal ──────────────────────────────────────────
  const openProductModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : { ten_sp: '', gia_sp: '', soluong_sp: '', mausac_sp: '', chatlieu_sp: '', kichthuoc_sp: '', mota_sp: '', id_dm: '' });
    setShowModal('product');
  };
  const saveProduct = async e => {
    e.preventDefault();
    const data = { ...form, gia_sp: Number(form.gia_sp), soluong_sp: Number(form.soluong_sp), id_dm: Number(form.id_dm) || null };
    if (editItem) await sanphamAPI.update(editItem.id_sp, data);
    else await sanphamAPI.create(data);
    setShowModal(false); loadData(); setMsg('Đã lưu sản phẩm!');
  };
  const deleteProduct = async id => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    await sanphamAPI.delete(id); loadData(); setMsg('Đã xóa!');
  };

  // ── Category Modal ─────────────────────────────────────────
  const openCatModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { tendanhmuc: item.tendanhmuc } : { tendanhmuc: '' });
    setShowModal('category');
  };
  const saveCategory = async e => {
    e.preventDefault();
    if (editItem) await danhmucAPI.update(editItem.id_dm, form);
    else await danhmucAPI.create(form);
    setShowModal(false); loadData(); setMsg('Đã lưu danh mục!');
  };
  const deleteCat = async id => {
    if (!window.confirm('Xóa danh mục này?')) return;
    await danhmucAPI.delete(id); loadData(); setMsg('Đã xóa!');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">⚙️ FashionBag</div>
        {TABS.map(t => (
          <div key={t.key} className={`admin-nav-item ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: 40 }}>
          <Link to="/" className="admin-nav-item">🏠 Về Trang Chủ</Link>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {msg && <div style={{ background: '#d4edda', borderRadius: 10, padding: '12px 20px', marginBottom: 20, color: '#155724', fontWeight: 600 }}>✓ {msg}</div>}

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <>
            <div className="admin-header"><h1>Tổng Quan</h1><p>Chào mừng, {user.hoten || user.taikhoan}!</p></div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: '#fff3e0' }}>👜</div>
                <div className="stat-card-num">{products.length}</div>
                <div className="stat-card-label">Sản Phẩm</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: '#e8f5e9' }}>📦</div>
                <div className="stat-card-num">{orders.length}</div>
                <div className="stat-card-label">Đơn Hàng</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: '#e3f2fd' }}>👥</div>
                <div className="stat-card-num">{users.length}</div>
                <div className="stat-card-label">Người Dùng</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: '#fce4ec' }}>💰</div>
                <div className="stat-card-num" style={{ fontSize: 20 }}>{formatPrice(totalRevenue)}</div>
                <div className="stat-card-label">Tổng Doanh Thu</div>
              </div>
            </div>
            <h3 style={{ marginBottom: 16, fontFamily: 'Playfair Display,serif' }}>Đơn Hàng Gần Đây</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Khách Hàng</th><th>Tổng Tiền</th><th>Thời Gian</th></tr></thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id_donhang}>
                      <td>#{o.id_donhang}</td>
                      <td>{o.hoten}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatPrice(o.tongtien)}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(o.thoigiandat).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <>
            <div className="admin-header flex-between">
              <div><h1>Quản Lý Sản Phẩm</h1><p>{products.length} sản phẩm</p></div>
              <button className="btn btn-primary" onClick={() => openProductModal()}>+ Thêm Sản Phẩm</button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Tên Sản Phẩm</th><th>Danh Mục</th><th>Giá</th><th>SL</th><th>Hành Động</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id_sp}>
                      <td>{p.id_sp}</td>
                      <td style={{ fontWeight: 600 }}>{p.ten_sp}</td>
                      <td><span className="badge badge-primary">{p.tendanhmuc || 'N/A'}</span></td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatPrice(p.gia_sp)}</td>
                      <td><span className={`badge ${p.soluong_sp > 0 ? 'badge-success' : 'badge-danger'}`}>{p.soluong_sp}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openProductModal(p)}>Sửa</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id_sp)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <>
            <div className="admin-header flex-between">
              <div><h1>Quản Lý Danh Mục</h1><p>{categories.length} danh mục</p></div>
              <button className="btn btn-primary" onClick={() => openCatModal()}>+ Thêm Danh Mục</button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Tên Danh Mục</th><th>Hành Động</th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id_dm}>
                      <td>{c.id_dm}</td>
                      <td style={{ fontWeight: 600 }}>{c.tendanhmuc}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openCatModal(c)}>Sửa</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteCat(c.id_dm)}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <>
            <div className="admin-header"><h1>Quản Lý Đơn Hàng</h1><p>{orders.length} đơn hàng</p></div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Khách Hàng</th><th>SĐT</th><th>Địa Chỉ</th><th>Tổng Tiền</th><th>PT TT</th><th>Ngày Đặt</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id_donhang}>
                      <td>#{o.id_donhang}</td>
                      <td style={{ fontWeight: 600 }}>{o.hoten}</td>
                      <td>{o.sdt}</td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.diachi}</td>
                      <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatPrice(o.tongtien)}</td>
                      <td><span className="badge badge-primary">{o.phuongthuc}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(o.thoigiandat).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <>
            <div className="admin-header"><h1>Quản Lý Người Dùng</h1><p>{users.length} tài khoản</p></div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Tài Khoản</th><th>Họ Tên</th><th>Email</th><th>SĐT</th><th>Quyền</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id_nguoidung}>
                      <td>{u.id_nguoidung}</td>
                      <td style={{ fontWeight: 600 }}>@{u.taikhoan}</td>
                      <td>{u.hoten}</td>
                      <td>{u.email}</td>
                      <td>{u.sdt}</td>
                      <td><span className={`badge ${u.quyen === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.quyen}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Product Modal */}
      {showModal === 'product' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={saveProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên Sản Phẩm *</label>
                  <input className="form-control" value={form.ten_sp || ''} onChange={e => setForm({ ...form, ten_sp: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Giá (VNĐ) *</label>
                    <input type="number" className="form-control" value={form.gia_sp || ''} onChange={e => setForm({ ...form, gia_sp: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số Lượng</label>
                    <input type="number" className="form-control" value={form.soluong_sp || ''} onChange={e => setForm({ ...form, soluong_sp: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Màu Sắc</label>
                    <input className="form-control" value={form.mausac_sp || ''} onChange={e => setForm({ ...form, mausac_sp: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chất Liệu</label>
                    <input className="form-control" value={form.chatlieu_sp || ''} onChange={e => setForm({ ...form, chatlieu_sp: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Kích Thước</label>
                    <input className="form-control" placeholder="VD: 25x15x10 cm" value={form.kichthuoc_sp || ''} onChange={e => setForm({ ...form, kichthuoc_sp: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Danh Mục</label>
                    <select className="form-control" value={form.id_dm || ''} onChange={e => setForm({ ...form, id_dm: e.target.value })}>
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(c => <option key={c.id_dm} value={c.id_dm}>{c.tendanhmuc}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô Tả</label>
                  <textarea className="form-control" rows={3} value={form.mota_sp || ''} onChange={e => setForm({ ...form, mota_sp: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showModal === 'category' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>{editItem ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}</h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={saveCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên Danh Mục *</label>
                  <input className="form-control" value={form.tendanhmuc || ''} onChange={e => setForm({ tendanhmuc: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
