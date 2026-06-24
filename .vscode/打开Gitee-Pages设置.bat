@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Gitee Pages 开通 · 国内微信链接

for /f "usebackq tokens=2 delims==" %%v in (`findstr /C:"CACHE_VER" "js\share-wechat.js"`) do set "VER=%%~v"
set "VER=%VER:"=%"
if not defined VER set "VER=385"

echo.
echo  ==========================================
echo    Gitee Pages 开通（国内微信 · 过渡 A）
echo  ==========================================
echo.
echo  [诊断] 代码已推送到 Gitee，但 Pages 尚未启动（has_page=false）。
echo  公网 404 时，须仓库持有者登录后点一次「启动」。
echo.
echo  [请你做 1 次 · 约 1 分钟]
echo.
echo   1. 浏览器登录 https://gitee.com
echo   2. 打开仓库（已自动打开，注意用户名是 saiven 不是 saiwen）：
echo      https://gitee.com/saivenwang-byte/xiao-wang-xue-riyu-v2
echo   3. 仓库页 → 服务 → Gitee Pages
echo      （或：设置 → 左侧 Gitee Pages；勿手输 …/pages 会 404）
echo   4. 分支 main，目录 / → 启动
echo   5. 等 1～3 分钟，再双击：帮你发布-Gitee国内.bat
echo.
echo  [Pages 生效后的学员链接]
echo   https://saivenwang-byte.gitee.io/xiao-wang-xue-riyu-v2/index.html?v=%VER%
echo.
echo  详细说明：gitee-Pages-开通说明.txt
echo  机器检查：python scripts/gitee-pages-status.py
echo.

start "" "https://gitee.com/login"
start "" "https://gitee.com/saivenwang-byte/xiao-wang-xue-riyu-v2"
start "" "https://gitee.com/saivenwang-byte/xiao-wang-xue-riyu-v2/settings#pages"

pause
