@echo off
chcp 65001 >nul
title VocaBee - Setup

echo.
echo  ██╗   ██╗ ██████╗  ██████╗ █████╗ ██████╗ ███████╗███████╗
echo  ██║   ██║██╔═══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝
echo  ██║   ██║██║   ██║██║     ███████║██████╔╝█████╗  █████╗
echo  ╚██╗ ██╔╝██║   ██║██║     ██╔══██║██╔══██╗██╔══╝  ██╔══╝
echo   ╚████╔╝ ╚██████╔╝╚██████╗██║  ██║██████╔╝███████╗███████╗
echo    ╚═══╝   ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝
echo.
echo  === SETUP MOI TRUONG ===
echo.

REM ─── BUOC 1: Kiem tra Node.js ───────────────────────────────────────────────
echo [1/4] Kiem tra Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo     [LOI] Node.js chua duoc cai dat!
    echo     Vui long tai Node.js tai: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo     OK - Node.js %NODE_VER%

REM ─── BUOC 2: Cai dat packages ───────────────────────────────────────────────
echo.
echo [2/4] Cai dat packages (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo     [LOI] npm install that bai!
    pause
    exit /b 1
)
echo     OK - Tat ca packages da duoc cai dat.

REM ─── BUOC 3: Tao file .env neu chua co ─────────────────────────────────────
echo.
echo [3/4] Kiem tra file .env...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo     .env da duoc tao tu .env.example
        echo.
        echo     *** QUAN TRONG: Mo file .env va dien cac gia tri can thiet ***
        echo     - AUTH_SECRET: Chay lenh: npx auth secret
        echo     - EMAIL_*: Thong tin SMTP de gui email
        echo.
    ) else (
        echo     [CANH BAO] Khong tim thay .env.example. Ban can tu tao .env!
    )
) else (
    echo     OK - File .env da ton tai.
)

REM ─── BUOC 4: Khoi tao Database (Prisma) ─────────────────────────────────────
echo.
echo [4/4] Khoi tao Database...
call npx prisma generate
if %errorlevel% neq 0 (
    echo     [LOI] prisma generate that bai!
    pause
    exit /b 1
)

REM Chay migrate tao database
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo     [CANH BAO] migrate deploy that bai, thu prisma db push...
    call npx prisma db push
)
echo     OK - Database san sang.

REM ─── HOAN TAT ────────────────────────────────────────────────────────────────
echo.
echo ════════════════════════════════════════════════════════════
echo   SETUP HOAN TAT!
echo.
echo   De chay ung dung, su dung lenh:
echo     npm run dev
echo.
echo   Mo trinh duyet tai: http://localhost:3000
echo ════════════════════════════════════════════════════════════
echo.

set /p RUN_NOW="Ban co muon chay app ngay bay gio? (y/n): "
if /i "%RUN_NOW%"=="y" (
    echo.
    echo  Dang khoi dong VocaBee...
    call npm run dev
)

pause
