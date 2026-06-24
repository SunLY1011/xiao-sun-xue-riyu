@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 竖屏真机比例 · 排版验收

netstat -an | findstr ":8765.*LISTENING" >nul
if errorlevel 1 (
  echo 正在启动本地服务 8765 ...
  start "日语学习-8765" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
  timeout /t 2 /nobreak >nul
)

set TIER=l2
set UNIT=1
if not "%~1"=="" set UNIT=%~1
if /i "%~1"=="l1" set TIER=l1& set UNIT=%~2
if /i "%~1"=="l3" set TIER=l3& set UNIT=

echo.
echo  竖屏真机比例排版验收（L1每课 / L2单元 / L3终结）
echo  http://127.0.0.1:8765/story-unit-phone-real.html?tier=%TIER%&unit=%UNIT%
echo.
start "" "http://127.0.0.1:8765/story-unit-phone-real.html?tier=%TIER%&unit=%UNIT%"
pause
