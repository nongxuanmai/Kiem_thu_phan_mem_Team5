import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { sanphamAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const IMG_BASE = '/uploads/';

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
}

// Mẫu đánh giá khởi tạo sẵn cho từng sản phẩm
const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'Nguyễn Thanh Hà',
    rating: 5,
    date: '10/07/2026',
    comment: 'Túi giao nhanh cực kỳ, đóng gói cẩn thận trong hộp sang trọng. Chất liệu đúng như mô tả, may chắc chắn!',
    verified: true,
  },
  {
    id: 2,
    name: 'Trần Minh Anh',
    rating: 5,
    date: '02/07/2026',
    comment: 'Màu sắc bên ngoài siêu xinh luôn nha mọi người, form cứng cáp đựng được nhiều đồ lắm. Rất đáng tiền!',
    verified: true,
  },
  {
    id: 3,
    name: 'Lê Hoàng Nam',
    rating: 4,
    date: '25/06/2026',
    comment: 'Mua tặng bạn gái thích mê luôn. Da mịn, dây đeo chắc chắn, sẽ tiếp tục ủng hộ shop lần sau.',
    verified: true,
  }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Đánh giá
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    sanphamAPI.getById(id)
      .then(r => setProduct(r.data))
      .finally(() => setLoading(false));

    // Lấy reviews từ localStorage
    try {
      const saved = localStorage.getItem(`reviews_sp_${id}`);
      if (saved) {
        setReviews(JSON.parse(saved));
      } else {
        setReviews(INITIAL_REVIEWS);
      }
    } catch (e) {
      setReviews(INITIAL_REVIEWS);
    }
  }, [id]);

  useEffect(() => {
    if (user?.hoten) {
      setNewName(user.hoten);
    }
  }, [user]);

  const handleAdd = async () => {
    setAddError('');
    setAddLoading(true);
    try {
      // Gọi API backend xác nhận tồn kho – bước này sẽ lỗi khi CSDL mất kết nối
      await sanphamAPI.addToCartValidate(product.id_sp, qty);
      // Nếu thành công mới thêm vào giỏ localStorage
      addToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
      setAddError(msg);
      setTimeout(() => setAddError(''), 5000);
    } finally {
      setAddLoading(false);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setReviewError('Vui lòng nhập tên của bạn!');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    const item = {
      id: Date.now(),
      name: newName.trim(),
      rating: newRating,
      date: new Date().toLocaleDateString('vi-VN'),
      comment: newComment.trim(),
      verified: true,
    };

    const updated = [item, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`reviews_sp_${id}`, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setNewComment('');
    setReviewError('');
    setReviewSuccess('Cảm ơn bạn đã đóng góp đánh giá sản phẩm!');
    setTimeout(() => setReviewSuccess(''), 4000);
  };

  if (loading) return <div className="page-wrapper"><div className="spinner" /></div>;
  if (!product) return <div className="page-wrapper"><div className="container"><p>Không tìm thấy sản phẩm.</p></div></div>;

  // Tính điểm đánh giá trung bình
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div style={{ marginBottom: 24 }}>
          <Link to="/products" style={{ color: 'var(--text-muted)', fontSize: 14 }}>← Quay lại danh sách sản phẩm</Link>
        </div>

        {/* Thông tin chính sản phẩm */}
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
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, marginBottom: 10 }}>{product.ten_sp}</h1>

            {/* Rating summary dưới tên */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ color: '#ffb400', fontSize: 18 }}>
                {'★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating))}
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--secondary)' }}>{avgRating} / 5</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>({reviews.length} đánh giá chất lượng)</span>
            </div>

            <div className="product-detail-price" style={{ marginBottom: 18 }}>{formatPrice(product.gia_sp)}</div>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 24, fontSize: 15 }}>{product.mota_sp}</p>

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
              <div className="qty-selector" style={{ marginTop: 20 }}>
                <span style={{ fontWeight: 600 }}>Số lượng:</span>
                <button id="GiamSoLuong" className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <input
                  id="SoLuong"
                  className="qty-input"
                  type="number" min={1} max={product.soluong_sp}
                  value={qty}
                  onChange={e => setQty(Math.min(product.soluong_sp, Math.max(1, Number(e.target.value))))}
                />
                <button id="TangSoLuong" className="qty-btn" onClick={() => setQty(q => Math.min(product.soluong_sp, q + 1))}>+</button>
              </div>
            )}

            {/* Thông báo lỗi CSDL */}
            {addError && (
              <div
                id="ThemVaoGioHangError"
                role="alert"
                style={{
                  marginTop: 16,
                  background: '#ffeaea',
                  color: '#c62828',
                  border: '1.5px solid #f44336',
                  borderRadius: 10,
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>⚠️</span>
                {addError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <button
                id="ThemVaoGioHang"
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={product.soluong_sp === 0 || addLoading}
                style={{ flex: 1, justifyContent: 'center', padding: '14px 20px', opacity: addLoading ? 0.7 : 1 }}
              >
                {addLoading ? '⏳ Đang xử lý...' : added ? '✓ Đã thêm vào giỏ!' : '🛗️ Thêm vào giỏ hàng'}
              </button>
              <button
                id="MuaNgay"
                className="btn btn-dark"
                onClick={handleBuyNow}
                disabled={product.soluong_sp === 0}
                style={{ flex: 1, justifyContent: 'center', padding: '14px 20px' }}
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>

        {/* ── ĐÁNH GIÁ CHẤT LƯỢNG SẢN PHẨM ── */}
        <div style={{ marginTop: 64, borderTop: '1px solid var(--border)', paddingTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, marginBottom: 6 }}>
                Đánh Giá Chất Lượng Sản Phẩm
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Nhận xét thực tế từ những khách hàng đã mua và trải nghiệm sản phẩm này
              </p>
            </div>

            {/* Thẻ tổng quan điểm số */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--primary-light)', padding: '14px 24px',
              borderRadius: 16, border: '1px solid var(--border)'
            }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--primary-dark)', fontFamily: 'Playfair Display,serif' }}>
                {avgRating}
              </div>
              <div>
                <div style={{ color: '#ffb400', fontSize: 16, letterSpacing: 2 }}>
                  {'★'.repeat(Math.round(avgRating))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Dựa trên {reviews.length} đánh giá
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 40, alignItems: 'start' }}>
            {/* Form Gửi Đánh Giá Mới */}
            <div className="card" style={{ padding: 28, background: '#fff', borderRadius: 16, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 18, marginBottom: 16, fontFamily: 'Playfair Display,serif' }}>
                Viết Đánh Giá Của Bạn
              </h3>

              {reviewSuccess && (
                <div style={{ background: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                  ✓ {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div style={{ background: '#ffeaea', color: '#c62828', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
                  ⚠️ {reviewError}
                </div>
              )}

              <form onSubmit={handleAddReview} noValidate>
                {/* Chọn số sao */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Chất lượng sản phẩm:</label>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 24, color: star <= newRating ? '#ffb400' : '#ddd',
                          transition: 'transform 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: 14, fontWeight: 600, alignSelf: 'center', marginLeft: 8, color: 'var(--text-muted)' }}>
                      ({newRating}/5 sao)
                    </span>
                  </div>
                </div>

                {/* Tên người đánh giá */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Họ và tên *</label>
                  <input
                    className="form-control"
                    placeholder="Nhập tên của bạn..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>

                {/* Nội dung đánh giá */}
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontSize: 13, fontWeight: 600 }}>Nội dung nhận xét *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm sử dụng túi xách, chất liệu, độ hoàn thiện..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                  Gửi Đánh Giá
                </button>
              </form>
            </div>

            {/* Danh sách Đánh giá */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(rev => (
                <div
                  key={rev.id}
                  style={{
                    background: '#fff', padding: '20px 24px', borderRadius: 16,
                    border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'var(--primary-light)', color: 'var(--primary-dark)',
                        fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {rev.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--secondary)' }}>
                          {rev.name}
                        </div>
                        {rev.verified && (
                          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                            ✓ Đã mua hàng tại FashionBag
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rev.date}</span>
                  </div>

                  <div style={{ color: '#ffb400', fontSize: 14, marginBottom: 8, letterSpacing: 1 }}>
                    {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                  </div>

                  <p style={{ color: 'var(--text)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
