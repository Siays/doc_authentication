@echo off
REM Find PID using port 8000, sometime even the terminal is all killed, but background processes still occupy the port 8000,
REM so kill all processes running on port 8000 before start fastAPI
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8050 ^| findstr LISTENING') do (
    echo Killing process on port 8050 with PID %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Start Uvicorn
uvicorn main:app --host 127.0.0.1 --port 8050
