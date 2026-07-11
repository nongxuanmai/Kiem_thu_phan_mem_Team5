# 🛍️ FashionBag - Website Bán Túi Xách Thời Trang

## 📁 Cấu Trúc Dự Án

```
Kiem_thu_phan_mem_Team5/
├── backend/                    # FastAPI Backend (Python)
│   ├── main.py                 # Entry point, khởi tạo app & đăng ký routers
│   ├── database.py             # Kết nối SQLite3
│   ├── auth.py                 # JWT Authentication (bcrypt + jose)
│   ├── schemas.py              # Pydantic schemas (models)
│   ├── init_db.sql             # SQL khởi tạo database + dữ liệu mẫu
│   ├── requirements.txt        # Thư viện Python
│   ├── fashionbag.db           # SQLite database (tự tạo khi chạy)
│   ├── uploads/                # Ảnh sản phẩm upload
│   └── routers/
│       ├── __init__.py         # Package export tất cả routers
│       ├── auth_router.py      # API đăng ký/đăng nhập/quản lý user
│       ├── sanpham_router.py   # API sản phẩm CRUD + upload ảnh
│       ├── danhmuc_router.py   # API danh mục CRUD
│       └── donhang_router.py   # API đơn hàng
│
├── frontend/                   # React.js Frontend (Vite)
│   ├── public/
│   │   └── bag-icon.svg        # Favicon
│   ├── src/
│   │   ├── main.jsx            # Entry point React
│   │   ├── App.jsx             # Router chính (React Router v6)
│   │   ├── index.css           # Design system CSS
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx # Quản lý đăng nhập toàn cục (JWT)
│   │   │   └── CartContext.jsx # Quản lý giỏ hàng (state)
│   │   ├── services/
│   │   │   └── api.js          # Axios API client (auto JWT header)
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Thanh điều hướng + giỏ hàng
│   │   │   ├── Footer.jsx      # Chân trang
│   │   │   ├── CartDrawer.jsx  # Giỏ hàng trượt bên phải
│   │   │   └── ProductCard.jsx # Card sản phẩm (grid)
│   │   └── pages/
│   │       ├── HomePage.jsx         # Trang chủ (hero + featured)
│   │       ├── ProductsPage.jsx     # Danh sách + lọc sản phẩm
│   │       ├── ProductDetailPage.jsx # Chi tiết sản phẩm
│   │       ├── LoginPage.jsx        # Đăng nhập
│   │       ├── RegisterPage.jsx     # Đăng ký
│   │       ├── CheckoutPage.jsx     # Thanh toán (yêu cầu đăng nhập)
│   │       ├── OrdersPage.jsx       # Đơn hàng của tôi
│   │       ├── ProfilePage.jsx      # Hồ sơ cá nhân
│   │       └── AdminPage.jsx        # Trang quản trị (yêu cầu admin)
│   ├── index.html
│   ├── vite.config.js          # Vite config (proxy /api → :8000)
│   └── package.json
│
├── start_backend.bat           # ✅ Script khởi động backend (Windows)
├── start_frontend.bat          # ✅ Script khởi động frontend (Windows)
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Yêu Cầu Hệ Thống
- **Python** 3.9+ → [python.org](https://python.org)
- **Node.js** 18+ → [nodejs.org](https://nodejs.org)

---

### ▶️ Cách 1: Chạy bằng file .bat (Khuyên dùng - Windows)

**Bước 1:** Nhấp đôi vào `start_backend.bat`  
→ Script tự động cài requirements và khởi động server

**Bước 2:** Mở cửa sổ CMD mới, nhấp đôi vào `start_frontend.bat`  
→ Script tự động cài npm packages và khởi động dev server

---

### ▶️ Cách 2: Chạy thủ công bằng lệnh

#### Terminal 1 - Backend:
```bash
cd "d:\web bán túi\Kiem_thu_phan_mem_Team5\backend"
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 - Frontend:
```bash
cd "d:\web bán túi\Kiem_thu_phan_mem_Team5\frontend"
npm install
npm run dev
```

