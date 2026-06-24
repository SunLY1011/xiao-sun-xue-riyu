@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ==========================================
echo    标日课后巩固 · 微信小程序（正式形态）
echo  ==========================================
echo.
echo  同学以后：在微信里点「小程序」就能学，
echo  不用复制链接，不用同一 WiFi。
echo.
echo  你要做的（只需做一次）：
echo    1. 看说明：docs\微信小程序-发布一次.md
echo    2. 用「微信开发者工具」打开文件夹：
echo       %~dp0japanese_learning_miniapp
echo    3. 填你的小程序 AppID，点「预览」用手机试
echo    4. 点「上传」并在 mp.weixin.qq.com 提交审核
echo.

set "DEVTOOLS=%LOCALAPPDATA%\微信开发者工具\微信开发者工具.exe"
if exist "%DEVTOOLS%" (
  echo  正在打开微信开发者工具...
  start "" "%DEVTOOLS%" "%~dp0japanese_learning_miniapp"
) else (
  echo  未检测到微信开发者工具，请先安装：
  echo  https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
  start "" "https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
)

start "" notepad "%~dp0docs\微信小程序-发布一次.md"
explorer "%~dp0japanese_learning_miniapp"
pause
