@echo off
chcp 65001 >nul
cd /d "%~dp0"

REM Detect Python command
set PYTHON_CMD=
where python >nul 2>&1 && set PYTHON_CMD=python
if not defined PYTHON_CMD where python3 >nul 2>&1 && set PYTHON_CMD=python3
if not defined PYTHON_CMD where py >nul 2>&1 && set PYTHON_CMD=py

if not defined PYTHON_CMD (
  echo [ERROR] Python not found!
  echo Please install Python 3: https://www.python.org/downloads/
  pause
  exit /b
)

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  for /f "tokens=1" %%b in ("%%a") do echo   Mobile Safari: http://%%b:8765
)
echo.
echo   Main: /index.html
echo   Share: /share.html
echo   Ctrl+C to stop
echo  ================================

start "" "http://localhost:8765/index.html?v=410"
%PYTHON_CMD% -m http.server 8765
