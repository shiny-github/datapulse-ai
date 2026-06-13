@echo off
title DataPulse AI

echo ============================================
echo       DataPulse AI - Starting...
echo ============================================
echo.

REM Start FastAPI backend
echo [1/2] Starting Backend (FastAPI on port 8000)...
start "DataPulse Backend" cmd /k "cd /d "%~dp0backend" && pip install -r requirements.txt -q && uvicorn main:app --reload --port 8000"

timeout /t 4 /nobreak >nul

REM Start React frontend
echo [2/2] Starting Frontend (React on port 3000)...
start "DataPulse Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"

echo.
echo ============================================
echo  Backend  -> http://localhost:8000
echo  Frontend -> http://localhost:3000
echo  API Docs -> http://localhost:8000/docs
echo ============================================
echo.
echo Both servers are starting in separate windows.
echo Press any key to open the app in your browser...
pause >nul

start http://localhost:3000
