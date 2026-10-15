@echo off
REM Quick Start Script for PG Finder (Windows)
REM This script sets up both backend and frontend for development

echo.
echo ============================================
echo 🚀 PG Finder Quick Start Setup (Windows)
echo ============================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed
    exit /b 1
)
echo ✅ Python found

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    exit /b 1
)
echo ✅ Node.js found

echo.

REM Backend setup
echo Setting up Backend...
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    python -m venv backend\venv
)

echo Activating virtual environment...
call backend\venv\Scripts\activate.bat

echo Installing backend dependencies...
if exist "requirements.txt" (
    pip install -q -r requirements.txt
)

echo ✅ Backend ready
echo.

REM Frontend setup
echo Setting up Frontend...
cd frontend_react

if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install --legacy-peer-deps
)

echo ✅ Frontend ready
echo.

cd ..

REM Environment setup
echo Checking environment files...

if not exist "backend\.env" (
    echo ⚠️  backend\.env not found
    echo Please create it with:
    echo   OPENROUTER_API_KEY=your_key
    echo   JWT_SECRET_KEY=your_secret
)

if not exist "frontend_react\.env.local" (
    echo Creating frontend_react\.env.local...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo NEXT_PUBLIC_ENABLE_ANALYTICS=true
        echo NEXT_PUBLIC_ENABLE_REVIEWS=true
    ) > frontend_react\.env.local
    echo ✅ Frontend .env.local created
)

echo.
echo ============================================
echo ✅ Setup Complete!
echo ============================================
echo.
echo Next Steps:
echo.
echo 1️⃣  Terminal 1 - Start Backend:
echo    cd backend
echo    venv\Scripts\activate
echo    python -m uvicorn main:app --reload
echo.
echo 2️⃣  Terminal 2 - Start Frontend:
echo    cd frontend_react
echo    npm run dev
echo.
echo 3️⃣  Open in Browser:
echo    http://localhost:3000
echo.
echo Documentation:
echo    • Setup Guide: REACT_SETUP.md
echo    • Implementation: REACT_IMPLEMENTATION_SUMMARY.md
echo    • Frontend: frontend_react\README.md
echo.

pause
