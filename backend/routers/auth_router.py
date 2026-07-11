from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db
from schemas import NguoiDungCreate, NguoiDungOut, NguoiDungUpdate, LoginRequest, TokenResponse
from auth import hash_password, verify_password, create_access_token, get_current_user, get_current_admin
import sqlite3

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=NguoiDungOut, status_code=201)
def register(user: NguoiDungCreate, db: sqlite3.Connection = Depends(get_db)):
    """Đăng ký tài khoản mới."""
    # Kiểm tra tài khoản đã tồn tại
    existing = db.execute(
        "SELECT id_nguoidung FROM NguoiDung WHERE taikhoan = ?", (user.taikhoan,)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Tài khoản đã tồn tại.")
    
    hashed = hash_password(user.matkhau)
    cursor = db.execute(
        """INSERT INTO NguoiDung (taikhoan, matkhau, hoten, gioitinh, sdt, email, namsinh, quyen)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (user.taikhoan, hashed, user.hoten, user.gioitinh, user.sdt, user.email, user.namsinh, user.quyen or "user")
    )
    db.commit()
    new_user = db.execute(
        "SELECT * FROM NguoiDung WHERE id_nguoidung = ?", (cursor.lastrowid,)
    ).fetchone()
    return dict(new_user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    """Đăng nhập và nhận JWT token."""
    user = db.execute(
        "SELECT * FROM NguoiDung WHERE taikhoan = ?", (body.taikhoan,)
    ).fetchone()
    if not user or not verify_password(body.matkhau, user["matkhau"]):
        raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không đúng.")
    
    token = create_access_token({
        "sub": user["taikhoan"],
        "quyen": user["quyen"],
        "id": user["id_nguoidung"]
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "quyen": user["quyen"],
        "taikhoan": user["taikhoan"],
        "hoten": user["hoten"]
    }


@router.get("/me", response_model=NguoiDungOut)
def get_me(current_user: dict = Depends(get_current_user), db: sqlite3.Connection = Depends(get_db)):
    """Lấy thông tin tài khoản hiện tại."""
    user = db.execute(
        "SELECT * FROM NguoiDung WHERE taikhoan = ?", (current_user["sub"],)
    ).fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    return dict(user)


@router.put("/me", response_model=NguoiDungOut)
def update_me(
    body: NguoiDungUpdate,
    current_user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    """Cập nhật thông tin cá nhân."""
    db.execute(
        """UPDATE NguoiDung SET hoten=?, gioitinh=?, sdt=?, email=?, namsinh=?
           WHERE taikhoan=?""",
        (body.hoten, body.gioitinh, body.sdt, body.email, body.namsinh, current_user["sub"])
    )
    db.commit()
    user = db.execute("SELECT * FROM NguoiDung WHERE taikhoan = ?", (current_user["sub"],)).fetchone()
    return dict(user)


# ── Admin: quản lý người dùng ──────────────────────────────────────────
@router.get("/users", response_model=list[NguoiDungOut])
def list_users(admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Danh sách tất cả người dùng."""
    rows = db.execute("SELECT * FROM NguoiDung ORDER BY id_nguoidung").fetchall()
    return [dict(r) for r in rows]


@router.delete("/users/{id_nguoidung}")
def delete_user(id_nguoidung: int, admin=Depends(get_current_admin), db: sqlite3.Connection = Depends(get_db)):
    """[Admin] Xóa người dùng."""
    db.execute("DELETE FROM NguoiDung WHERE id_nguoidung = ?", (id_nguoidung,))
    db.commit()
    return {"message": "Đã xóa người dùng."}
