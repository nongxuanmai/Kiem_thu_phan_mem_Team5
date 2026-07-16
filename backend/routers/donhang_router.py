from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import DonHangCreate, DonHangOut, DonHangChiTiet, YeuCauHuyDon, DuyetHuyDon
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

    # Tạo đơn hàng với trạng thái mặc định
    cursor = db.execute(
        """INSERT INTO DonHang (taikhoan, hoten, sdt, email, diachi, phuongthuc, ghichu, tongtien, trangthai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (current_user["sub"], body.hoten, body.sdt, body.email, body.diachi,
         body.phuongthuc, body.ghichu, total, "Đã đặt")
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
def get_my_orders(
    current_user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    """Lấy danh sách đơn hàng của người dùng hiện tại."""
    orders = db.execute(
        "SELECT * FROM DonHang WHERE taikhoan = ? ORDER BY thoigiandat DESC",
        (current_user["sub"],)
    ).fetchall()

    result = []
    for order in orders:
        order_dict = dict(order)
        items = db.execute(
            """SELECT gh.soluong, sp.id_sp, sp.ten_sp, sp.gia_sp, sp.anh_sp, sp.mota_sp
               FROM GioHang gh JOIN SanPham sp ON gh.id_sp = sp.id_sp
               WHERE gh.id_donhang = ?""",
            (order["id_donhang"],)
        ).fetchall()
        order_dict["items"] = [dict(i) for i in items]
        result.append(order_dict)
    return result


@router.post("/my-orders/{id_donhang}/request-cancel")
def request_cancel_order(
    id_donhang: int,
    body: YeuCauHuyDon,
    current_user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    """Khách hàng gửi yêu cầu hủy đơn hàng kèm lý do."""
    order = db.execute("SELECT * FROM DonHang WHERE id_donhang = ?", (id_donhang,)).fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")
    if order["taikhoan"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Không có quyền hủy đơn hàng này.")

    # Chỉ cho phép yêu cầu hủy khi đơn ở trạng thái "Đã đặt" hoặc "Đang xử lý"
    allowed = ("Đã đặt", "Đang xử lý")
    if order["trangthai"] not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Không thể gửi yêu cầu hủy đơn đang ở trạng thái '{order['trangthai']}'."
        )

    if not body.lydo_huy or not body.lydo_huy.strip():
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp lý do hủy đơn.")

    db.execute(
        "UPDATE DonHang SET trangthai = 'Chờ duyệt hủy', lydo_huy = ? WHERE id_donhang = ?",
        (body.lydo_huy.strip(), id_donhang)
    )
    db.commit()
    return {"message": "Đã gửi yêu cầu hủy đơn hàng. Vui lòng chờ admin xét duyệt."}


# ── Admin endpoints ─────────────────────────────────────────────────────

@router.get("/cancel-requests", response_model=list[DonHangChiTiet])
def get_cancel_requests(
    admin=Depends(get_current_admin),
    db: sqlite3.Connection = Depends(get_db)
):
    """[Admin] Lấy danh sách đơn hàng đang chờ duyệt hủy."""
    orders = db.execute(
        "SELECT * FROM DonHang WHERE trangthai = 'Chờ duyệt hủy' ORDER BY thoigiandat DESC"
    ).fetchall()
    result = []
    for order in orders:
        order_dict = dict(order)
        items = db.execute(
            """SELECT gh.soluong, sp.id_sp, sp.ten_sp, sp.gia_sp, sp.anh_sp, sp.mota_sp
               FROM GioHang gh JOIN SanPham sp ON gh.id_sp = sp.id_sp
               WHERE gh.id_donhang = ?""",
            (order["id_donhang"],)
        ).fetchall()
        order_dict["items"] = [dict(i) for i in items]
        result.append(order_dict)
    return result


@router.post("/cancel-requests/{id_donhang}/review")
def review_cancel_request(
    id_donhang: int,
    body: DuyetHuyDon,
    admin=Depends(get_current_admin),
    db: sqlite3.Connection = Depends(get_db)
):
    """[Admin] Duyệt hoặc từ chối yêu cầu hủy đơn hàng."""
    order = db.execute("SELECT * FROM DonHang WHERE id_donhang = ?", (id_donhang,)).fetchone()
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")
    if order["trangthai"] != "Chờ duyệt hủy":
        raise HTTPException(status_code=400, detail="Đơn hàng này không đang chờ duyệt hủy.")

    if body.chap_thuan:
        # Admin đồng ý hủy → đổi trạng thái & hoàn trả tồn kho
        db.execute(
            "UPDATE DonHang SET trangthai = 'Đã hủy' WHERE id_donhang = ?",
            (id_donhang,)
        )
        cart_items = db.execute(
            "SELECT id_sp, soluong FROM GioHang WHERE id_donhang = ?", (id_donhang,)
        ).fetchall()
        for ci in cart_items:
            db.execute(
                "UPDATE SanPham SET soluong_sp = soluong_sp + ? WHERE id_sp = ?",
                (ci["soluong"], ci["id_sp"])
            )
        db.commit()
        return {"message": "Đã duyệt hủy đơn hàng và hoàn trả tồn kho."}
    else:
        # Admin từ chối → trả về trạng thái "Đã đặt", xóa lý do hủy
        db.execute(
            "UPDATE DonHang SET trangthai = 'Đã đặt', lydo_huy = NULL WHERE id_donhang = ?",
            (id_donhang,)
        )
        db.commit()
        return {"message": "Đã từ chối yêu cầu hủy. Đơn hàng tiếp tục được xử lý."}


@router.patch("/{id_donhang}/trangthai")
def update_order_status(
    id_donhang: int,
    trangthai: str,
    admin=Depends(get_current_admin),
    db: sqlite3.Connection = Depends(get_db)
):
    """[Admin] Cập nhật thủ công trạng thái đơn hàng."""
    valid_statuses = ["Đã đặt", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"]
    if trangthai not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Trạng thái không hợp lệ. Chọn: {valid_statuses}")
    db.execute("UPDATE DonHang SET trangthai = ? WHERE id_donhang = ?", (trangthai, id_donhang))
    db.commit()
    return {"message": f"Đã cập nhật trạng thái đơn #{id_donhang} thành '{trangthai}'."}


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

    if current_user.get("quyen") != "admin" and order["taikhoan"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Không có quyền xem đơn hàng này.")

    order_dict = dict(order)
    items = db.execute(
        """SELECT gh.soluong, sp.id_sp, sp.ten_sp, sp.gia_sp, sp.anh_sp, sp.mota_sp
           FROM GioHang gh JOIN SanPham sp ON gh.id_sp = sp.id_sp
           WHERE gh.id_donhang = ?""",
        (id_donhang,)
    ).fetchall()
    order_dict["items"] = [dict(i) for i in items]
    return order_dict


@router.get("", response_model=list[DonHangChiTiet])
def get_all_orders(admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Lấy tất cả đơn hàng."""
    orders = db.execute("SELECT * FROM DonHang ORDER BY thoigiandat DESC").fetchall()
    result = []
    for order in orders:
        order_dict = dict(order)
        items = db.execute(
            """SELECT gh.soluong, sp.id_sp, sp.ten_sp, sp.gia_sp, sp.anh_sp, sp.mota_sp
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
