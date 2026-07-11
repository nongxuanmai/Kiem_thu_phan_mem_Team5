from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ───────────────────────────── NguoiDung ──────────────────────────────
class NguoiDungBase(BaseModel):
    taikhoan: str
    hoten: Optional[str] = None
    gioitinh: Optional[str] = None
    sdt: Optional[str] = None
    email: Optional[str] = None
    namsinh: Optional[int] = None
    quyen: Optional[str] = "user"


class NguoiDungCreate(NguoiDungBase):
    matkhau: str


class NguoiDungUpdate(BaseModel):
    hoten: Optional[str] = None
    gioitinh: Optional[str] = None
    sdt: Optional[str] = None
    email: Optional[str] = None
    namsinh: Optional[int] = None


class NguoiDungOut(NguoiDungBase):
    id_nguoidung: int

    class Config:
        from_attributes = True


# ───────────────────────────── Auth ───────────────────────────────────
class LoginRequest(BaseModel):
    taikhoan: str
    matkhau: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    quyen: str
    taikhoan: str
    hoten: Optional[str] = None


# ───────────────────────────── DanhMuc ────────────────────────────────
class DanhMucBase(BaseModel):
    tendanhmuc: str


class DanhMucCreate(DanhMucBase):
    pass


class DanhMucOut(DanhMucBase):
    id_dm: int

    class Config:
        from_attributes = True


# ───────────────────────────── SanPham ────────────────────────────────
class SanPhamBase(BaseModel):
    ten_sp: str
    gia_sp: Optional[float] = None
    soluong_sp: Optional[int] = None
    anh_sp: Optional[str] = None
    mausac_sp: Optional[str] = None
    chatlieu_sp: Optional[str] = None
    kichthuoc_sp: Optional[str] = None
    mota_sp: Optional[str] = None
    id_dm: Optional[int] = None


class SanPhamCreate(SanPhamBase):
    pass


class SanPhamUpdate(BaseModel):
    ten_sp: Optional[str] = None
    gia_sp: Optional[float] = None
    soluong_sp: Optional[int] = None
    anh_sp: Optional[str] = None
    mausac_sp: Optional[str] = None
    chatlieu_sp: Optional[str] = None
    kichthuoc_sp: Optional[str] = None
    mota_sp: Optional[str] = None
    id_dm: Optional[int] = None


class SanPhamOut(SanPhamBase):
    id_sp: int
    tendanhmuc: Optional[str] = None

    class Config:
        from_attributes = True


# ───────────────────────────── GioHang ────────────────────────────────
class GioHangItem(BaseModel):
    id_sp: int
    soluong: int


class GioHangOut(BaseModel):
    id_sp: int
    ten_sp: str
    gia_sp: float
    anh_sp: Optional[str] = None
    soluong: int


# ───────────────────────────── DonHang ────────────────────────────────
class DonHangCreate(BaseModel):
    hoten: str
    sdt: str
    email: str
    diachi: str
    phuongthuc: str
    ghichu: Optional[str] = None
    items: list[GioHangItem]


class DonHangOut(BaseModel):
    id_donhang: int
    taikhoan: Optional[str] = None
    hoten: Optional[str] = None
    sdt: Optional[str] = None
    email: Optional[str] = None
    diachi: Optional[str] = None
    thoigiandat: Optional[str] = None
    phuongthuc: Optional[str] = None
    ghichu: Optional[str] = None
    tongtien: Optional[float] = None

    class Config:
        from_attributes = True


class DonHangChiTiet(DonHangOut):
    items: list[GioHangOut] = []
