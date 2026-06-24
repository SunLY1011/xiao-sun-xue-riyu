@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Cloudflare 公网隧道

echo.
echo  [1] 将先启动本地学习服务（端口 8765）
echo  [2] 再创建临时 HTTPS 公网链接（可发微信）
echo.
echo  若提示找不到 cloudflared，请先安装：
echo  https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
echo.

where cloudflared >nul 2>&1
if errorlevel 1 (
  echo  未检测到 cloudflared。建议使用「部署说明.txt」里的方案 A（Netlify 拖拽）更简单。
  echo.
  pause
  exit /b 1
)

start "标日本地服务" cmd /c "cd /d "%~dp0" && python -m http.server 8765"
timeout /t 2 /nobreak >nul

echo  正在创建公网链接，请稍候…
echo  下方出现 https://xxx.trycloudflare.com 后，复制到微信发送。
echo  学习页地址请加：/index.html
echo  按 Ctrl+C 停止隧道（关闭后链接失效）
echo.

cloudflared tunnel --url http://127.0.0.1:8765

pause