---

### 🌐 Địa Chỉ Truy Cập

| Service | URL |
|---------|-----|
| **Website** | http://localhost:5173 |
| **API Server** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/api/docs |
| **ReDoc** | http://localhost:8000/api/redoc |

---

## 🔑 Tài Khoản Mặc Định

| Tài Khoản | Mật Khẩu | Quyền |
|-----------|----------|-------|
| `admin`   | `Admin@123` | Admin (quản trị) |

> **Ghi chú:** Tài khoản admin được tạo sẵn trong `init_db.sql`. Có thể đăng ký thêm tài khoản user thường qua trang `/register`.

---

## 🌐 REST API Endpoints

### 🔐 Auth (`/api/auth/`)
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản | Không |
| POST | `/api/auth/login` | Đăng nhập → JWT | Không |
| GET | `/api/auth/me` | Thông tin cá nhân | User |
| PUT | `/api/auth/me` | Cập nhật thông tin | User |
| GET | `/api/auth/users` | Danh sách users | Admin |
| DELETE | `/api/auth/users/{id}` | Xóa user | Admin |

### 🛍️ Sản Phẩm (`/api/sanpham/`)
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| GET | `/api/sanpham` | Danh sách (filter: id_dm, search) | Không |
| GET | `/api/sanpham/{id}` | Chi tiết sản phẩm | Không |
| POST | `/api/sanpham` | Thêm sản phẩm mới | Admin |
| PUT | `/api/sanpham/{id}` | Cập nhật sản phẩm | Admin |
| DELETE | `/api/sanpham/{id}` | Xóa sản phẩm | Admin |
| POST | `/api/sanpham/{id}/upload-image` | Upload ảnh | Admin |

### 📂 Danh Mục (`/api/danhmuc/`)
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| GET | `/api/danhmuc` | Danh sách danh mục | Không |
| POST | `/api/danhmuc` | Tạo danh mục | Admin |
| PUT | `/api/danhmuc/{id}` | Sửa danh mục | Admin |
| DELETE | `/api/danhmuc/{id}` | Xóa danh mục | Admin |

### 📦 Đơn Hàng (`/api/donhang/`)
| Method | URL | Mô tả | Auth |
|--------|-----|-------|------|
| POST | `/api/donhang` | Tạo đơn hàng | User |
| GET | `/api/donhang/my-orders` | Đơn hàng của tôi | User |
| GET | `/api/donhang/{id}` | Chi tiết đơn hàng | User/Admin |
| GET | `/api/donhang` | Tất cả đơn hàng | Admin |
| DELETE | `/api/donhang/{id}` | Xóa đơn hàng | Admin |

---

## 🗄️ Database Schema (SQLite3)

| Bảng | Mô tả |
|------|-------|
| `NguoiDung` | Tài khoản người dùng (id, taikhoan, matkhau, hoten, sdt, email, quyen) |
| `DanhMuc` | Danh mục túi (id_dm, tendanhmuc) |
| `SanPham` | Sản phẩm (id_sp, ten_sp, gia_sp, soluong_sp, anh_sp, mausac_sp, chatlieu_sp, kichthuoc_sp, id_dm) |
| `DonHang` | Đơn đặt hàng (id_donhang, taikhoan, hoten, diachi, phuongthuc, tongtien) |
| `GioHang` | Chi tiết đơn hàng (id_giohang, id_sp, id_donhang, soluong) |

---

## ✨ Tính Năng

- 🔐 Xác thực JWT (python-jose + bcrypt)
- 🛒 Giỏ hàng real-time (React Context API)
- 🔍 Tìm kiếm & lọc theo danh mục
- 📦 Quản lý đơn hàng đầy đủ
- ⚙️ Admin dashboard (CRUD sản phẩm, danh mục, đơn hàng, user)
- 🖼️ Upload ảnh sản phẩm
- 📱 Responsive mobile-friendly
- 🎨 Giao diện cao cấp với glassmorphism & animations
