from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import init_database
from routers import auth_router, sanpham_router, danhmuc_router, donhang_router
import os

# Khởi tạo database khi start server
init_database()

app = FastAPI(
    title="FashionBag API",
    description="REST API cho website bán túi xách FashionBag",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS - cho phép frontend React kết nối (bao gồm Docker)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (ảnh sản phẩm)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Đăng ký các router
app.include_router(auth_router.router)
app.include_router(sanpham_router.router)
app.include_router(danhmuc_router.router)
app.include_router(donhang_router.router)


@app.get("/")
def root():
    return {"message": "FashionBag API is running!", "docs": "/api/docs"}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FashionBag Backend"}
