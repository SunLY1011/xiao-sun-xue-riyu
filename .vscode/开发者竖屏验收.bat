@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 开发者竖屏验收（满配）

netstat -an | findstr ":8765.*LISTENING" >nul
if errorlevel 1 (
  echo 正在启动本地服务 8765 ...
  start "日语学习-8765" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
  timeout /t 2 /nobreak >nul
)

echo.
echo  开发者竖屏真机框 + 满配 App（testcard+developer）
echo  http://127.0.0.1:8765/dev-phone-preview.html
echo.
echo  流程：docs\开发者验收-SOP.md
echo  双通道（日常改 UI）: 打开双通道预览.bat — docs\双通道验收-浏览器与手机真机框.md
echo.

start "" "http://127.0.0.1:8765/dev-phone-preview.html"
pause
