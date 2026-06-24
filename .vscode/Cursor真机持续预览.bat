@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Cursor · 真机尺寸持续预览（铁律）

set "URL=http://127.0.0.1:8765/cursor-miniapp-phone.html?live=1&src=local"

echo.
echo  ========================================
echo    铁律 · 真机尺寸 + 改码即刷（保存后刷新一次）
echo  ========================================
echo  %URL%
echo.
echo  Cursor: Ctrl+Shift+P → Simple Browser: Show → 粘贴上面地址
echo  规范: docs\双通道验收-浏览器与手机真机框.md
echo.

python scripts\start-local-server.py --probe >nul 2>&1
if errorlevel 1 (
  echo  启动本地服务 8765 （改码即刷）…
  python scripts\start-local-server.py --start
  timeout /t 3 /nobreak >nul
)

python scripts\open-preview-url.py "%URL%"
echo  已打开（Edge/Chrome）。保存 css/js/html 后真机框自动刷新一次（须 watch 服务；可关「改码即刷」）。
pause
