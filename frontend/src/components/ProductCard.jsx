import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const IMG_BASE = '/uploads/';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card fade-in">
      <div className="product-img-wrap">
        <img
          src={product.anh_sp ? `${IMG_BASE}${product.anh_sp}` : `https://placehold.co/320x240/f0ddd0/c8956c?text=${encodeURIComponent(product.ten_sp)}`}
          alt={product.ten_sp}
          onError={e => { e.target.src = `https://placehold.co/320x240/f0ddd0/c8956c?text=FashionBag`; }}
        />
        <div className="product-overlay">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to={`/products/${product.id_sp}`} className="btn btn-outline" style={{ color: '#fff', borderColor: '#fff' }}>
              Xem chi tiết
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => addToCart(product)}
              disabled={product.soluong_sp === 0}
            >
              {product.soluong_sp === 0 ? 'Hết hàng' : '+ Giỏ hàng'}
            </button>
          </div>
        </div>
        {product.soluong_sp === 0 && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span className="badge badge-danger">Hết hàng</span>
          </div>
        )}
      </div>
      <div className="product-body">
        {product.tendanhmuc && <div className="product-category">{product.tendanhmuc}</div>}
        <div className="product-name">{product.ten_sp}</div>
        <div className="product-price">{formatPrice(product.gia_sp)}</div>
        <div className="product-meta">
          {product.mausac_sp && <span className="product-tag">🎨 {product.mausac_sp}</span>}
          {product.chatlieu_sp && <span className="product-tag">✂️ {product.chatlieu_sp}</span>}
          {product.kichthuoc_sp && <span className="product-tag">📐 {product.kichthuoc_sp}</span>}
        </div>
      </div>
    </div>
  );
}
