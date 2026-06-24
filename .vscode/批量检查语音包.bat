@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === TTS 语音包编号对账 ===
python scripts\audit-tts-registry.py --write
if errorlevel 1 (
  echo.
  echo 有缺失。请运行: 生成语音包.bat
  pause
  exit /b 1
)
echo.
echo 通过。清单: docs\tts-registry.json
pause
