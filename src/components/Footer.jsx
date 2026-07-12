import React from 'react';

const Footer = () => {
  return (
    <footer id="footer-container" className="bg-gray-900 text-gray-300 py-10 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">FashionBag</h3>
          <p className="mb-4">Chuyên cung cấp các mẫu túi xách nữ thời trang cao cấp, đa dạng kiểu dáng, đáp ứng mọi nhu cầu của bạn.</p>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Liên Hệ</h4>
          <ul className="space-y-2">
            <li>Địa chỉ: 123 Đường Fashion, Quận 1, TP. Hồ Chí Minh</li>
            <li>Điện thoại: 0123 456 789</li>
            <li>Email: cskh@fashionbag.vn</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Chính Sách</h4>
          <ul className="space-y-2">
            <li><a href="#" data-testid="footer-link-shipping" className="hover:text-rose-500 transition-colors">Chính sách giao hàng</a></li>
            <li><a href="#" data-testid="footer-link-return" className="hover:text-rose-500 transition-colors">Chính sách đổi trả</a></li>
            <li><a href="#" data-testid="footer-link-privacy" className="hover:text-rose-500 transition-colors">Bảo mật thông tin</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-6 text-center">
        <p>&copy; {new Date().getFullYear()} FashionBag. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
