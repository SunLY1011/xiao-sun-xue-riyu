@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
title 笔记本发布到 Gitee（国内过渡 A）

set "REPO=xiao-wang-xue-riyu-v2"

echo.
echo  ==========================================
echo    发布到 Gitee（整站含 tts-cache）
echo  ==========================================
echo.

echo [1/6] 发布前自检 ...
python scripts\pre-ship-check.py
if errorlevel 1 (
  echo.
  echo   自检未通过，请先修复再发布。
  pause
  exit /b 1
)

echo.
echo [2/6] 检测 gitee.com ...
powershell -NoProfile -Command "try{$t=New-Object Net.Sockets.TcpClient;$t.Connect('gitee.com',443);if($t.Connected){$t.Close();'   Gitee 可连接。'}else{'   失败'}}catch{'   失败'}"

echo.
echo [3/6] Gitee 仓库（一次性）：
echo   · https://gitee.com 注册/登录
echo   · 新建公开仓库：%REPO%（勿勾选 README 初始化）
echo.
set /p GITEE_USER=请输入 Gitee 用户名:
if "!GITEE_USER!"=="" (
  echo 已取消。
  pause
  exit /b 1
)

set "GITEE_URL=https://gitee.com/!GITEE_USER!/%REPO%.git"
echo   远程：!GITEE_URL!

git remote remove gitee 2>nul
git remote add gitee "!GITEE_URL!"

echo.
echo [4/6] 推送 main 到 Gitee ...
echo   （若未 commit，请先自行 git add / commit；本脚本不自动提交）
git push -u gitee main
if errorlevel 1 (
  echo.
  echo   推送失败。请检查仓库是否已创建、令牌/SSH 是否配置。
  start "" "https://gitee.com/!GITEE_USER!/%REPO%"
  pause
  exit /b 1
)

echo.
echo [5/6] 写入国内正式域（语音同源，不用 jsDelivr）...
python scripts\apply-deploy-target.py --channel gitee --gitee-user !GITEE_USER!
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
echo   配置已改，请再推送一次使 Gitee Pages 生效：
git push gitee main

echo.
echo [6/6] 开启 Gitee Pages：
echo   仓库 → 服务 → Gitee Pages → 启动（分支 main）
start "" "https://gitee.com/!GITEE_USER!/%REPO%"
start "" "https://gitee.com/!GITEE_USER!/%REPO%/settings#pages"

echo.
echo   Pages 生效后双击：帮你发布-Gitee国内.bat
echo   手册：docs\国内发行-A-Gitee过渡-B-COS正式.md
echo.
pause
