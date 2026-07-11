@echo off
chcp 65001 >nul
title FashionBag - Backend Server
echo.
echo =====================================================
echo    FASHIONBAG - KHOI DONG BACKEND (FastAPI)
echo =====================================================
echo.

cd /d "%~dp0backend"

echo [Buoc 1/3] Kiem tra Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo  [LOI] Python chua duoc cai dat!
    echo  Tai Python tai: https://python.org
    pause
    exit /b 1
)
python --version

echo.
echo [Buoc 2/3] Kiem tra thu vien Python...
python -c "import fastapi, uvicorn, bcrypt, jwt" >nul 2>&1
if errorlevel 1 (
    echo  Dang cai dat cac thu vien con thieu tu requirements.txt...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo  [LOI] Cai dat thu vien that bai!
        pause
        exit /b 1
    )
) else (
    echo  Cac thu vien da duoc cai dat day du.
)

echo.
echo [Buoc 3/3] Khoi dong FastAPI server...
echo.
echo  API Server:   http://localhost:8000
echo  Swagger Docs: http://localhost:8000/api/docs
echo  ReDoc:        http://localhost:8000/api/redoc
echo  San pham:     http://localhost:8000/api/sanpham
echo  Dang nhap:    http://localhost:8000/api/auth/login
echo.
echo  Tai khoan admin: admin / Admin@123
echo.
echo  Nhan Ctrl+C de dung server.
echo =====================================================
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
