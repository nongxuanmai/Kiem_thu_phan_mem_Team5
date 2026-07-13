import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { donhangAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

// Màu badge theo trạng thái
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
      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700
    }}>
      {s.icon} {status}
    </span>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal hủy đơn
  const [cancelModal, setCancelModal] = useState(null); // order object
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

  // Guard sau tất cả hooks
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
            background: 'var(--surface)', borderRadius: 12,
            padding: '14px 22px', boxShadow: '0 8px 32px rgba(0,0,0,.18)',
            fontWeight: 600, fontSize: 14, maxWidth: 380,
            animation: 'fadeIn .3s ease'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {orders.map(order => (
              <div key={order.id_donhang} className="card" style={{ padding: 28 }}>
                {/* Header đơn hàng */}
                <div className="flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Đơn #{order.id_donhang}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 12 }}>
                      {order.thoigiandat ? new Date(order.thoigiandat).toLocaleDateString('vi-VN') : '---'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <StatusBadge status={order.trangthai || 'Đã đặt'} />
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 17 }}>
                      {formatPrice(order.tongtien)}
                    </span>
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id_sp} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'var(--bg)', borderRadius: 8, padding: '8px 12px'
                    }}>
                      <span style={{ fontSize: 13 }}>{item.ten_sp}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>x{item.soluong}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }}>
                      +{order.items.length - 3} khác
                    </span>
                  )}
                </div>

                {/* Địa chỉ & PT thanh toán */}
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                  📍 {order.diachi} · 💳 {order.phuongthuc}
                </div>

                {/* Lý do hủy (nếu có) */}
                {order.lydo_huy && (
                  <div style={{
                    background: '#fff3e0', borderLeft: '3px solid #ff9800',
                    borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13
                  }}>
                    <span style={{ fontWeight: 600, color: '#e65100' }}>📝 Lý do yêu cầu hủy: </span>
                    <span style={{ color: '#5d4037' }}>{order.lydo_huy}</span>
                  </div>
                )}

                {/* Nút hủy đơn */}
                {canCancel(order.trangthai || 'Đã đặt') && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      id={`btn-cancel-order-${order.id_donhang}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => openCancelModal(order)}
                    >
                      🚫 Yêu cầu hủy đơn
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal yêu cầu hủy đơn */}
      {cancelModal && (
        <div
          className="modal-overlay"
          id="modal-cancel-order"
          onClick={() => setCancelModal(null)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 480 }}
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
                {/* Tóm tắt đơn hàng */}
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
                    Lý do hủy đơn <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <textarea
                    id="lydo-huy-input"
                    className="form-control"
                    rows={4}
                    placeholder="Nhập lý do bạn muốn hủy đơn hàng này (ví dụ: Đặt nhầm sản phẩm, muốn đổi địa chỉ...)"
                    value={lydo}
                    onChange={e => setLydo(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
                    ⚠️ Yêu cầu hủy sẽ được gửi đến admin để xét duyệt. Kết quả sẽ được cập nhật trong đơn hàng của bạn.
                  </p>
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
