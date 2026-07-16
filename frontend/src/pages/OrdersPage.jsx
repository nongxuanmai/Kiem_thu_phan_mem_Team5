import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { donhangAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const IMG_BASE = '/uploads/';

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

// Mẫu đánh giá mặc định nếu chưa có trong localStorage
const DEFAULT_REVIEWS = [
  { rating: 5, comment: 'Sản phẩm tuyệt vời!' },
  { rating: 5, comment: 'Da đẹp, đóng gói cẩn thận' }
];

// Lấy thông tin đánh giá trung bình từ localStorage
function getProductReviewInfo(id_sp) {
  try {
    const saved = localStorage.getItem(`reviews_sp_${id_sp}`);
    const reviews = saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    if (!reviews || reviews.length === 0) return { avg: '5.0', count: 0 };
    const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    return { avg, count: reviews.length };
  } catch (e) {
    return { avg: '5.0', count: 2 };
  }
}

// Màu badge theo trạng thái đơn
function StatusBadge({ status }) {
  const map = {
    'Đã đặt':        { bg: '#e3f2fd', color: '#1565c0', icon: '📋' },
    'Đang xử lý':    { bg: '#fff8e1', color: '#f57f17', icon: '⚙️' },
    'Đang giao':     { bg: '#e8f5e9', color: '#2e7d32', icon: '🚚' },
    'Đã giao':       { bg: '#f3e5f5', color: '#6a1b9a', icon: '✅' },
    'Chờ duyệt hủy': { bg: '#fff3e0', color: '#e65100', icon: '⏳' },
    'Đã hủy':        { bg: '#ffebee', color: '#b71c1c', icon: '❌' },
  };
  const s = map[status] || { bg: '#f5f5f5', color: '#616161', icon: '•' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.color,
      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700
    }}>
      {s.icon} {status}
    </span>
  );
}

