@echo off
title Waves Envirotech - Corporate Website
color 0B

echo.
echo  ============================================================
echo   WAVES ENVIROTECH PVT. LTD. - Corporate Website Launcher
echo  ============================================================
echo.

cd /d "%~dp0"

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed!
    echo  Please download and install Node.js from https://nodejs.org
    echo  Then re-run this file.
    pause
    exit /b 1
)

echo  [OK] Node.js detected.

cd backend

:: Install dependencies if needed
if not exist node_modules (
    echo.
    echo  [SETUP] Installing dependencies for the first time...
    echo  This may take a minute...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed successfully.
)

echo.
echo  ============================================================
echo   Waves Envirotech Website is LIVE!
echo   Open your browser at: http://localhost:3000
echo  ============================================================
echo.
echo  Press Ctrl+C to stop the server.
echo.

:: Open browser after a short delay
start /b cmd /c "timeout /t 2 >nul && start http://localhost:3000"

:: Start the server
node server.js

pause
