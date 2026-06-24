@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === 24课 MVP 对照 L14 金标审计 ===
python scripts\audit-curriculum-mvp.py
echo.
echo 详见 docs\课程MVP全课审计与验收路径.md
echo JSON: docs\curriculum-mvp-audit.json
pause
