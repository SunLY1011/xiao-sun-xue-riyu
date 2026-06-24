@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 同步作者链接 ?v=

python scripts\sync-cache-ver-hints.py
if errorlevel 1 pause & exit /b 1

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
echo.
echo  当前 cache v=%VER%
echo  https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=%VER%
echo.
pause
