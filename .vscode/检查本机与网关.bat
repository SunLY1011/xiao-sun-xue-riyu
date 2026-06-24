@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 本机与网关检查

echo.
echo  Check 8765 + Clash/proxy + GitHub
echo  Auto-fix: run with argument  fix
echo.

if /i "%~1"=="fix" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\win-health-check.ps1" -FixLocal -FixGateway -FixGit
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\win-health-check.ps1"
)

echo.
pause
exit /b %ERRORLEVEL%
