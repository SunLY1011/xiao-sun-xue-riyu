@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 已发布 · 复制链接发微信

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
if not defined VER set "VER=44"
set "LINK=https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2/index.html?v=%VER%"

echo.
echo   ==========================================
echo     已经帮你发布到公网（不用你再操作）
echo   ==========================================
echo.
echo   发给任何人的学习链接（复制下面整行到微信）：
echo.
echo   %LINK%
echo.
echo %LINK%| clip
echo   链接已复制到剪贴板，打开微信 Ctrl+V 粘贴即可。
echo.

start "" "%LINK%"
start "" "%LINK:/index.html=/share.html%"

echo   正在检测网页是否可打开...
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -Uri '%LINK%' -UseBasicParsing -TimeoutSec 15; if($r.StatusCode -eq 200){'   检测通过：公网可以打开。'} else {'   状态码：'+$r.StatusCode} } catch { '   暂时打不开，请稍后再试或检查网络。' }"

echo.
echo   手机验收：关掉 WiFi，用 4G 点微信里的链接。
echo.
pause
