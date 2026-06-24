@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 标日课后巩固 · 正式发布（Netlify）

set "ORIGIN=https://qingjing-biaori.netlify.app"
set "LEARN=%ORIGIN%/index.html?v=29"
set "SHARE=%ORIGIN%/share.html"

echo.
echo  ============================================
echo    正式上线模式 · 对外只发 Netlify 链接
echo    （不依赖同一 WiFi，类小程序发链接）
echo  ============================================
echo.
echo  [正式学习链接 — 复制发微信]
echo    %LEARN%
echo.
echo  [分享说明页]
echo    %SHARE%
echo.
echo  [作者本机调试 ONLY]
echo    http://localhost:8765/index.html?v=28
echo.

echo  步骤 1/3  校验语音包...
python scripts\verify-tts-cache.py
if errorlevel 1 (
  echo  校验未通过，正在补全...
  python scripts\build-tts-cache.py
  python scripts\verify-tts-cache.py
)

echo.
echo  步骤 2/3  发布 Netlify...
echo  若已 netlify login 过，将尝试 CLI；否则请按提示拖拽文件夹。
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-netlify.ps1"
echo.

echo  步骤 3/3  启动本机预览（仅开发）...
netstat -an | findstr ":8765.*LISTENING" >nul || start "日语学习-8765" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"

echo %LEARN%| clip
echo  正式链接已复制到剪贴板。
echo.
echo  验收：手机关闭 WiFi，用 4G 打开上面 Netlify 链接。
echo.
start "" "%LEARN%"
pause
