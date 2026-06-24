@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 三级彩蛋 - 预览导航

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
if not defined VER set "VER=84"

set "HUB=http://localhost:8765/story-egg-preview.html"
set "APP=http://localhost:8765/index.html?v=%VER%"

echo.
echo  三级彩蛋预览导航（L1 / L2 / L3）
echo  %HUB%
echo.
echo  学习 App：%APP%
echo.

python scripts\start-local-server.py --probe >nul 2>&1
if errorlevel 1 (
  echo  正在启动 8765 ...
  start "日语学习-本地服务" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
  timeout /t 3 /nobreak >nul
)

start "" "%HUB%"
echo  已打开预览导航页。
pause
