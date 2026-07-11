-- 1. Bảng NguoiDung
CREATE TABLE IF NOT EXISTS NguoiDung (
    id_nguoidung INTEGER PRIMARY KEY AUTOINCREMENT,
    taikhoan TEXT UNIQUE NOT NULL,
    matkhau TEXT NOT NULL,
    hoten TEXT,
    gioitinh TEXT,
    sdt TEXT,
    email TEXT,
    namsinh INTEGER,
    quyen TEXT
);

-- 2. Bảng DanhMuc 
CREATE TABLE IF NOT EXISTS DanhMuc (
    id_dm INTEGER PRIMARY KEY AUTOINCREMENT,
    tendanhmuc TEXT NOT NULL UNIQUE
);

-- 3. Bảng SanPham (Thêm chất liệu và kích thước cho túi xách)
CREATE TABLE IF NOT EXISTS SanPham (
    id_sp INTEGER PRIMARY KEY AUTOINCREMENT,
    ten_sp TEXT NOT NULL,
    gia_sp REAL,
    soluong_sp INTEGER,
    anh_sp TEXT,
    mausac_sp TEXT,
    chatlieu_sp TEXT,
    kichthuoc_sp TEXT,
    mota_sp TEXT,
    id_dm INTEGER,
    FOREIGN KEY (id_dm) REFERENCES DanhMuc(id_dm) ON DELETE SET NULL
);

-- 4. Bảng DonHang
CREATE TABLE IF NOT EXISTS DonHang (
    id_donhang INTEGER PRIMARY KEY AUTOINCREMENT,
    taikhoan TEXT,
    hoten TEXT,
    sdt TEXT,
    email TEXT,
    diachi TEXT,
    thoigiandat DATETIME DEFAULT CURRENT_TIMESTAMP,
    phuongthuc TEXT,
    ghichu TEXT,
    tongtien REAL
);

-- 5. Bảng GioHang (Đóng vai trò như ChiTietDonHang)
CREATE TABLE IF NOT EXISTS GioHang (
    id_giohang INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sp INTEGER,
    id_donhang INTEGER,
    soluong INTEGER,
    FOREIGN KEY (id_sp) REFERENCES SanPham(id_sp),
    FOREIGN KEY (id_donhang) REFERENCES DonHang(id_donhang) ON DELETE CASCADE
);

-- Dữ liệu mẫu DanhMuc
INSERT OR IGNORE INTO DanhMuc (tendanhmuc) VALUES 
    ('Túi Xách Tay'),
    ('Túi Đeo Chéo'),
    ('Túi Đeo Vai'),
    ('Balo'),
    ('Ví'),
    ('Túi Clutch');

-- Dữ liệu mẫu NguoiDung (admin)
INSERT OR IGNORE INTO NguoiDung (taikhoan, matkhau, hoten, gioitinh, sdt, email, namsinh, quyen)
VALUES ('admin', '$2b$12$jATq3QBzNf7tl6v5AP5/iuPaRsf7hwWZBGfqScBJurvIJXAB2DX8K', 'Quản Trị Viên', 'Nam', '0901234567', 'admin@fashionbag.vn', 1990, 'admin');

-- Dữ liệu mẫu SanPham
INSERT OR IGNORE INTO SanPham (ten_sp, gia_sp, soluong_sp, anh_sp, mausac_sp, chatlieu_sp, kichthuoc_sp, mota_sp, id_dm)
VALUES 
    ('Túi Xách Tay Nữ Luxury', 1250000, 50, 'bag1.jpg', 'Đen', 'Da bò thật', '30x20x12 cm', 'Túi xách tay thiết kế sang trọng, phù hợp đi làm và dự tiệc. Chất liệu da bò cao cấp, bền đẹp theo thời gian.', 1),
    ('Túi Đeo Chéo Mini', 450000, 100, 'bag2.jpg', 'Nâu', 'Da PU', '18x12x6 cm', 'Túi đeo chéo nhỏ gọn, tiện lợi cho việc đi chơi, dạo phố. Thiết kế trẻ trung, năng động.', 2),
    ('Túi Đeo Vai Boho', 680000, 75, 'bag3.jpg', 'Be', 'Canvas', '35x28x10 cm', 'Túi đeo vai phong cách Boho độc đáo. Chất liệu canvas bền chắc, họa tiết thổ cẩm ấn tượng.', 3),
    ('Balo Du Lịch Thời Trang', 890000, 60, 'bag4.jpg', 'Xanh Navy', 'Vải Oxford', '45x30x20 cm', 'Balo du lịch thiết kế thông minh nhiều ngăn, chống nước tốt. Phù hợp cho các chuyến đi dài ngày.', 4),
    ('Ví Dài Nữ Cao Cấp', 320000, 120, 'bag5.jpg', 'Hồng', 'Da PU', '19x9x2 cm', 'Ví dài thiết kế tinh tế nhiều ngăn đựng thẻ và tiền. Chất liệu da PU mềm mại, sang trọng.', 5),
    ('Túi Clutch Dạ Tiệc', 550000, 40, 'bag6.jpg', 'Vàng', 'Vải nhung', '22x13x3 cm', 'Túi clutch sang trọng dành cho các buổi dạ tiệc. Đính kết hạt pha lê lấp lánh, thu hút ánh nhìn.', 6),
    ('Túi Tote Vải Canvas', 280000, 150, 'bag7.jpg', 'Trắng', 'Canvas', '38x35x12 cm', 'Túi tote vải canvas thân thiện với môi trường. Sức chứa lớn, phù hợp đi làm hoặc đi siêu thị.', 1),
    ('Túi Đeo Chéo Da Thật', 980000, 35, 'bag8.jpg', 'Đen', 'Da bò thật', '24x16x8 cm', 'Túi đeo chéo làm từ da bò thật cao cấp. Đường may tỉ mỉ, khóa kim loại bền đẹp theo năm tháng.', 2);
