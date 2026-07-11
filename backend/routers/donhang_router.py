from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import DonHangCreate, DonHangOut, DonHangChiTiet
from auth import get_current_user, get_current_admin
import sqlite3

router = APIRouter(prefix="/api/donhang", tags=["Đơn Hàng"])


@router.post("", response_model=DonHangOut, status_code=201)
def create_order(
    body: DonHangCreate,
    current_user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    """Tạo đơn hàng mới."""
    if not body.items:
        raise HTTPException(status_code=400, detail="Giỏ hàng trống.")
    
    # Tính tổng tiền
    total = 0.0
    for item in body.items:
        sp = db.execute("SELECT gia_sp, soluong_sp FROM SanPham WHERE id_sp = ?", (item.id_sp,)).fetchone()
        if not sp:
            raise HTTPException(status_code=404, detail=f"Sản phẩm {item.id_sp} không tồn tại.")
        if sp["soluong_sp"] < item.soluong:
            raise HTTPException(status_code=400, detail=f"Sản phẩm {item.id_sp} không đủ số lượng.")
        total += sp["gia_sp"] * item.soluong
    
    # Tạo đơn hàng
    cursor = db.execute(
        """INSERT INTO DonHang (taikhoan, hoten, sdt, email, diachi, phuongthuc, ghichu, tongtien)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (current_user["sub"], body.hoten, body.sdt, body.email, body.diachi,
         body.phuongthuc, body.ghichu, total)
    )
    id_donhang = cursor.lastrowid
    
    # Thêm chi tiết giỏ hàng & trừ tồn kho
    for item in body.items:
        db.execute(
            "INSERT INTO GioHang (id_sp, id_donhang, soluong) VALUES (?, ?, ?)",
            (item.id_sp, id_donhang, item.soluong)
        )
        db.execute(
            "UPDATE SanPham SET soluong_sp = soluong_sp - ? WHERE id_sp = ?",
            (item.soluong, item.id_sp)
        )
    
    db.commit()
    order = db.execute("SELECT * FROM DonHang WHERE id_donhang = ?", (id_donhang,)).fetchone()
    return dict(order)


@router.get("/my-orders", response_model=list[DonHangChiTiet])
def get_my_orders(current_user: dict = Depends(get_current_user), db: sqlite3.Connection = Depends(get_db)):
    """Lấy danh sách đơn hàng của người dùng hiện tại."""
    orders = db.execute(
        "SELECT * FROM DonHang WHERE taikhoan = ? ORDER BY thoigiandat DESC",
        (current_user["sub"],)
    ).fetchall()
    
    result = []
    for order in orders:
        order_dict = dict(order)
        items = db.execute(
            """SELECT gh.soluong, sp.id_sp, sp.ten_sp, sp.gia_sp, sp.anh_sp
               FROM GioHang gh JOIN SanPham sp ON gh.id_sp = sp.id_sp
               WHERE gh.id_donhang = ?""",
            (order["id_donhang"],)
        ).fetchall()
        order_dict["items"] = [dict(i) for i in items]
        result.append(order_dict)
    return result


@router.get("/{id_donhang}", response_model=DonHangChiTiet)
def get_order_detail(
    id_donhang: int,
    current_user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    """Lấy chi tiết đơn hàng."""
    order = db.execute("SELECT * FROM DonHang WHERE id_donhang = ?", (id_donhang,)).fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")
    
    # Người dùng chỉ xem đơn của mình, admin xem tất
    if current_user.get("quyen") != "admin" and order["taikhoan"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Không có quyền xem đơn hàng này.")
    
    order_dict = dict(order)
    items = db.execute(
        """SELECT gh.soluong, sp.id_sp, sp.ten_sp, sp.gia_sp, sp.anh_sp
           FROM GioHang gh JOIN SanPham sp ON gh.id_sp = sp.id_sp
           WHERE gh.id_donhang = ?""",
        (id_donhang,)
    ).fetchall()
    order_dict["items"] = [dict(i) for i in items]
    return order_dict


# ── Admin endpoints ─────────────────────────────────────────────────────
@router.get("", response_model=list[DonHangChiTiet])
def get_all_orders(admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Lấy tất cả đơn hàng."""
    orders = db.execute("SELECT * FROM DonHang ORDER BY thoigiandat DESC").fetchall()
    result = []
    for order in orders:
        order_dict = dict(order)
        items = db.execute(
            """SELECT gh.soluong, sp.id_sp, sp.ten_sp, sp.gia_sp, sp.anh_sp
               FROM GioHang gh JOIN SanPham sp ON gh.id_sp = sp.id_sp
               WHERE gh.id_donhang = ?""",
            (order["id_donhang"],)
        ).fetchall()
        order_dict["items"] = [dict(i) for i in items]
        result.append(order_dict)
    return result


@router.delete("/{id_donhang}")
def delete_order(id_donhang: int, admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Xóa đơn hàng."""
    db.execute("DELETE FROM DonHang WHERE id_donhang = ?", (id_donhang,))
    db.commit()
    return {"message": "Đã xóa đơn hàng."}
