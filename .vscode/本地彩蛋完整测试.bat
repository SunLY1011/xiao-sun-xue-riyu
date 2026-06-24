@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 本地彩蛋完整测试 v93

echo.
echo ========================================
echo   本地完整测试 · 三级彩蛋 + 发布自检
echo   须使用 http://127.0.0.1:8765 （勿 file://）
echo ========================================
echo.

python scripts\start-local-server.py --probe >nul 2>&1
if errorlevel 1 (
  echo [启动] 正在打开 8765 本地服务...
  start "日语学习-8765" /min cmd /c "cd /d "%~dp0" && python -m http.server 8765"
  timeout /t 2 /nobreak >nul
)

echo [1/3] 发布前自检...
python scripts\pre-ship-check.py
if errorlevel 1 (
  echo.
  echo 自检未通过，请先修复后再测彩蛋。
  pause
  exit /b 1
)

echo.
echo [2/3] 彩蛋资源冒烟（HTTP + 24格）...
python scripts\local-story-egg-smoke.py
if errorlevel 1 (
  echo.
  echo 资源检查失败。
  pause
  exit /b 1
)

for /f "tokens=2 delims==" %%v in ('findstr /C:"CACHE_VER" js\share-wechat.js') do set VER=%%~v
set VER=%VER:"=%

echo.
echo [3/3] 打开浏览器验收页...
start "" "http://127.0.0.1:8765/story-egg-preview.html"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/index.html?v=%VER%&egg=ultimate"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/index.html?v=%VER%&egg=unit&unitId=1"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/index.html?v=%VER%&storyEggLesson=14"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/story-unit-phone-real.html?v=%VER%&tier=l2&unit=1"

echo.
echo 自动化已通过。请在浏览器中目视确认：
echo   - L3 第5行第1格 熊本城 树精主人公
echo   - L2 单元1 竖条四格 + 日文叠字
echo   - L1 第14课 要点日主中辅 + 会話喇叭
echo.
echo 首页开发条：U1「预览」可测 L2 条带弹层。
pause
