@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
title 笔记本推送到 GitHub v2（XiaoWangXueRiyu-v2）

set "REPO_V2=XiaoWangXueRiyu-v2"
set "PATH=%PATH%;%ProgramFiles%\GitHub CLI\"

echo.
echo  ==========================================
echo    推送到升级版仓库 %REPO_V2%
echo    旧仓 origin 不变，仅新增/更新 v2 远程
echo  ==========================================
echo.

git remote get-url v2 >nul 2>&1
if errorlevel 1 (
  echo [setup] 添加 remote v2 ...
  git remote add v2 git@github.com:saivenwang-byte/%REPO_V2%.git
) else (
  echo [ok] 已存在 remote: v2
)

echo.
echo [1/5] 检测 github.com ...
powershell -NoProfile -Command "$ok=$false; try { $t=New-Object Net.Sockets.TcpClient; $t.Connect('github.com',443); $ok=$t.Connected; $t.Close() } catch {}; if($ok){'   可以连接 GitHub。'} else {'   无法连接 GitHub（443）。请开 VPN 或见 docs\GitHub-v2仓库说明.md 网页建仓。'}"

echo.
echo [2/5] GitHub CLI 登录（可选，用于自动建仓）...
gh auth status >nul 2>&1
if errorlevel 1 (
  echo   未登录 gh。可跳过：先在网页创建空仓库 %REPO_V2% 再回来运行本脚本。
  echo   网页：https://github.com/new  名称 %REPO_V2%  公开  不要勾选 README
) else (
  echo   已登录 gh。
  gh repo view saivenwang-byte/%REPO_V2% >nul 2>&1
  if errorlevel 1 (
    echo.
    echo [3/5] 在 GitHub 上创建公开仓库 %REPO_V2% ...
    gh repo create saivenwang-byte/%REPO_V2% --public --description "标日あと学習 · 升级版（自 XiaoWangXueRiyu 分叉）"
    if errorlevel 1 (
      echo   自动创建失败。请浏览器手动建仓后重试本 bat。
    ) else (
      echo   仓库已创建。
    )
  ) else (
    echo [3/5] 远程仓库已存在，跳过创建。
  )
)

echo.
echo [4/5] 代理（与 origin 推送脚本相同）...
for /f "usebackq delims=" %%G in (`powershell -NoProfile -Command "$i=Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'; if($i.ProxyEnable -and $i.ProxyServer -match ':(\d+)'){ $matches[1] }"`) do set "SYSPROXY=%%G"
if defined SYSPROXY (
  powershell -NoProfile -Command "try{$z=(curl.exe -sS -m 8 -x 'http://127.0.0.1:%SYSPROXY%' https://api.github.com/zen 2>&1); if($LASTEXITCODE -eq 0){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
  if not errorlevel 1 (
    echo   使用系统代理 %SYSPROXY%
    git config --global http.https://github.com.proxy http://127.0.0.1:%SYSPROXY%
    goto :push
  )
)
for %%P in 61905 61903 7890 7897 10808 10809 1080 do (
  powershell -NoProfile -Command "try{$z=(curl.exe -sS -m 8 -x 'http://127.0.0.1:%%P' https://api.github.com/zen 2>&1); if($LASTEXITCODE -eq 0){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
  if not errorlevel 1 (
    echo   使用代理端口 %%P
    git config --global http.https://github.com.proxy http://127.0.0.1:%%P
    goto :push
  )
)

:push
echo.
echo [5/5] 提交并推送到 v2（不推 origin）...
git add -A
git status -sb
git commit -m "release: v2 upgrade line (cache and ABC dialogue UI)" 2>nul
git push -u v2 main
if errorlevel 1 (
  echo.
  echo   推送失败。常见原因：
  echo   1^) GitHub 上还没有空仓库 %REPO_V2% — 见 docs\GitHub-v2仓库说明.md
  echo   2^) 网络/VPN — 开代理后重试
  echo   3^) SSH 密钥未绑 GitHub 账号
  pause
  exit /b 1
)

echo.
echo   已推送到 v2。请在 GitHub 仓库 Settings - Pages 开启 main 分支发布。
echo   新学员链接（Pages 生效后）：
echo   https://saivenwang-byte.github.io/%REPO_V2%/index.html?v=313
echo.
echo   旧仓链接不变：
echo   https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=313
echo.
pause
