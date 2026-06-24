@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 修复 Netlify Site not found

echo.
echo  Site not found = 这个网址还没发布成功
echo.
echo  现在能用的链接（复制发微信）：
echo  https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=29
echo.
echo  https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=29| clip
echo  已复制到剪贴板。
echo.

start "" "https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=29"
start "" "https://app.netlify.com/"
explorer "%~dp0"
start "" notepad "%~dp0Site-not-found-看这里.txt"
pause
