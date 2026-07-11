import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sanphamAPI, danhmucAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const FEATURES = [
  { icon: '🚚', title: 'Miễn Phí Giao Hàng', desc: 'Đơn từ 500.000đ' },
  { icon: '♻️', title: 'Đổi Trả 30 Ngày', desc: 'Không cần lý do' },
  { icon: '🔒', title: 'Thanh Toán An Toàn', desc: 'Bảo mật tuyệt đối' },
  { icon: '💎', title: 'Hàng Chính Hãng', desc: '100% authentic' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([sanphamAPI.getAll(), danhmucAPI.getAll()])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data.slice(0, 8));
        setCategories(cRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 64, width: '100%' }}>
          <div className="hero-content">
            <div className="hero-badge">✨ BST Mới 2024</div>
            <h1 className="hero-title">
              Túi Xách<br />
              <span>Thời Trang</span><br />
              Cao Cấp
            </h1>
            <p className="hero-desc">
              Khám phá bộ sưu tập túi xách độc đáo — từ da bò thật đến canvas thời thượng.
              Mỗi chiếc túi là một tuyên ngôn phong cách.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">Mua Ngay →</Link>
              <Link to="/products" className="btn btn-outline">Xem BST</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item"><div className="stat-num">500+</div><div className="stat-label">Mẫu Túi</div></div>
              <div className="stat-item"><div className="stat-num">10K+</div><div className="stat-label">Khách Hàng</div></div>
              <div className="stat-item"><div className="stat-num">4.9★</div><div className="stat-label">Đánh Giá</div></div>
            </div>
          </div>
          <div className="hero-img">
            <img
              src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=520&h=560&fit=crop&crop=center"
              alt="FashionBag Hero"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'var(--secondary)', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#fff' }}>
                <span style={{ fontSize: 28 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{f.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Danh Mục</div>
            <h2 className="section-title">Khám Phá Theo Loại</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 16 }}>
            {categories.map(cat => (
              <Link
                key={cat.id_dm}
                to={`/products?id_dm=${cat.id_dm}`}
                style={{
                  background: 'var(--primary-light)', borderRadius: 16, padding: '24px 16px',
                  textAlign: 'center', transition: 'var(--transition)', display: 'block',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-light)'}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>👜</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--secondary)' }}>{cat.tendanhmuc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: '#f9f6f2' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Nổi Bật</div>
            <h2 className="section-title">Sản Phẩm Được Yêu Thích</h2>
            <p className="section-subtitle">Những chiếc túi được khách hàng lựa chọn nhiều nhất</p>
          </div>
          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="product-grid">
              {products.map(p => <ProductCard key={p.id_sp} product={p} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/products" className="btn btn-primary">Xem Tất Cả Sản Phẩm →</Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, #3a2a1a 100%)',
        padding: '80px 0', color: '#fff', textAlign: 'center'
      }}>
        <div className="container">
          <div style={{ fontSize: 14, letterSpacing: 4, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 16 }}>
            Ưu Đãi Đặc Biệt
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 42, marginBottom: 20 }}>
            Giảm Đến 30% Cho Thành Viên Mới
          </h2>
          <p style={{ opacity: 0.7, fontSize: 17, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Đăng ký ngay để nhận ưu đãi độc quyền và cập nhật bộ sưu tập mới nhất.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 40px' }}>
            Đăng Ký Ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
