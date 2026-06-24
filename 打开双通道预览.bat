@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 双通道预览 · 浏览器 + 小程序真机框

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
if not defined VER set "VER=39"

set "URL_A=http://localhost:8765/index.html?v=%VER%"
set "URL_B=http://127.0.0.1:8765/cursor-miniapp-phone.html?live=1"

echo.
echo  ========================================
echo    双通道预览（项目强制前置 / 交付前终检）
echo  ========================================
echo  规范: docs\双通道验收-浏览器与手机真机框.md
echo.
echo  [A] 浏览器全宽（改码后 Ctrl+F5 持续对照）
echo  %URL_A%
echo.
echo  [B] 小程序真机框 390x844（真实使用态 · 改码即刷 live=1）
echo  %URL_B%
echo  Cursor: Ctrl+Shift+P → Simple Browser: Show → 粘贴 URL_B
echo.

python scripts\start-local-server.py --probe >nul 2>&1
if errorlevel 1 (
  echo  本地服务未就绪，正在启动 8765 （改码即刷）...
  python scripts\start-local-server.py --start
  timeout /t 3 /nobreak >nul
  python scripts\start-local-server.py --probe >nul 2>&1
  if errorlevel 1 (
    echo  [提示] 仍无法访问时请双击「重启本地服务.bat」后再运行本 bat
    echo.
  )
) else (
  echo  本地服务正常
)

start "" python scripts\open-preview-url.py "%URL_A%"
timeout /t 1 /nobreak >nul
start "" python scripts\open-preview-url.py "%URL_B%"
echo.
echo  已打开 A + B（Edge/Chrome，避免 Electron 默认浏览器关窗报错）。
echo  仅开发者满配四关/彩蛋: 开发者竖屏验收.bat
echo.
pause
