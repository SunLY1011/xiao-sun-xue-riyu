@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 手机同 WiFi · 满级测试卡

for /f "tokens=2 delims==" %%v in ('findstr /C:"CACHE_VER" js\share-wechat.js') do set VER=%%~v
set VER=%VER:"=%

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "_ip=%%a"
  goto :gotip
)
:gotip
set IP=%_ip: =%

netstat -an | findstr ":8765.*LISTENING" >nul
if errorlevel 1 (
  echo 正在启动本地服务 8765 ...
  start "日语学习-8765" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
  timeout /t 2 /nobreak >nul
) else (
  echo  本地服务已在运行（8765）
)

echo.
echo  ========================================
echo   满级测试卡 · 复制下面一行到微信
echo   （手机与笔记本须同一 WiFi）
echo  ========================================
echo.
echo  http://%IP%:8765/index.html?v=%VER%^^&testcard=1
echo.
echo  L3 直达：...^^&testcard=1^^&egg=ultimate
echo.
echo  说明：docs\测试卡-满级链接.md
echo.
pause
