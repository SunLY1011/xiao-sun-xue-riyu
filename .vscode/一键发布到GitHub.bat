@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
set REPO=XiaoWangXueRiyu
set PATH=%PATH%;%ProgramFiles%\GitHub CLI\

echo.
echo  === 标日课后巩固 - 发布到 GitHub Pages ===
echo  仓库名（固定）: %REPO%
echo.

gh auth status >nul 2>&1
if errorlevel 1 (
  echo [1/5] 请先登录 GitHub...
  echo  浏览器打开 https://github.com/login/device
  echo  输入终端里显示的一次性验证码
  echo.
  gh auth login -h github.com -p https -w
  if errorlevel 1 (
    echo 登录失败。请检查网络后重试，或换手机热点。
    pause
    exit /b 1
  )
)

echo [2/5] 创建仓库 %REPO% ...
gh repo view %REPO% >nul 2>&1
if errorlevel 1 (
  gh repo create %REPO% --public --source=. --remote=origin --description "标日第14/16/18课课后巩固" --push
) else (
  echo  仓库已存在，仅推送更新...
  git remote remove origin 2>nul
  for /f "delims=" %%o in ('gh api user -q .login 2^>nul') do set OWNER=%%o
  git remote add origin https://github.com/!OWNER!/%REPO%.git
  git branch -M main 2>nul
  git push -u origin main
)

echo [3/5] 启用 GitHub Pages（Actions 部署）...
for /f "delims=" %%o in ('gh api user -q .login 2^>nul') do set OWNER=%%o
gh api repos/%OWNER%/%REPO%/pages -X POST -f build_type=workflow 2>nul

echo [4/5] 等待 Pages 工作流（请在 GitHub Actions 查看进度）...

echo.
echo [5/5] 你的链接（部署成功后约 1～3 分钟）：
echo.
echo  学习主页:
echo  https://%OWNER%.github.io/%REPO%/index.html
echo.
echo  分享页:
echo  https://%OWNER%.github.io/%REPO%/share.html
echo.
echo  仓库:
echo  https://github.com/%OWNER%/%REPO%
echo.
gh repo view %REPO% --web 2>nul
pause
