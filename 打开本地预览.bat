@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 情景日语 - 本地预览

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
if not defined VER set "VER=39"

set "URL=http://127.0.0.1:8765/index.html?v=%VER%"

echo.
echo  本地学习页（请用此链接，不要用 GitHub 公网链接在本机打开）
echo  %URL%
echo.
echo  若浏览器打不开：等 2 秒后重试，或看任务栏「日语学习-本地服务」
echo  不要直接双击 index.html（会自动跳转，但需先启动下面服务）
echo.

python scripts\start-local-server.py --probe >nul 2>&1
if errorlevel 1 (
  echo  本地服务未就绪，正在启动 8765 （改码即刷）...
  python scripts\start-local-server.py --start
  timeout /t 3 /nobreak >nul
  python scripts\start-local-server.py --probe >nul 2>&1
  if errorlevel 1 (
    echo.
    echo  [提示] 仍无法访问时请双击「重启本地服务.bat」后再运行本 bat
    echo.
  )
) else (
  echo  本地服务正常
)

python scripts\open-preview-url.py "%URL%"
echo.
echo  已打开浏览器（Edge/Chrome）。Cursor 里也可复制上面链接预览。
echo.
echo  [双通道] 小程序真机框 390x844: 打开双通道预览.bat 或 打开小程序Cursor预览.bat
echo  规范: docs\双通道验收-浏览器与手机真机框.md
call "%~dp0scripts\echo-dual-channel-reminder.bat"
pause
