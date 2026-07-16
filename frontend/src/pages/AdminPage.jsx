import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sanphamAPI, danhmucAPI, donhangAPI, authAPI } from '../services/api';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
}

function formatDateTime(dt) {
  if (!dt) return '---';
  const d = new Date(dt);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${hh}:${mm} - ${dd}/${mo}/${yyyy}`;
}

const TABS = [
  { key: 'dashboard', label: '📊 Tổng Quan' },
  { key: 'products', label: '👜 Sản Phẩm' },
  { key: 'categories', label: '🗂️ Danh Mục' },
  { key: 'orders', label: '📦 Đơn Hàng' },
  { key: 'cancel', label: '🚫 Yêu Cầu Hủy' },
  { key: 'users', label: '👥 Người Dùng' },
];

const ORDER_STATUSES = ['Đã đặt', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];

const STATUS_STYLE = {
  'Đã đặt':        { bg: '#e3f2fd', color: '#1565c0' },
  'Đang xử lý':    { bg: '#fff8e1', color: '#f57f17' },
  'Đang giao':     { bg: '#e8f5e9', color: '#2e7d32' },
  'Đã giao':       { bg: '#f3e5f5', color: '#6a1b9a' },
  'Chờ duyệt hủy': { bg: '#fff3e0', color: '#e65100' },
  'Đã hủy':        { bg: '#ffebee', color: '#b71c1c' },
};

// ── Sort Bar Component ─────────────────────────────────────
function SortBar({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '10px 16px', marginBottom: 18,
      flexWrap: 'wrap'
    }}>
      <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>⇅ Sắp xếp theo:</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: '1.5px solid',
              borderColor: value === opt.value ? 'var(--primary)' : 'var(--border)',
              background: value === opt.value ? 'var(--primary)' : 'transparent',
              color: value === opt.value ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [productSort, setProductSort] = useState('id_asc');
  const [orderSort, setOrderSort] = useState('id_desc');
  const [viewOrder, setViewOrder] = useState(null); // order detail modal

  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, oRes, uRes, crRes] = await Promise.all([
        sanphamAPI.getAll(), danhmucAPI.getAll(), donhangAPI.getAll(),
        authAPI.getUsers(), donhangAPI.getCancelRequests()
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
      setOrders(oRes.data);
      setUsers(uRes.data);
      setCancelRequests(crRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalRevenue = orders.reduce((s, o) => s + (o.tongtien || 0), 0);

  // ── Product Modal ──────────────────────────────────────────
  const openProductModal = (item = null) => {
    setEditItem(item);
    setForm(item ? { ...item } : { ten_sp: '', gia_sp: '', soluong_sp: '', mausac_sp: '', chatlieu_sp: '', kichthuoc_sp: '', mota_sp: '', id_dm: '', anh_sp: '' });
    setSelectedFile(null);
    // Hiển thị ảnh hiện tại khi sửa sản phẩm
    setPreviewUrl(item?.anh_sp ? `/uploads/${item.anh_sp}` : null);
    setShowModal('product');
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDropZone = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target.files[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  };
  const saveProduct = async e => {
    e.preventDefault();
    try {
      const data = { 
        ...form, 
        gia_sp: Number(form.gia_sp), 
        soluong_sp: Number(form.soluong_sp), 
        id_dm: Number(form.id_dm) || null 
      };
      
      let savedProduct;
      if (editItem) {
        const res = await sanphamAPI.update(editItem.id_sp, data);
        savedProduct = res.data;
      } else {
        const res = await sanphamAPI.create(data);
        savedProduct = res.data;
      }

      if (selectedFile && savedProduct) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await sanphamAPI.uploadImage(savedProduct.id_sp, formData);
      }

      setShowModal(false);
      setSelectedFile(null);
      loadData();
      setMsg('Đã lưu sản phẩm!');
    } catch (error) {
      console.error(error);
      setMsg('❌ Lỗi khi lưu sản phẩm!');
    }
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

  // ── Cancel Request handlers ─────────────────────────────────
  const handleReviewCancel = async (id, chap_thuan) => {
    const action = chap_thuan ? 'duyệt hủy' : 'từ chối hủy';
    if (!window.confirm(`Xác nhận ${action} đơn #${id}?`)) return;
    try {
      await donhangAPI.reviewCancel(id, chap_thuan);
      setMsg(chap_thuan ? `Đã duyệt hủy đơn #${id}. Tồn kho đã được hoàn trả.` : `Đã từ chối yêu cầu hủy đơn #${id}.`);
      loadData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.detail || 'Thao tác thất bại.'));
    }
  };

  const handleUpdateStatus = async (id, trangthai) => {
    try {
      await donhangAPI.updateStatus(id, trangthai);
      setMsg(`Đã cập nhật trạng thái đơn #${id} thành '${trangthai}'.`);
      loadData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.detail || 'Cập nhật thất bại.'));
    }
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
              <div className="stat-card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setTab('cancel')}>
                <div className="stat-card-icon" style={{ background: '#ffebee' }}>🚫</div>
                <div className="stat-card-num" style={{ color: cancelRequests.length > 0 ? '#b71c1c' : undefined }}>
                  {cancelRequests.length}
                </div>
                <div className="stat-card-label">Chờ Duyệt Hủy</div>
                {cancelRequests.length > 0 && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#b71c1c', color: '#fff',
                    borderRadius: '50%', width: 20, height: 20,
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{cancelRequests.length}</span>
                )}
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
                      <td style={{ color: 'var(--text-muted)' }}>{formatDateTime(o.thoigiandat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Products Tab */}
        {tab === 'products' && (() => {
          const PRODUCT_SORT_OPTIONS = [
            { value: 'id_asc',    label: '📋 Theo Mã (↑)' },
            { value: 'id_desc',   label: '📋 Theo Mã (↓)' },
            { value: 'name_az',   label: '🔤 A → Z' },
            { value: 'name_za',   label: '🔤 Z → A' },
            { value: 'price_asc', label: '💰 Giá Thấp → Cao' },
            { value: 'price_desc',label: '💰 Giá Cao → Thấp' },
            { value: 'stock_asc', label: '📦 Tồn Kho (↑)' },
            { value: 'stock_desc',label: '📦 Tồn Kho (↓)' },
          ];
          const sortedProducts = [...products].sort((a, b) => {
            switch (productSort) {
              case 'id_asc':     return a.id_sp - b.id_sp;
              case 'id_desc':    return b.id_sp - a.id_sp;
              case 'name_az':    return (a.ten_sp || '').localeCompare(b.ten_sp || '', 'vi');
              case 'name_za':    return (b.ten_sp || '').localeCompare(a.ten_sp || '', 'vi');
              case 'price_asc':  return (a.gia_sp || 0) - (b.gia_sp || 0);
              case 'price_desc': return (b.gia_sp || 0) - (a.gia_sp || 0);
              case 'stock_asc':  return (a.soluong_sp || 0) - (b.soluong_sp || 0);
              case 'stock_desc': return (b.soluong_sp || 0) - (a.soluong_sp || 0);
              default: return 0;
            }
          });
          return (
            <>
              <div className="admin-header flex-between">
                <div><h1>Quản Lý Sản Phẩm</h1><p>{products.length} sản phẩm</p></div>
                <button className="btn btn-primary" onClick={() => openProductModal()}>+ Thêm Sản Phẩm</button>
              </div>
              <SortBar options={PRODUCT_SORT_OPTIONS} value={productSort} onChange={setProductSort} />
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Ảnh</th><th>Tên Sản Phẩm</th><th>Danh Mục</th><th>Giá</th><th>SL</th><th>Hành Động</th></tr></thead>
                  <tbody>
                    {sortedProducts.map(p => (
                      <tr key={p.id_sp}>
                        <td>{p.id_sp}</td>
                        <td>
                          <img
                            src={p.anh_sp ? `/uploads/${p.anh_sp}` : `https://placehold.co/50x50/f0ddd0/c8956c?text=Bag`}
                            alt={p.ten_sp}
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                            onError={e => { e.target.src = `https://placehold.co/50x50/f0ddd0/c8956c?text=Bag`; }}
                          />
                        </td>
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
          );
        })()}

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
        {tab === 'orders' && (() => {
          const STATUS_ORDER = ['Đã đặt','Đang xử lý','Đang giao','Đã giao','Chờ duyệt hủy','Đã hủy'];
          const ORDER_SORT_OPTIONS = [
            { value: 'id_desc',      label: '📋 Mã Mới Nhất' },
            { value: 'id_asc',       label: '📋 Mã Cũ Nhất' },
            { value: 'date_desc',    label: '📅 Ngày Mới → Cũ' },
            { value: 'date_asc',     label: '📅 Ngày Cũ → Mới' },
            { value: 'price_desc',   label: '💰 Giá Cao → Thấp' },
            { value: 'price_asc',    label: '💰 Giá Thấp → Cao' },
            { value: 'status_asc',   label: '🔖 Theo Trạng Thái' },
            { value: 'customer_az',  label: '👤 Khách A → Z' },
          ];
          const sortedOrders = [...orders].sort((a, b) => {
            switch (orderSort) {
              case 'id_asc':      return a.id_donhang - b.id_donhang;
              case 'id_desc':     return b.id_donhang - a.id_donhang;
              case 'date_asc':    return new Date(a.thoigiandat) - new Date(b.thoigiandat);
              case 'date_desc':   return new Date(b.thoigiandat) - new Date(a.thoigiandat);
              case 'price_asc':   return (a.tongtien || 0) - (b.tongtien || 0);
              case 'price_desc':  return (b.tongtien || 0) - (a.tongtien || 0);
              case 'status_asc':  return STATUS_ORDER.indexOf(a.trangthai) - STATUS_ORDER.indexOf(b.trangthai);
              case 'customer_az': return (a.hoten || '').localeCompare(b.hoten || '', 'vi');
              default: return 0;
            }
          });
          return (
            <>
              <div className="admin-header"><h1>Quản Lý Đơn Hàng</h1><p>{orders.length} đơn hàng</p></div>
              <SortBar options={ORDER_SORT_OPTIONS} value={orderSort} onChange={setOrderSort} />
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Khách Hàng</th><th>SĐT</th><th>Tổng Tiền</th><th>Trạng Thái</th><th>Ngày Đặt</th><th>Thao Tác</th></tr></thead>
                  <tbody>
                    {sortedOrders.map(o => {
                      const ss = STATUS_STYLE[o.trangthai] || { bg: '#f5f5f5', color: '#616161' };
                      return (
                        <tr
                          key={o.id_donhang}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setViewOrder(o)}
                        >
                          <td>#{o.id_donhang}</td>
                          <td style={{ fontWeight: 600 }}>{o.hoten}</td>
                          <td>{o.sdt}</td>
                          <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatPrice(o.tongtien)}</td>
                          <td>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px',
                              borderRadius: 20, fontSize: 12, fontWeight: 700,
                              background: ss.bg, color: ss.color
                            }}>{o.trangthai || 'Đã đặt'}</span>
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatDateTime(o.thoigiandat)}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 10px', fontSize: 12 }}
                                onClick={e => { e.stopPropagation(); setViewOrder(o); }}
                                title="Xem chi tiết"
                              >
                                👁️ Xem
                              </button>
                              <select
                                className="form-control"
                                style={{ padding: '4px 8px', fontSize: 12, minWidth: 120 }}
                                value={o.trangthai || 'Đã đặt'}
                                onChange={e => handleUpdateStatus(o.id_donhang, e.target.value)}
                                disabled={o.trangthai === 'Đã hủy' || o.trangthai === 'Chờ duyệt hủy'}
                              >
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}

        {/* Cancel Requests Tab */}
        {tab === 'cancel' && (
          <>
            <div className="admin-header">
              <h1>Yêu Cầu Hủy Đơn Hàng</h1>
              <p>{cancelRequests.length} yêu cầu đang chờ duyệt</p>
            </div>
            {cancelRequests.length === 0 ? (
              <div className="empty-state" style={{ padding: 60 }}>
                <div style={{ fontSize: 56 }}>✅</div>
                <h3>Không có yêu cầu hủy nào</h3>
                <p style={{ color: 'var(--text-muted)' }}>Tất cả yêu cầu hủy đơn đã được xử lý.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cancelRequests.map(o => (
                  <div key={o.id_donhang} style={{
                    background: 'var(--surface)', borderRadius: 12,
                    padding: 24, border: '1px solid var(--border)',
                    borderLeft: '4px solid #ff9800'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Đơn #{o.id_donhang}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 12 }}>Khách: {o.hoten} &middot; {o.sdt}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(o.tongtien)}</span>
                    </div>
                    <div style={{
                      background: '#fff3e0', borderRadius: 8,
                      padding: '10px 14px', marginBottom: 14, fontSize: 13
                    }}>
                      <strong style={{ color: '#e65100' }}>📝 Lý do hủy: </strong>
                      <span style={{ color: '#5d4037' }}>{o.lydo_huy}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        id={`btn-reject-cancel-${o.id_donhang}`}
                        className="btn btn-outline btn-sm"
                        onClick={() => handleReviewCancel(o.id_donhang, false)}
                      >
                        ❌ Từ chối hủy
                      </button>
                      <button
                        id={`btn-approve-cancel-${o.id_donhang}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReviewCancel(o.id_donhang, true)}
                      >
                        ✅ Duyệt hủy đơn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {/* ── Image Upload Zone ── */}
                <div className="form-group">
                  <label className="form-label">Hình Ảnh Sản Phẩm</label>
                  <div style={{ display: 'grid', gridTemplateColumns: previewUrl ? '120px 1fr' : '1fr', gap: 16, alignItems: 'flex-start' }}>
                    {/* Preview */}
                    {previewUrl && (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={previewUrl}
                          alt="preview"
                          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid var(--primary)', display: 'block' }}
                          onError={e => { e.target.src = 'https://placehold.co/120x120/f0ddd0/c8956c?text=Bag'; }}
                        />
                        <button
                          type="button"
                          onClick={() => { setPreviewUrl(null); setSelectedFile(null); setForm({ ...form, anh_sp: '' }); }}
                          style={{
                            position: 'absolute', top: -8, right: -8,
                            background: '#e53935', color: '#fff',
                            border: 'none', borderRadius: '50%',
                            width: 22, height: 22, fontSize: 13,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1
                          }}
                          title="Xóa ảnh"
                        >✕</button>
                      </div>
                    )}
                    {/* Upload area */}
                    <div>
                      <label
                        htmlFor="img-upload-input"
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDropZone}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: 8, padding: '20px 16px',
                          border: '2px dashed var(--primary)', borderRadius: 12,
                          background: '#fdf7f3', cursor: 'pointer',
                          transition: 'background 0.2s',
                          minHeight: 90,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5e8e0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fdf7f3'}
                      >
                        <span style={{ fontSize: 28 }}>📁</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)' }}>
                          {selectedFile ? selectedFile.name : 'Nhấn hoặc kéo ảnh vào đây'}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG, WEBP — tối đa 5MB</span>
                      </label>
                      <input
                        id="img-upload-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleDropZone(e)}
                      />
                      {/* Hoặc nhập đường dẫn thủ công */}
                      <div style={{ marginTop: 10 }}>
                        <input
                          className="form-control"
                          placeholder="Hoặc nhập đường dẫn: TuiXach/tx1.png"
                          value={selectedFile ? '' : (form.anh_sp || '')}
                          disabled={!!selectedFile}
                          onChange={e => {
                            setForm({ ...form, anh_sp: e.target.value });
                            setPreviewUrl(e.target.value ? `/uploads/${e.target.value}` : null);
                          }}
                          style={{ fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>
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

      {/* ── Order Detail Modal ───────────────────────────────────── */}
      {viewOrder && (() => {
        const o = viewOrder;
        const items = o.items || [];
        const ss = STATUS_STYLE[o.trangthai] || { bg: '#f5f5f5', color: '#616161' };
        return (
          <div className="modal-overlay" onClick={() => setViewOrder(null)} style={{ zIndex: 2000 }}>
            <div
              className="modal"
              style={{ maxWidth: 680, borderRadius: 20, padding: 0, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div style={{
                padding: '20px 28px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 20, color: 'var(--secondary)', fontFamily: 'Playfair Display,serif' }}>
                      📦 Đơn Hàng #{o.id_donhang}
                    </h3>
                    <span style={{
                      padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: ss.bg, color: ss.color
                    }}>{o.trangthai || 'Đã đặt'}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                    📅 Đặt lúc: <strong>{formatDateTime(o.thoigiandat)}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setViewOrder(null)}
                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}
                >✕</button>
              </div>

              {/* ── Body (scrollable) ── */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Thông tin khách hàng */}
                <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    👤 Thông Tin Khách Hàng
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 14 }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Họ tên:</span> <strong>{o.hoten}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>SĐT:</span> <strong>{o.sdt}</strong></div>
                    {o.email && <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{o.email}</strong></div>}
                    <div><span style={{ color: 'var(--text-muted)' }}>Thanh toán:</span> <strong>{o.phuongthuc}</strong></div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ color: 'var(--text-muted)' }}>📍 Địa chỉ:</span> <strong>{o.diachi}</strong>
                    </div>
                    {o.ghichu && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: 'var(--text-muted)' }}>📝 Ghi chú:</span> <em style={{ color: 'var(--text)' }}>{o.ghichu}</em>
                      </div>
                    )}
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    🛍️ Sản Phẩm Đã Đặt ({items.length})
                  </div>
                  {items.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                      Không có thông tin sản phẩm.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {items.map((item, idx) => (
                        <div key={`${item.id_sp}-${idx}`} style={{
                          display: 'grid', gridTemplateColumns: '90px 1fr auto',
                          gap: 14, background: 'var(--bg)', borderRadius: 12,
                          padding: '14px 16px', border: '1px solid var(--border)',
                          alignItems: 'center'
                        }}>
                          {/* Ảnh */}
                          <img
                            src={item.anh_sp ? `/uploads/${item.anh_sp}` : 'https://placehold.co/90x90/f0ddd0/c8956c?text=Bag'}
                            alt={item.ten_sp}
                            onError={e => { e.target.src = 'https://placehold.co/90x90/f0ddd0/c8956c?text=Bag'; }}
                            style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', background: '#fff' }}
                          />
                          {/* Tên + mô tả */}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--secondary)', marginBottom: 4 }}>{item.ten_sp}</div>
                            {item.mota_sp && (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.mota_sp}
                              </div>
                            )}
                            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                              Mã SP: <strong>#{item.id_sp}</strong>
                            </div>
                          </div>
                          {/* Giá + số lượng */}
                          <div style={{ textAlign: 'right', minWidth: 110 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-dark)' }}>{formatPrice(item.gia_sp)}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0' }}>Số lượng: <strong>x{item.soluong}</strong></div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--secondary)', borderTop: '1px dashed var(--border)', paddingTop: 6 }}>
                              = {formatPrice((item.gia_sp || 0) * (item.soluong || 1))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lý do hủy (nếu có) */}
                {o.lydo_huy && (
                  <div style={{ background: '#fff3e0', borderLeft: '4px solid #ff9800', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                    <strong style={{ color: '#e65100' }}>📝 Lý do yêu cầu hủy:</strong>
                    <span style={{ color: '#5d4037', marginLeft: 8 }}>{o.lydo_huy}</span>
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div style={{
                padding: '16px 28px', borderTop: '1px solid var(--border)',
                background: 'var(--bg)', borderRadius: '0 0 20px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12, flexShrink: 0
              }}>
                <div style={{ fontSize: 16 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tổng cộng:</span>
                  <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary-dark)', marginLeft: 10 }}>
                    {formatPrice(o.tongtien)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Cập nhật trạng thái:</span>
                  <select
                    className="form-control"
                    style={{ padding: '6px 10px', fontSize: 13, minWidth: 150 }}
                    value={o.trangthai || 'Đã đặt'}
                    onChange={async e => {
                      await handleUpdateStatus(o.id_donhang, e.target.value);
                      setViewOrder({ ...o, trangthai: e.target.value });
                    }}
                    disabled={o.trangthai === 'Đã hủy' || o.trangthai === 'Chờ duyệt hủy'}
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-outline" onClick={() => setViewOrder(null)}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
