@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo  已切换为「正式上线」流程，正在启动...
call "%~dp0正式发布.bat"
