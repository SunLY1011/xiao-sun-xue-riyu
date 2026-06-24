@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ========================================
echo    生成日语嵌入语音包 (edge-tts MP3)
echo    输出: tts-cache\ 与 发布包\tts-cache\
echo  ========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 Python，请先安装 Python 3
  pause
  exit /b 1
)

pip show edge-tts >nul 2>&1
if errorlevel 1 (
  echo 正在安装 edge-tts ...
  pip install edge-tts
)

python "scripts\build-tts-cache.py"
if errorlevel 1 (
  echo [失败] 语音包生成出错
  pause
  exit /b 1
)

echo.
echo 完成！请刷新 http://127.0.0.1:8766/index.html?v=6 测试 🔊
pause
