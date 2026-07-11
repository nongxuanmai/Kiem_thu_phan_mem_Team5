from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from database import get_db
from schemas import SanPhamCreate, SanPhamOut, SanPhamUpdate
from auth import get_current_admin
import sqlite3
import os
import shutil
import uuid

router = APIRouter(prefix="/api/sanpham", tags=["Sản Phẩm"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=list[SanPhamOut])
def get_all_products(
    id_dm: int = None,
    search: str = None,
    db: sqlite3.Connection = Depends(get_db)
):
    """Lấy danh sách sản phẩm (có thể lọc theo danh mục hoặc tìm kiếm)."""
    query = """
        SELECT sp.*, dm.tendanhmuc
        FROM SanPham sp
        LEFT JOIN DanhMuc dm ON sp.id_dm = dm.id_dm
        WHERE 1=1
    """
    params = []
    if id_dm:
        query += " AND sp.id_dm = ?"
        params.append(id_dm)
    if search:
        query += " AND (sp.ten_sp LIKE ? OR sp.mota_sp LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    query += " ORDER BY sp.id_sp DESC"
    
    rows = db.execute(query, params).fetchall()
    return [dict(r) for r in rows]


@router.get("/{id_sp}", response_model=SanPhamOut)
def get_product(id_sp: int, db: sqlite3.Connection = Depends(get_db)):
    """Lấy chi tiết một sản phẩm."""
    row = db.execute(
        """SELECT sp.*, dm.tendanhmuc
           FROM SanPham sp LEFT JOIN DanhMuc dm ON sp.id_dm = dm.id_dm
           WHERE sp.id_sp = ?""",
        (id_sp,)
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    return dict(row)


@router.post("", response_model=SanPhamOut, status_code=201)
def create_product(product: SanPhamCreate, admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Thêm sản phẩm mới."""
    cursor = db.execute(
        """INSERT INTO SanPham (ten_sp, gia_sp, soluong_sp, anh_sp, mausac_sp, chatlieu_sp, kichthuoc_sp, mota_sp, id_dm)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (product.ten_sp, product.gia_sp, product.soluong_sp, product.anh_sp,
         product.mausac_sp, product.chatlieu_sp, product.kichthuoc_sp, product.mota_sp, product.id_dm)
    )
    db.commit()
    return dict(db.execute(
        "SELECT sp.*, dm.tendanhmuc FROM SanPham sp LEFT JOIN DanhMuc dm ON sp.id_dm = dm.id_dm WHERE sp.id_sp = ?",
        (cursor.lastrowid,)
    ).fetchone())


@router.put("/{id_sp}", response_model=SanPhamOut)
def update_product(
    id_sp: int,
    product: SanPhamUpdate,
    admin=Depends(get_current_admin),
    db: sqlite3.Connection = Depends(get_db)
):
    """[Admin] Cập nhật sản phẩm."""
    existing = db.execute("SELECT id_sp FROM SanPham WHERE id_sp = ?", (id_sp,)).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    
    updates = product.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="Không có thông tin cập nhật.")
    
    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [id_sp]
    db.execute(f"UPDATE SanPham SET {set_clause} WHERE id_sp = ?", values)
    db.commit()
    return dict(db.execute(
        "SELECT sp.*, dm.tendanhmuc FROM SanPham sp LEFT JOIN DanhMuc dm ON sp.id_dm = dm.id_dm WHERE sp.id_sp = ?",
        (id_sp,)
    ).fetchone())


@router.delete("/{id_sp}")
def delete_product(id_sp: int, admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Xóa sản phẩm."""
    db.execute("DELETE FROM SanPham WHERE id_sp = ?", (id_sp,))
    db.commit()
    return {"message": "Đã xóa sản phẩm."}


@router.post("/{id_sp}/upload-image")
async def upload_product_image(
    id_sp: int,
    file: UploadFile = File(...),
    admin=Depends(get_current_admin),
    db: sqlite3.Connection = Depends(get_db)
):
    """[Admin] Upload ảnh sản phẩm."""
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    db.execute("UPDATE SanPham SET anh_sp = ? WHERE id_sp = ?", (filename, id_sp))
    db.commit()
    return {"anh_sp": filename, "message": "Upload ảnh thành công."}
