@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "" notepad "%~dp0微信分享说明.txt"
start "" "%~dp0share.html"
echo 已打开「微信分享说明」和 share.html
timeout /t 3
