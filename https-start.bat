@echo off
chcp 65001 >nul
title HTTPS Server for XiaoWangXueRiyu PWA
cd /d "%~dp0"

echo ================================================
echo    HTTPS 开发服务器 · 启动中...
echo ================================================
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Python！
    echo 请先安装 Python 3.x，访问: https://www.python.org/downloads/
    echo 安装时勾选 "Add Python to PATH"
    pause
    exit /b 1
)

echo [信息] Python 已检测到，正在启动 HTTPS 服务器（端口 8443）...
echo.

python https-server.py 8443

echo.
echo [完成] 服务器已停止。
pause