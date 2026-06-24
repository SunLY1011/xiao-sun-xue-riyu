@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 手机同 WiFi 预览

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "_ip=%%a"
  goto :gotip
)
:gotip
set IP=%_ip: =%

echo.
echo  ========================================
echo   手机不要用 localhost（会打不开）
echo  ========================================
echo.
echo  笔记本浏览器：
echo    http://localhost:8765/index.html?v=27
echo.
echo  手机微信 / 手机浏览器（须与笔记本同一 WiFi）：
echo    http://%IP%:8765/index.html?v=27
echo.
echo  把上面「手机」那一行复制到微信文件传输助手，用手机点开。
echo.
echo  若手机仍打不开：
echo    1. 确认手机连的是家里 WiFi，不是纯 4G
echo    2. Windows 防火墙可能拦截 — 允许 Python 专用网络
echo    3. 正式发给学员请用 Netlify（见 打开Netlify拖拽部署.bat）
echo.

netstat -an | findstr ":8765.*LISTENING" >nul
if errorlevel 1 (
  echo  端口 8765 未启动，正在启动本地服务...
  start "日语学习-本地服务" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
  timeout /t 2 /nobreak >nul
) else (
  echo  本地服务已在运行（8765）
)

echo.
pause
