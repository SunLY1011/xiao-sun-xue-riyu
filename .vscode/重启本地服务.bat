@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 重启本地服务 8765

echo 正在结束占用 8765 端口的进程...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8765" ^| findstr LISTENING') do (
  taskkill /F /PID %%p >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo 正在启动 local-preview-server 8765 （改码即刷 + 静态文件）...
start "日语学习-本地服务" /min cmd /c "cd /d "%~dp0" && python scripts\local-preview-server.py --watch"
timeout /t 2 /nobreak >nul

python scripts\start-local-server.py --probe
if errorlevel 1 (
  echo.
  echo  若仍失败：关闭所有「日语学习-本地服务」窗口后重试本 bat
  pause
  exit /b 1
)

echo.
echo  服务正常。请再双击「打开本地预览.bat」或打开：
for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
echo  http://127.0.0.1:8765/index.html?v=%VER%
pause
