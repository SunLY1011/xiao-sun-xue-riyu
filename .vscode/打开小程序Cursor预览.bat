@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 小程序真机尺寸预览 390x844

set "PHONE=http://127.0.0.1:8765/cursor-miniapp-phone.html?live=1"

echo.
echo  小程序真机屏 · 外壳 390x844 · web-view 内容 753px 高
echo  H5 自动带 miniappPreview=1（与微信内显示一致）
echo  %PHONE%
echo.

python scripts\start-local-server.py --probe >nul 2>&1
if errorlevel 1 (
  echo  启动本地服务 8765 （改码即刷）…
  python scripts\start-local-server.py --start
  timeout /t 3 /nobreak >nul
)

python scripts\open-preview-url.py "%PHONE%"
echo.
echo  已打开（Edge/Chrome）。关页面前请先关「改码即刷」或整页退出，避免 Electron 壳报错。
echo  Cursor 侧边预览：Ctrl+Shift+P → Simple Browser: Show
echo  粘贴: %PHONE%
echo.
echo  [双通道] 建议同时开浏览器全宽: 打开双通道预览.bat
echo  规范: docs\双通道验收-浏览器与手机真机框.md
pause
