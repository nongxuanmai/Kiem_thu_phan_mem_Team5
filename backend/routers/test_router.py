"""
Router phục vụ kiểm thử (testing only).
Cung cấp endpoint để bật/tắt chế độ giả lập lỗi cơ sở dữ liệu.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/test", tags=["Testing"])

# Cờ toàn cục: True = giả lập lỗi CSDL, False = hoạt động bình thường
simulate_db_error: bool = False


def is_db_error_simulated() -> bool:
    return simulate_db_error


@router.post("/simulate-db-error")
def enable_db_error():
    """Bật chế độ giả lập lỗi kết nối CSDL."""
    global simulate_db_error
    simulate_db_error = True
    return {"status": "enabled", "message": "Đã bật chế độ giả lập lỗi CSDL"}


@router.post("/restore-db")
def disable_db_error():
    """Tắt chế độ giả lập lỗi – khôi phục hoạt động bình thường."""
    global simulate_db_error
    simulate_db_error = False
    return {"status": "disabled", "message": "Đã khôi phục kết nối CSDL bình thường"}


@router.get("/db-status")
def get_db_status():
    """Kiểm tra trạng thái hiện tại của cờ giả lập lỗi CSDL."""
    return {
        "simulate_db_error": simulate_db_error,
        "message": "Đang giả lập lỗi CSDL" if simulate_db_error else "CSDL hoạt động bình thường"
    }
