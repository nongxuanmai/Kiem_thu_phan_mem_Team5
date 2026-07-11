import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sanphamAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const IMG_BASE = '/uploads/';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    sanphamAPI.getById(id)
      .then(r => setProduct(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="page-wrapper"><div className="spinner" /></div>;
  if (!product) return <div className="page-wrapper"><div className="container"><p>Không tìm thấy sản phẩm.</p></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div style={{ marginBottom: 24 }}>
          <Link to="/products" style={{ color: 'var(--text-muted)', fontSize: 14 }}>← Quay lại</Link>
        </div>

        <div className="product-detail-grid">
          <div className="product-detail-img">
            <img
              src={product.anh_sp ? `${IMG_BASE}${product.anh_sp}` : `https://placehold.co/600x450/f0ddd0/c8956c?text=${encodeURIComponent(product.ten_sp)}`}
              alt={product.ten_sp}
              onError={e => { e.target.src = 'https://placehold.co/600x450/f0ddd0/c8956c?text=FashionBag'; }}
            />
          </div>

          <div>
            {product.tendanhmuc && <div className="product-category" style={{ marginBottom: 12 }}>{product.tendanhmuc}</div>}
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, marginBottom: 8 }}>{product.ten_sp}</h1>
            <div className="product-detail-price">{formatPrice(product.gia_sp)}</div>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 24 }}>{product.mota_sp}</p>

            <div className="product-detail-attrs">
              {product.mausac_sp && (
                <div className="attr-item">
                  <div className="attr-label">Màu Sắc</div>
                  <div className="attr-value">🎨 {product.mausac_sp}</div>
                </div>
              )}
              {product.chatlieu_sp && (
                <div className="attr-item">
                  <div className="attr-label">Chất Liệu</div>
                  <div className="attr-value">✂️ {product.chatlieu_sp}</div>
                </div>
              )}
              {product.kichthuoc_sp && (
                <div className="attr-item">
                  <div className="attr-label">Kích Thước</div>
                  <div className="attr-value">📐 {product.kichthuoc_sp}</div>
                </div>
              )}
              <div className="attr-item">
                <div className="attr-label">Tồn Kho</div>
                <div className="attr-value" style={{ color: product.soluong_sp > 0 ? 'var(--success)' : 'var(--error)' }}>
                  {product.soluong_sp > 0 ? `✓ Còn ${product.soluong_sp} sản phẩm` : '✗ Hết hàng'}
                </div>
              </div>
            </div>

            {product.soluong_sp > 0 && (
              <div className="qty-selector">
                <span style={{ fontWeight: 600 }}>Số lượng:</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <input
                  className="qty-input"
                  type="number" min={1} max={product.soluong_sp}
                  value={qty}
                  onChange={e => setQty(Math.min(product.soluong_sp, Math.max(1, Number(e.target.value))))}
                />
                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.soluong_sp, q + 1))}>+</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={product.soluong_sp === 0}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {added ? '✓ Đã thêm!' : '🛍️ Thêm vào giỏ'}
              </button>
              <Link to="/checkout" className="btn btn-dark" style={{ flex: 1, justifyContent: 'center' }}>
                Mua Ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
