@echo off
chcp 65001 >nul
set "TARGET=%~dp0发布包"
set "LINK=d:\jp-study"

echo 正在创建纯英文快捷路径（解决 Cursor 打不开文件夹的问题）...
echo 目标: %TARGET%
echo 链接: %LINK%

if exist "%LINK%" (
  echo 已存在 %LINK% ，跳过创建。
) else (
  mklink /J "%LINK%" "%TARGET%"
  if errorlevel 1 (
    echo.
    echo 创建失败：请右键「以管理员身份运行」本 bat 后重试。
    pause
    exit /b 1
  )
  echo 创建成功。
)

echo.
echo 以后在 Cursor 里请打开这个文件夹：
echo   %LINK%
echo.
echo 或双击：%LINK%\index.html
pause
