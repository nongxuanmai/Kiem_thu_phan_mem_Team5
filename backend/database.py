import sqlite3
import os

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "fashionbag.db"))
SQL_PATH = os.path.join(os.path.dirname(__file__), "init_db.sql")


def get_db():
    """Tạo kết nối SQLite3, trả về connection."""
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Trả về dict-like rows
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
    finally:
        conn.close()


def migrate_database(conn: sqlite3.Connection):
    """Chạy migration thêm cột mới nếu chưa tồn tại."""
    # Kiểm tra cột hiện có trong bảng DonHang
    existing_cols = {row[1] for row in conn.execute("PRAGMA table_info(DonHang)").fetchall()}
    if "trangthai" not in existing_cols:
        conn.execute("ALTER TABLE DonHang ADD COLUMN trangthai TEXT DEFAULT 'Đã đặt'")
        conn.execute("UPDATE DonHang SET trangthai = 'Đã đặt' WHERE trangthai IS NULL")
        print("[DB] Migration: added column 'trangthai' to DonHang")
    if "lydo_huy" not in existing_cols:
        conn.execute("ALTER TABLE DonHang ADD COLUMN lydo_huy TEXT")
        print("[DB] Migration: added column 'lydo_huy' to DonHang")
    conn.commit()


def init_database():
    """Khởi tạo database từ file SQL."""
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.execute("PRAGMA foreign_keys = ON")
    with open(SQL_PATH, "r", encoding="utf-8") as f:
        sql = f.read()
    conn.executescript(sql)
    conn.commit()
    migrate_database(conn)  # Chạy migration sau init
    conn.close()
    print(f"[DB] Database initialized at: {DB_PATH}")