// Helper tính giá thực mua của item sau khi áp dụng giảm giá/tổng đơn
function getItemPaidPrice(order, item) {
  if (!item) return 0;
  if (!order.items || order.items.length === 0) return order.tongtien || item.gia_sp || 0;
  if (order.items.length === 1) return (order.tongtien || item.gia_sp) / (item.soluong || 1);
  const totalOriginal = order.items.reduce((sum, i) => sum + (i.gia_sp || 0) * (i.soluong || 1), 0);
  if (totalOriginal <= 0) return (order.tongtien || item.gia_sp) / (item.soluong || 1);
  const ratio = (order.tongtien || totalOriginal) / totalOriginal;
  return Math.round((item.gia_sp || 0) * ratio);
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [selectedModalData, setSelectedModalData] = useState(null); // { item, paidPrice } | null
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null); // full order with all items
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [lydo, setLydo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const loadOrders = useCallback(() => {
    if (!user) return;
    setLoading(true);
    donhangAPI.getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const openCancelModal = (order) => {
    setCancelModal(order);
    setLydo('');
  };

  const handleRequestCancel = async (e) => {
    e.preventDefault();
    if (!lydo.trim()) return;
    setSubmitting(true);
    try {
      await donhangAPI.requestCancel(cancelModal.id_donhang, lydo.trim());
      showToast('✅ Đã gửi yêu cầu hủy đơn. Admin sẽ xét duyệt sớm nhất!');
      setCancelModal(null);
      loadOrders();
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.detail || 'Gửi yêu cầu thất bại.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const canCancel = (status) => status === 'Đã đặt' || status === 'Đang xử lý';

  return (
    <div className="page-wrapper">
      <div className="container section">
        <h1 style={{ fontFamily: 'Playfair Display,serif', marginBottom: 8 }}>Đơn Hàng Của Tôi</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>Theo dõi và quản lý lịch sử mua hàng</p>

        {/* Toast thông báo */}
        {toast && (
          <div style={{
            position: 'fixed', top: 90, right: 24, zIndex: 9999,
            background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
            padding: '14px 22px', boxShadow: 'var(--shadow-lg)',
            fontWeight: 600, fontSize: 14, maxWidth: 380
          }}>
            {toast}
          </div>
        )}

        {loading ? <div className="spinner" /> : orders.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 64 }}>📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>Mua Sắm Ngay</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {orders.map(order => (
              <div key={order.id_donhang} className="card" style={{ padding: 24 }}>
                {/* Header đơn hàng */}
                <div className="flex-between" style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--secondary)' }}>Mã đơn: #{order.id_donhang}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 16 }}>
                      🗓️ Ngày đặt: {formatDateTime(order.thoigiandat)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <StatusBadge status={order.trangthai || 'Đã đặt'} />
                    <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: 18 }}>
                      {formatPrice(order.tongtien)}
                    </span>
                  </div>
                </div>

                {/* Danh sách thông tin chi tiết từng sản phẩm đã đặt */}
                <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {order.items && order.items.length > 0 ? (
                    order.items.map(item => {
                      const reviewInfo = getProductReviewInfo(item.id_sp);
                      const paidPrice = getItemPaidPrice(order, item);
                      const hasDiscount = item.gia_sp > paidPrice;

                      return (
                        <div
                          key={item.id_sp}
                          onClick={() => setSelectedOrderDetail(order)}
                          title="Nhấp để xem chi tiết sản phẩm đã đặt"
                          style={{
                            display: 'flex', gap: 16, background: 'var(--bg)',
                            borderRadius: 14, padding: 16, border: '1px solid var(--border)',
                            alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s ease'
                          }}
                          className="product-row-card"
                        >
                          {/* Hình ảnh sản phẩm */}
                          <img
                            src={item.anh_sp ? `${IMG_BASE}${item.anh_sp}` : 'https://placehold.co/100x100/f0ddd0/c8956c?text=Túi'}
                            alt={item.ten_sp}
                            onError={e => { e.target.src = 'https://placehold.co/100x100/f0ddd0/c8956c?text=Túi'; }}
                            style={{
                              width: 90, height: 90, objectFit: 'cover', borderRadius: 10,
                              border: '1px solid var(--border)', background: '#fff', flexShrink: 0
                            }}
                          />

                          {/* Thông tin tên, mô tả, đánh giá */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--secondary)', marginBottom: 4 }}>
                              {item.ten_sp}
                            </div>
                            <p style={{
                              fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px 0',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              overflow: 'hidden', lineHeight: 1.5
                            }}>
                              {item.mota_sp || 'Mặt hàng túi xách thời trang cao cấp thuộc bộ sưu tập FashionBag.'}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                                <span style={{ color: '#ffb400', fontSize: 14 }}>⭐</span>
                                <strong style={{ color: 'var(--secondary)' }}>{reviewInfo.avg} / 5</strong>
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({reviewInfo.count} đánh giá)</span>
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--primary-dark)', fontWeight: 600 }}>
                                🔍 Click xem chi tiết sản phẩm
                              </span>
                            </div>
                          </div>

                          {/* Số lượng & Đơn giá thực mua */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                              {formatPrice(paidPrice)}
                              {hasDiscount && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6, fontWeight: 400 }}>
                                  {formatPrice(item.gia_sp)}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                              Số lượng: <strong>x{item.soluong}</strong>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)', marginTop: 4 }}>
                              = {formatPrice(paidPrice * item.soluong)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      onClick={async () => {
                        setFetchingDetail(true);
                        try {
                          const res = await donhangAPI.getById(order.id_donhang);
                          setSelectedOrderDetail(res.data);
                        } catch {
                          showToast('❌ Không thể tải chi tiết đơn hàng.');
                        } finally {
                          setFetchingDetail(false);
                        }
                      }}
                      style={{
                        padding: '14px 18px', background: 'var(--bg)', borderRadius: 12,
                        border: '1px dashed var(--border)', cursor: fetchingDetail ? 'wait' : 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        color: 'var(--text-muted)', fontSize: 14, transition: 'background 0.2s'
                      }}
                    >
                      <span>🛍️ Chi tiết sản phẩm trong đơn hàng #{order.id_donhang}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)' }}>
                        {fetchingDetail ? '⏳ Đang tải...' : '🔍 Xem chi tiết'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Địa chỉ & PT thanh toán */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 14, borderTop: '1px dashed var(--border)', flexWrap: 'wrap', gap: 12
                }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    📍 <strong>Giao đến:</strong> {order.diachi} · 💳 <strong>Thanh toán:</strong> {order.phuongthuc}
                  </div>

                  {/* Nút hủy đơn */}
                  {canCancel(order.trangthai || 'Đã đặt') && (
                    <button
                      id={`btn-cancel-order-${order.id_donhang}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => openCancelModal(order)}
                    >
                      🚫 Yêu cầu hủy đơn
                    </button>
                  )}
                </div>

                {/* Lý do hủy (nếu có) */}
                {order.lydo_huy && (
                  <div style={{
                    background: '#fff3e0', borderLeft: '3px solid #ff9800',
                    borderRadius: 8, padding: '10px 14px', marginTop: 14, fontSize: 13
                  }}>
                    <span style={{ fontWeight: 600, color: '#e65100' }}>📝 Lý do yêu cầu hủy: </span>
                    <span style={{ color: '#5d4037' }}>{order.lydo_huy}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Thư Đầy Đủ - Hiển Thị Tất Cả Sản Phẩm Trong Đơn */}
      {selectedOrderDetail && (() => {
        const ord = selectedOrderDetail;
        const items = ord.items || [];
        const totalOriginal = items.reduce((s, i) => s + (i.gia_sp || 0) * (i.soluong || 1), 0);
        return (
          <div className="modal-overlay" onClick={() => setSelectedOrderDetail(null)} style={{ zIndex: 1500 }}>
            <div
              className="modal"
              style={{ maxWidth: 640, borderRadius: 20, padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="modal-header" style={{ padding: '18px 24px', flexShrink: 0 }}>
                <div>
                  <h3 style={{ fontSize: 18, color: 'var(--secondary)', margin: 0 }}>🛍️ Chi Tiết Đơn Hàng #{ord.id_donhang}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    📅 {formatDateTime(ord.thoigiandat)}
                    &nbsp;&middot;&nbsp;📍 {ord.diachi}
                    &nbsp;&middot;&nbsp;💳 {ord.phuongthuc}
                  </div>
                </div>
                <button className="cart-close" onClick={() => setSelectedOrderDetail(null)} style={{ width: 32, height: 32, fontSize: 16 }}>✕</button>
              </div>

              {/* Body - scrollable */}
              <div style={{ overflowY: 'auto', padding: '0 24px 8px', flex: 1 }}>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    📦 Không tìm thấy sản phẩm trong đơn hàng này.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
                    {items.map((item, idx) => {
                      const paidPrice = getItemPaidPrice(ord, item);
                      const hasDiscount = item.gia_sp > paidPrice;
                      const reviewInfo = getProductReviewInfo(item.id_sp);
                      return (
                        <div key={`${item.id_sp}-${idx}`} style={{
                          display: 'grid',
                          gridTemplateColumns: '110px 1fr',
                          gap: 16,
                          background: 'var(--bg)',
                          borderRadius: 14,
                          padding: 16,
                          border: '1px solid var(--border)',
                          alignItems: 'flex-start'
                        }}>
                          {/* Ảnh sản phẩm */}
                          <div style={{ position: 'relative' }}>
                            <img
                              src={item.anh_sp ? `${IMG_BASE}${item.anh_sp}` : 'https://placehold.co/110x110/f0ddd0/c8956c?text=Túi'}
                              alt={item.ten_sp}
                              onError={e => { e.target.src = 'https://placehold.co/110x110/f0ddd0/c8956c?text=Túi'; }}
                              style={{
                                width: 110, height: 110, objectFit: 'cover',
                                borderRadius: 12, border: '1px solid var(--border)',
                                display: 'block', background: '#fff'
                              }}
                            />
                            <div style={{
                              position: 'absolute', bottom: 6, right: 6,
                              background: 'rgba(0,0,0,0.55)', color: '#fff',
                              fontSize: 11, fontWeight: 700, borderRadius: 8,
                              padding: '2px 7px'
                            }}>x{item.soluong}</div>
                          </div>

                          {/* Thông tin sản phẩm */}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--secondary)', marginBottom: 4, lineHeight: 1.3 }}>
                              {item.ten_sp}
                            </div>

                            {/* Mô tả */}
                            {item.mota_sp && (
                              <p style={{
                                fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px 0',
                                lineHeight: 1.5,
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                              }}>{item.mota_sp}</p>
                            )}

                            {/* Đánh giá */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f57f17', marginBottom: 8 }}>
                              <span>⭐ {reviewInfo.avg}/5</span>
                              <span style={{ color: 'var(--text-muted)' }}>({reviewInfo.count} đánh giá)</span>
                            </div>

                            {/* Giá */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-dark)' }}>
                                {formatPrice(paidPrice)}
                              </span>
                              {hasDiscount && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                  {formatPrice(item.gia_sp)}
                                </span>
                              )}
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ cái</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', marginTop: 4 }}>
                              Thành tiền: {formatPrice(paidPrice * (item.soluong || 1))}
                            </div>

                            {/* Link đến trang sản phẩm */}
                            <Link
                              to={`/products/${item.id_sp}`}
                              onClick={() => setSelectedOrderDetail(null)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                marginTop: 10, fontSize: 12, fontWeight: 600,
                                color: 'var(--primary-dark)', textDecoration: 'none',
                                padding: '4px 12px', borderRadius: 20,
                                border: '1.5px solid var(--primary)',
                                transition: 'all 0.18s'
                              }}
                            >
                              🔗 Đến trang sản phẩm
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer - tổng đơn */}
              <div style={{
                padding: '16px 24px', borderTop: '1px solid var(--border)',
                background: 'var(--bg)', borderRadius: '0 0 20px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexShrink: 0, flexWrap: 'wrap', gap: 12
              }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {items.length} sản phẩm &middot; Tổng cộng:
                  <span style={{ fontWeight: 800, color: 'var(--primary-dark)', fontSize: 18, marginLeft: 8 }}>
                    {formatPrice(ord.tongtien)}
                  </span>
                </div>
                <button className="btn btn-outline" onClick={() => setSelectedOrderDetail(null)}>Đóng</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal yêu cầu hủy đơn */}
      {cancelModal && (
        <div
          className="modal-overlay"
          id="modal-cancel-order"
          onClick={() => setCancelModal(null)}
          style={{ zIndex: 2000 }}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 500 }}
          >
            <div className="modal-header">
              <h3>🚫 Yêu Cầu Hủy Đơn #{cancelModal.id_donhang}</h3>
              <button
                onClick={() => setCancelModal(null)}
                style={{ fontSize: 20, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >✕</button>
            </div>
            <form onSubmit={handleRequestCancel}>
              <div className="modal-body">
                <div style={{
                  background: 'var(--bg)', borderRadius: 10, padding: 14,
                  marginBottom: 18, fontSize: 13, color: 'var(--text-muted)'
                }}>
                  <div style={{ marginBottom: 4 }}>
                    <strong style={{ color: 'var(--text)' }}>Tổng tiền:</strong> {formatPrice(cancelModal.tongtien)}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>Sản phẩm:</strong>{' '}
                    {cancelModal.items?.map(i => `${i.ten_sp} x${i.soluong}`).join(', ')}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="lydo-huy-input">
                    Lý do hủy đơn <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <textarea
                    id="lydo-huy-input"
                    className="form-control"
                    rows={4}
                    placeholder="Nhập lý do bạn muốn hủy đơn hàng này..."
                    value={lydo}
                    onChange={e => setLydo(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setCancelModal(null)}
                  disabled={submitting}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  id="btn-submit-cancel"
                  className="btn btn-danger"
                  disabled={submitting || !lydo.trim()}
                >
                  {submitting ? 'Đang gửi...' : '🚫 Gửi yêu cầu hủy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function uppercaseText(str) {
  return str.toUpperCase();
}
