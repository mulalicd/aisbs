@echo off
REM Start Backend Server and Test Script

echo.
echo ========================================
echo AISBS Application Start-Up & Test
echo ========================================
echo.

REM Step 1: Start Backend Server
echo [1/3] Starting Backend Server...
echo.

cd c:\PRIVATE\AI\AISBS\backend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

REM Start server in background and capture output
start "AISBS Backend" cmd /k "node server.js"

REM Wait for server to start
echo Waiting 5 seconds for server to initialize...
timeout /t 5

REM Step 2: Run API Tests
echo.
echo [2/3] Running API Tests...
echo.

cd c:\PRIVATE\AI\AISBS
node backend\scripts\testAPI.js

pause
