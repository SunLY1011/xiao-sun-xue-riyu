@echo off

chcp 65001 >nul

cd /d "%~dp0"

echo.

echo  发微信请用：「手机微信版」文件夹

echo  上传 index.html + manifest.json 到 Gitee Pages

echo  再把 https 链接发给朋友（不要发文件）

echo.

explorer "%~dp0手机微信版"

pause

