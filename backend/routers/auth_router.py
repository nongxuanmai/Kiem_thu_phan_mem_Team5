from fastapi import APIRouter, Depends, HTTPException, status
from database import get_db
import random
import sqlite3
from schemas import NguoiDungCreate, NguoiDungOut, NguoiDungUpdate, LoginRequest, TokenResponse, ChangePasswordRequest, SendOtpRequest, ResetPasswordRequest, DirectResetPasswordRequest
from auth import hash_password, verify_password, create_access_token, get_current_user, get_current_admin

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/reset-password-direct")
def reset_password_direct(body: DirectResetPasswordRequest, db: sqlite3.Connection = Depends(get_db)):
    """Đặt lại mật khẩu mới trực tiếp (bắt buộc nhập mật khẩu mới và 2 lần xác nhận mật khẩu)."""
    if not body.matkhau_moi or len(body.matkhau_moi) < 6:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải từ 6 ký tự trở lên.")

    hashed = hash_password(body.matkhau_moi)
    
    if body.taikhoan:
        db.execute("UPDATE NguoiDung SET matkhau = ? WHERE taikhoan = ?", (hashed, body.taikhoan))
    else:
        # Mặc định cập nhật mật khẩu cho tất cả tài khoản người dùng (không bao gồm admin trừ khi có chỉ định)
        db.execute("UPDATE NguoiDung SET matkhau = ? WHERE quyen != 'admin' OR quyen IS NULL", (hashed,))

    db.commit()
    return {"message": "Đặt lại mật khẩu thành công. Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay!"}


# Bộ nhớ tạm lưu mã OTP (Key: email.lower(), Value: code 4 số)
OTP_STORE = {}

# ...

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_smtp(to_email: str, otp_code: str) -> bool:
    """Gửi email thật đến Gmail của người dùng qua dịch vụ Google SMTP."""
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.environ.get("SMTP_EMAIL", "fashionbag.test@gmail.com")
    sender_pass = os.environ.get("SMTP_PASS", "") # Gmail App Password

    if not sender_pass:
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"FashionBag Support <{sender_email}>"
        msg['To'] = to_email
        msg['Subject'] = f"[{otp_code}] Mã OTP Đặt Lại Mật Khẩu - FashionBag"

        content = f"""
        Chào bạn,

        Mã OTP xác thực 4 chữ số để đặt lại mật khẩu FashionBag của bạn là: {otp_code}

        Vui lòng nhập mã này vào trang Quên Mật Khẩu để hoàn tất quá trình thiết lập mật khẩu mới.
        Mã có hiệu lực trong vòng 5 phút.

        Trân trọng,
        FashionBag Team
        """
        msg.attach(MIMEText(content, 'plain', 'utf-8'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_pass)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"✅ [SMTP GMAIL] Đã gửi email thực tế chứa mã OTP {otp_code} tới {to_email}")
        return True
    except Exception as e:
        print(f"❌ [SMTP ERROR] Không thể gửi email qua SMTP: {e}")
        return False

@router.post("/send-otp")
def send_otp(body: SendOtpRequest, db: sqlite3.Connection = Depends(get_db)):
    """Gửi mã OTP 4 số ngẫu nhiên đến email người dùng để đặt lại mật khẩu."""
    email_clean = body.email.strip().lower()

    # Tìm tài khoản theo email hoặc tài khoản khớp với phần tên trước @ của email
    user = db.execute(
        "SELECT id_nguoidung, taikhoan, email FROM NguoiDung WHERE LOWER(email) = ? OR LOWER(taikhoan) = ?",
        (email_clean, email_clean.split('@')[0])
    ).fetchone()

    # Nếu người dùng chưa gán email ở DB, tự động liên kết email này với tài khoản tìm được
    if user and not user["email"]:
        db.execute("UPDATE NguoiDung SET email = ? WHERE id_nguoidung = ?", (email_clean, user["id_nguoidung"]))
        db.commit()

    # Sinh mã OTP ngẫu nhiên 4 chữ số (1000 - 9999)
    otp_code = str(random.randint(1000, 9999))
    OTP_STORE[email_clean] = otp_code

    # Thử gửi email thực qua SMTP
    email_sent = send_email_smtp(body.email, otp_code)

    print(f"\n==========================================")
    print(f"📩 [SERVER OTP LOG] Email: {body.email}")
    print(f"🔑 MÃ OTP 4 CHỮ SỐ LÀ: {otp_code}")
    print(f"==========================================\n")

    return {
        "message": f"Mã OTP 4 chữ số đã được khởi tạo và gửi tới email {body.email}.",
        "otp_simulated": otp_code,
        "sent_real_email": email_sent
    }


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: sqlite3.Connection = Depends(get_db)):
    """Đặt lại mật khẩu mới thông qua mã OTP 4 số."""
    email_clean = body.email.strip().lower()
    otp_clean = body.otp.strip()

    if email_clean not in OTP_STORE or OTP_STORE[email_clean] != otp_clean:
        raise HTTPException(
            status_code=400,
            detail="Mã OTP 4 số không chính xác hoặc đã hết hạn. Vui lòng nhấn 'Gửi mã OTP' để nhận mã mới!"
        )

    user = db.execute(
        "SELECT id_nguoidung FROM NguoiDung WHERE LOWER(email) = ? OR LOWER(taikhoan) = ?",
        (email_clean, email_clean.split('@')[0])
    ).fetchone()
    
    hashed = hash_password(body.matkhau_moi)
    if user:
        db.execute(
            "UPDATE NguoiDung SET matkhau = ?, email = ? WHERE id_nguoidung = ?",
            (hashed, email_clean, user["id_nguoidung"])
        )
    else:
        # Cập nhật theo email nếu có
        db.execute(
            "UPDATE NguoiDung SET matkhau = ? WHERE LOWER(email) = ?",
            (hashed, email_clean)
        )
    db.commit()

    # Xóa OTP sau khi sử dụng thành công
    OTP_STORE.pop(email_clean, None)

    return {"message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ!"}


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


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db)
):
    """Đổi mật khẩu tài khoản hiện tại."""
    user = db.execute(
        "SELECT * FROM NguoiDung WHERE taikhoan = ?", (current_user["sub"],)
    ).fetchone()
    if not user or not verify_password(body.matkhau_cu, user["matkhau"]):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không chính xác. Vui lòng thử lại!")
    
    hashed = hash_password(body.matkhau_moi)
    db.execute(
        "UPDATE NguoiDung SET matkhau = ? WHERE taikhoan = ?",
        (hashed, current_user["sub"])
    )
    db.commit()
    return {"message": "Đổi mật khẩu thành công."}


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
