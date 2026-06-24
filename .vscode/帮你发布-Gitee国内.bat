@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 复制国内链接 · Gitee Pages（A）

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
if not defined VER set "VER=384"

for /f "usebackq tokens=2 delims=^"" %%o in (`findstr /C:"HYOUGA_PUBLIC_ORIGIN" "js\public-url.config.js"`) do set "ORIGIN=%%o"
if not defined ORIGIN (
  echo [FAIL] 无法读取 js\public-url.config.js
  pause
  exit /b 1
)
echo %ORIGIN% | findstr /i "gitee.io" >nul
if errorlevel 1 (
  echo.
  echo   当前正式域不是 Gitee。请先运行：
  echo   python scripts\apply-deploy-target.py --channel gitee --gitee-user 你的用户名
  echo.
  pause
  exit /b 1
)

set "LINK=%ORIGIN%/index.html?v=%VER%"

echo.
echo   ==========================================
echo     国内学习链接（Gitee Pages · 过渡 A）
echo   ==========================================
echo.
echo   %LINK%
echo.
echo %LINK%| clip
echo   已复制到剪贴板，可粘贴到微信。
echo.
start "" "%LINK%"
pause
