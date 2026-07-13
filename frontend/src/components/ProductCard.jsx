import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const IMG_BASE = '/uploads/';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
}

// Hàm lấy thông tin ưu đãi ngẫu nhiên nhưng cố định theo id_sp
function getPromoInfo(id) {
  const mod = id % 5;
  switch (mod) {
    case 0: return { label: '-30%', type: 'badge-discount', rate: 0.7 };
    case 1: return { label: '-20%', type: 'badge-discount', rate: 0.8 };
    case 2: return { label: 'Giảm 50K Ship', type: 'badge-ship', rate: 1 };
    case 3: return { label: 'Miễn Phí Ship', type: 'badge-freeship', rate: 1 };
    case 4: default: return { label: '-15%', type: 'badge-discount', rate: 0.85 };
  }
}

// Hàm tính số sao và điểm đánh giá cố định theo id_sp
function getRatingInfo(id) {
  const ratings = [4.8, 4.9, 5.0, 4.7, 4.9, 5.0, 4.8];
  const counts = [32, 48, 65, 29, 84, 52, 41];
  const score = ratings[id % ratings.length];
  const count = counts[id % counts.length];
  const fullStars = Math.floor(score);
  const starsStr = '★'.repeat(fullStars) + (score > fullStars ? '★' : '☆');
  return { score, count, starsStr };
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('fav_products') || '[]');
      setIsFav(favs.includes(product.id_sp));
    } catch (e) {
      setIsFav(false);
    }
  }, [product.id_sp]);

  const toggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('fav_products') || '[]');
      let updated;
      if (favs.includes(product.id_sp)) {
        updated = favs.filter(id => id !== product.id_sp);
        setIsFav(false);
      } else {
        updated = [...favs, product.id_sp];
        setIsFav(true);
      }
      localStorage.setItem('fav_products', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const promo = getPromoInfo(product.id_sp || 1);
  const rating = getRatingInfo(product.id_sp || 1);
  const originalPrice = product.gia_sp || 0;
  const finalPrice = promo.rate < 1 ? Math.round(originalPrice * promo.rate) : originalPrice;
  const soldCount = ((product.id_sp * 37) % 220) + 15;

  return (
    <div className="product-card fade-in">
      <div className="product-img-wrap">
        <img
          src={product.anh_sp ? `${IMG_BASE}${product.anh_sp}` : `https://placehold.co/320x240/f0ddd0/c8956c?text=${encodeURIComponent(product.ten_sp)}`}
          alt={product.ten_sp}
          onError={e => { e.target.src = `https://placehold.co/320x240/f0ddd0/c8956c?text=FashionBag`; }}
        />

        {/* Wishlist Heart Button */}
        <button
          className={`fav-btn ${isFav ? 'active' : ''}`}
          onClick={toggleFav}
          title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          {isFav ? '❤️' : '🤍'}
        </button>

        {/* Promo / Stock Badges */}
        <div className="product-badges">
          {product.soluong_sp === 0 ? (
            <span className="badge badge-danger">Hết hàng</span>
          ) : (
            <span className={`promo-badge ${promo.type}`}>{promo.label}</span>
          )}
        </div>

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
      </div>

      <div className="product-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          {product.tendanhmuc && <div className="product-category">{product.tendanhmuc}</div>}
          <div className="product-sold">🔥 Đã bán {soldCount}</div>
        </div>

        <div className="product-name">{product.ten_sp}</div>

        {/* Rating stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 8 }}>
          <span style={{ color: '#ffb400', letterSpacing: 1 }}>{rating.starsStr}</span>
          <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{rating.score}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({rating.count})</span>
        </div>

        <div className="product-price-row">
          <span className="product-price">{formatPrice(finalPrice)}</span>
          {promo.rate < 1 && (
            <span className="product-original-price">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="product-meta">
          {product.mausac_sp && <span className="product-tag">🎨 {product.mausac_sp}</span>}
          {product.chatlieu_sp && <span className="product-tag">✂️ {product.chatlieu_sp}</span>}
          {product.kichthuoc_sp && <span className="product-tag">📐 {product.kichthuoc_sp}</span>}
        </div>
      </div>
    </div>
  );
}
