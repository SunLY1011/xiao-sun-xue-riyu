@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === 用户问题验收（执行清单） ===
echo  清单: docs\执行清单-用户问题与验收.md
echo.
call 重启本地服务.bat
timeout /t 2 /nobreak >nul
call 发布前自检.bat
echo.
echo  请按清单第三节手测: 我的笔记 / 五十音 / 第1课会話喇叭
echo.
pause
