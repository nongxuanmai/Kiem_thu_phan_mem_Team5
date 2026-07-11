import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { donhangAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ useEffect phải đặt trước conditional return (Rules of Hooks)
  useEffect(() => {
    if (!user) return;
    donhangAPI.getMyOrders()
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Guard sau tất cả hooks
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="page-wrapper">
      <div className="container section">
        <h1 style={{ fontFamily: 'Playfair Display,serif', marginBottom: 8 }}>Đơn Hàng Của Tôi</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 36 }}>Theo dõi lịch sử mua hàng của bạn</p>

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
                <div className="flex-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Đơn #{order.id_donhang}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 12 }}>
                      {order.thoigiandat ? new Date(order.thoigiandat).toLocaleDateString('vi-VN') : '---'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="badge badge-success">Đã đặt</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 17 }}>{formatPrice(order.tongtien)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id_sp} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 8, padding: '8px 12px' }}>
                      <span style={{ fontSize: 13 }}>{item.ten_sp}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>x{item.soluong}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>+{order.items.length - 3} khác</span>}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  📍 {order.diachi} · 💳 {order.phuongthuc}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
