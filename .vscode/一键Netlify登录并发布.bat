@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Netlify 登录并发布

set "ORIGIN=https://qingjing-biaori.netlify.app"
set "LINK=%ORIGIN%/index.html?v=29"

echo.
echo  ==========================================
echo   Netlify 发布（需在本窗口完成一次登录）
echo  ==========================================
echo.
echo  若浏览器弹出：请用你已登录的 Gmail 点「Authorize」
echo  授权完成后回到本黑窗口等待，不要关。
echo.

where npx >nul 2>&1
if errorlevel 1 (
  echo 未找到 Node.js，请先安装 https://nodejs.org/
  pause
  exit /b 1
)

echo [1/3] 连接 Netlify 账号（仅第一次）...
call npx --yes netlify-cli login
if errorlevel 1 (
  echo 登录未完成。请重试或到 Netlify 网站：Site settings 里复制 Personal access token。
  pause
  exit /b 1
)

echo.
echo [2/3] 发布整个「日语学习」文件夹到 qingjing-biaori ...
call npx --yes netlify-cli link --name qingjing-biaori 2>nul
call npx --yes netlify-cli deploy --prod --dir . --site qingjing-biaori
if errorlevel 1 (
  echo.
  echo 若提示站点不存在，将自动创建或请先在网页拖入一次文件夹：
  start "" "https://app.netlify.com/drop"
  explorer "%~dp0"
  pause
  exit /b 1
)

echo.
echo [3/3] 更新配置并检测...
powershell -NoProfile -Command "(Get-Content 'js\public-url.config.js' -Raw) -replace 'HYOUGA_PUBLIC_ORIGIN = \"[^\"]*\"', 'HYOUGA_PUBLIC_ORIGIN = \"%ORIGIN%\"' | Set-Content 'js\public-url.config.js' -Encoding UTF8"

echo %LINK%| clip
echo.
echo  发布完成。正式链接（已复制）：
echo  %LINK%
echo.
start "" "%LINK%"
pause
