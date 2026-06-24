@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 复制国内链接 · 腾讯云 COS（B）

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
if not defined VER set "VER=384"

for /f "usebackq tokens=2 delims=^"" %%o in (`findstr /C:"HYOUGA_PUBLIC_ORIGIN" "js\public-url.config.js"`) do set "ORIGIN=%%o"
if not defined ORIGIN (
  echo [FAIL] 无法读取 js\public-url.config.js
  pause
  exit /b 1
)
echo %ORIGIN% | findstr /i "github.io jsdelivr gitee.io" >nul
if not errorlevel 1 (
  echo.
  echo   当前仍是 GitHub/Gitee 域。备案通过后请运行：
  echo   python scripts\apply-deploy-target.py --channel cos --cos-domain https://learn.你的域名.com
  echo   python scripts\upload-cos.py
  echo.
  pause
  exit /b 1
)

set "LINK=%ORIGIN%/index.html?v=%VER%"

echo.
echo   ==========================================
echo     国内学习链接（COS+CDN · 正式 B）
echo   ==========================================
echo.
echo   %LINK%
echo.
echo %LINK%| clip
echo   已复制到剪贴板。发版后请在 CDN 刷新 index.html 与 sw.js。
echo.
start "" "%LINK%"
pause
