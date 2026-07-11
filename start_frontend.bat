@echo off
chcp 65001 >nul
title FashionBag - Frontend Server
echo.
echo =====================================================
echo    FASHIONBAG - KHOI DONG FRONTEND (React + Vite)
echo =====================================================
echo.

cd /d "%~dp0frontend"

echo [Buoc 1/3] Kiem tra Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo  [LOI] Node.js chua duoc cai dat!
    echo  Tai Node.js tai: https://nodejs.org (phien ban 18+)
    pause
    exit /b 1
)
node --version

echo.
echo [Buoc 2/3] Kiem tra va cai dat thu vien (node_modules)...
if not exist "node_modules" (
    echo  Dang cai dat node_modules, vui long doi...
    npm install
    if errorlevel 1 (
        echo  [LOI] npm install that bai!
        pause
        exit /b 1
    )
) else (
    echo  node_modules da ton tai, bo qua buoc cai dat.
)

echo.
echo [Buoc 3/3] Khoi dong React dev server...
echo.
echo  Frontend:     http://localhost:5173
echo  Backend:      http://localhost:8000 (hay chay start_backend.bat truoc!)
echo.
echo  LUU Y: Backend phai chay truoc o cua so khac!
echo.
echo  Nhan Ctrl+C de dung server.
echo =====================================================
echo.
npm run dev
pause
