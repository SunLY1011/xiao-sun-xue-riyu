@echo off

chcp 65001 >nul

cd /d "%~dp0"

title GitHub 网页上传（笔记本浏览器）



echo.

echo  ==========================================

echo    不用 git 命令 · 用笔记本浏览器上传文件

echo  ==========================================

echo.

echo  适用：开了 VPN 能打开 github.com，但 git push 失败。

echo  不需要手机 GitHub App。

echo.

echo  步骤：

echo  1. 本机浏览器登录 github.com（Gmail 即可）

echo  2. 在网页里上传你改过的文件（见下方列表）

echo  3. 等 1～3 分钟，学员链接自动更新

echo.

echo  本次建议至少上传这些（链接分享相关）：

echo    share.html

echo    js\share-wechat.js

echo    js\public-url.config.js

echo    微信分享说明.txt

echo    怎么用.txt

echo.

echo  正在打开上传页面（若打不开请先开 VPN）...

echo.



start "" "https://github.com/saivenwang-byte/XiaoWangXueRiyu"

timeout /t 2 >nul

start "" "https://github.com/saivenwang-byte/XiaoWangXueRiyu/upload/main"



explorer "%~dp0"

notepad "%~dp0笔记本连接GitHub-必读.txt"

pause

