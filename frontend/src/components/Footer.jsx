import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">FashionBag</div>
            <p className="footer-desc">
              Chuyên cung cấp túi xách thời trang cao cấp với chất lượng vượt trội.
              Mang phong cách và sự tự tin đến mọi khách hàng.
            </p>
          </div>
          <div>
            <div className="footer-heading">Sản Phẩm</div>
            <div className="footer-links">
              <Link to="/products?id_dm=1">Túi Xách Tay</Link>
              <Link to="/products?id_dm=2">Túi Đeo Chéo</Link>
              <Link to="/products?id_dm=3">Túi Đeo Vai</Link>
              <Link to="/products?id_dm=4">Balo</Link>
            </div>
          </div>
          <div>
            <div className="footer-heading">Tài Khoản</div>
            <div className="footer-links">
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
              <Link to="/orders">Đơn hàng</Link>
              <Link to="/profile">Hồ sơ</Link>
            </div>
          </div>
          <div>
            <div className="footer-heading">Liên Hệ</div>
            <div className="footer-links">
              <span>📍 Hà Nội, Việt Nam</span>
              <span>📞 0901 234 567</span>
              <span>✉️ support@fashionbag.vn</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2024 FashionBag. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  );
}
