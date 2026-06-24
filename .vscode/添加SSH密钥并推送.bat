@echo off

chcp 65001 >nul

cd /d "%~dp0"

title 添加 SSH 密钥并推送到 GitHub



set "PUB=%USERPROFILE%\.ssh\id_ed25519_github.pub"

set "LINK=https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=29"



echo.

echo  ==========================================

echo    一次设置 · 以后推送不用 VPN 也能连 GitHub

echo  ==========================================

echo.

echo  [1/3] 你的公钥（将复制到剪贴板）：

type "%PUB%"

echo.

type "%PUB%"| clip

echo   已复制到剪贴板。

echo.

echo  [2/3] 在「笔记本浏览器」打开 GitHub 添加 SSH 密钥...

echo   Title 填：xiaowang-laptop

echo   Key 粘贴（Ctrl+V）后点 Add SSH key

echo.

start "" "https://github.com/settings/ssh/new"

notepad "%~dp0你的SSH公钥-粘贴到GitHub.txt"

echo.

pause

echo.

echo  [3/3] 正在通过 SSH 推送（走 443 端口，国内更稳）...

git remote set-url origin git@github.com:saivenwang-byte/XiaoWangXueRiyu.git

git push -u origin main

if errorlevel 1 (

  echo.

  echo   推送失败：请确认已在网页上保存 SSH 公钥，然后重新双击本 bat。

  pause

  exit /b 1

)

echo.

echo   推送成功。约 1～3 分钟后网页自动更新。

echo   学员链接：%LINK%

echo.

pause

