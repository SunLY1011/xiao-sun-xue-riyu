@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 可选：改用 Netlify 域名

echo.
echo  【说明】正式版已经发布，一般不用再做这一步。
echo.
echo  当前发给学员请用：
echo  https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=29
echo  （双击「帮你发布好了.bat」可复制）
echo.
echo  只有当你坚持要用 qingjing-biaori.netlify.app 时，才做下面操作：
echo  1. 下面会打开两个窗口：文件夹 + Netlify 网页
echo  2. 用鼠标把「日语学习」文件夹拖进网页中间虚线框
echo  3. 登录 Netlify（可用 GitHub 邮箱注册）
echo  4. 站点名填：qingjing-biaori
echo  5. 成功后改 js\public-url.config.js 里的地址，再拖一次
echo.
pause

explorer "%~dp0"
start "" "https://app.netlify.com/drop"
