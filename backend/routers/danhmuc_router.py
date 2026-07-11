from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from schemas import DanhMucCreate, DanhMucOut
from auth import get_current_admin
import sqlite3

router = APIRouter(prefix="/api/danhmuc", tags=["Danh Mục"])


@router.get("", response_model=list[DanhMucOut])
def get_all_categories(db: sqlite3.Connection = Depends(get_db)):
    """Lấy danh sách tất cả danh mục."""
    rows = db.execute("SELECT * FROM DanhMuc ORDER BY id_dm").fetchall()
    return [dict(r) for r in rows]


@router.get("/{id_dm}", response_model=DanhMucOut)
def get_category(id_dm: int, db: sqlite3.Connection = Depends(get_db)):
    """Lấy thông tin một danh mục."""
    row = db.execute("SELECT * FROM DanhMuc WHERE id_dm = ?", (id_dm,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
    return dict(row)


@router.post("", response_model=DanhMucOut, status_code=201)
def create_category(dm: DanhMucCreate, admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Thêm danh mục mới."""
    try:
        cursor = db.execute("INSERT INTO DanhMuc (tendanhmuc) VALUES (?)", (dm.tendanhmuc,))
        db.commit()
        return dict(db.execute("SELECT * FROM DanhMuc WHERE id_dm = ?", (cursor.lastrowid,)).fetchone())
    except Exception:
        raise HTTPException(status_code=400, detail="Tên danh mục đã tồn tại.")


@router.put("/{id_dm}", response_model=DanhMucOut)
def update_category(id_dm: int, dm: DanhMucCreate, admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Cập nhật danh mục."""
    db.execute("UPDATE DanhMuc SET tendanhmuc = ? WHERE id_dm = ?", (dm.tendanhmuc, id_dm))
    db.commit()
    return dict(db.execute("SELECT * FROM DanhMuc WHERE id_dm = ?", (id_dm,)).fetchone())


@router.delete("/{id_dm}")
def delete_category(id_dm: int, admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Xóa danh mục."""
    db.execute("DELETE FROM DanhMuc WHERE id_dm = ?", (id_dm,))
    db.commit()
    return {"message": "Đã xóa danh mục."}
