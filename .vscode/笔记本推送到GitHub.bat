@echo off

setlocal EnableDelayedExpansion

chcp 65001 >nul

cd /d "%~dp0"

title 笔记本推送到 GitHub（不用手机 App）



set "REPO=XiaoWangXueRiyu"

set "PATH=%PATH%;%ProgramFiles%\GitHub CLI\"



echo.

echo  ==========================================

echo    笔记本发布到 GitHub（无需手机 GitHub App）

echo  ==========================================

echo.



echo [1/4] 检测能否连接 github.com ...

powershell -NoProfile -Command "$ok=$false; try { $t=New-Object Net.Sockets.TcpClient; $t.Connect('github.com',443); $ok=$t.Connected; $t.Close() } catch {}; if($ok){'   可以连接 GitHub，继续推送。'} else {'   无法连接 GitHub（443）。请先开 VPN/代理，或改用「笔记本发布到Gitee.bat」。'}"



echo.

echo [2/4] 在「笔记本浏览器」登录 GitHub（不是手机 App）...

gh auth status >nul 2>&1

if errorlevel 1 (

  echo.

  echo   将打开：https://github.com/login/device

  echo   请在本机 Edge/Chrome 输入下面出现的一次性验证码。

  echo.

  gh auth login -h github.com -p https -w

  if errorlevel 1 (

    echo.

    echo   登录失败。请开 VPN 后重试，或阅读：笔记本连接GitHub-必读.txt

    pause

    exit /b 1

  )

) else (

  echo   已登录 GitHub CLI。

)



echo.

echo [3/4] 尝试使用本机代理（若你已开 Clash/V2Ray）...

rem 优先：系统代理端口（当前 clash-win64 常为 61905，7890 可能只监听不可用）
for /f "usebackq delims=" %%G in (`powershell -NoProfile -Command "$i=Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'; if($i.ProxyEnable -and $i.ProxyServer -match ':(\d+)'){ $matches[1] }"`) do set "SYSPROXY=%%G"

if defined SYSPROXY (
  powershell -NoProfile -Command "try{$z=(curl.exe -sS -m 8 -x 'http://127.0.0.1:%SYSPROXY%' https://api.github.com/zen 2>&1); if($LASTEXITCODE -eq 0){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
  if not errorlevel 1 (
    echo   系统代理端口 %SYSPROXY% 可访问 GitHub，已为 git 设置
    git config --global http.https://github.com.proxy http://127.0.0.1:%SYSPROXY%
    goto :push
  )
)

for %%P in 61905 61903 7890 7897 10808 10809 1080 do (

  powershell -NoProfile -Command "try{$z=(curl.exe -sS -m 8 -x 'http://127.0.0.1:%%P' https://api.github.com/zen 2>&1); if($LASTEXITCODE -eq 0){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1

  if not errorlevel 1 (

    echo   检测到可用代理端口 %%P，已为 git 设置 http://127.0.0.1:%%P

    git config --global http.https://github.com.proxy http://127.0.0.1:%%P

    goto :push

  )

)

echo   未检测到本地代理端口，直接推送（需网络能访问 GitHub）...



:push

echo.

echo [4/4] git push ...

git add -A

git status -sb

git commit -m "update: content publish from laptop" 2>nul

git push -u origin main

if errorlevel 1 (

  echo.

  echo   推送失败。可选：

  echo   1^) 开 VPN 后重新双击本 bat

  echo   2^) 双击「GitHub网页上传-不用Git命令.bat」

  echo   3^) 双击「笔记本发布到Gitee.bat」（国内网络通常可用）

  pause

  exit /b 1

)



echo.

echo   推送成功。约 1～3 分钟后 GitHub Pages 自动更新。

echo   学员链接：

echo   https://saivenwang-byte.github.io/%REPO%/index.html?v=29

echo.

pause

