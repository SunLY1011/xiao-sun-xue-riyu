@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 满级测试卡

for /f "tokens=2 delims==" %%v in ('findstr /C:"CACHE_VER" js\share-wechat.js') do set VER=%%~v
set VER=%VER:"=%

netstat -an | findstr ":8765.*LISTENING" >nul
if errorlevel 1 (
  echo 正在启动本地服务 8765 ...
  start "日语学习-8765" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
  timeout /t 2 /nobreak >nul
)

set "URL=http://127.0.0.1:8765/index.html?v=%VER%&testcard=1"
echo.
echo  满级测试卡（24课四金 + 六单元条带 + L3）
echo  %URL%
echo.
echo  说明：docs\测试卡-满级链接.md
echo.

python scripts\local-story-egg-smoke.py
if errorlevel 1 (
  echo 资源检查未通过，仍打开浏览器供人工查看。
)

start "" "%URL%"
pause
