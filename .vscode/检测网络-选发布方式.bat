@echo off

chcp 65001 >nul

cd /d "%~dp0"

title 检测网络 · 选发布方式



echo.

echo  正在检测本机网络（约 10 秒）...

echo.



set GH=0

set GT=0



powershell -NoProfile -Command "try{$t=New-Object Net.Sockets.TcpClient;$t.Connect('github.com',443);if($t.Connected){$t.Close();exit 0}}catch{};exit 1"

if not errorlevel 1 set GH=1



powershell -NoProfile -Command "try{$t=New-Object Net.Sockets.TcpClient;$t.Connect('gitee.com',443);if($t.Connected){$t.Close();exit 0}}catch{};exit 1"

if not errorlevel 1 set GT=1



if "%GH%"=="1" (

  echo  [OK] github.com 可连接 → 将打开「笔记本推送到GitHub.bat」

  call "%~dp0笔记本推送到GitHub.bat"

  exit /b 0

)



if "%GT%"=="1" (

  echo  [!!] github.com 连不上，但 gitee.com 可以。

  echo.

  echo  建议：

  echo    · 学员链接暂时继续用（已上线的 GitHub Pages）：

  echo      https://saivenwang-byte.github.io/XiaoWangXueRiyu/index.html?v=29

  echo    · 你要更新内容：双击「笔记本发布到Gitee.bat」

  echo    · 或开 VPN 后再用 GitHub 推送

  echo.

  choice /C YN /M "是否现在打开发布到 Gitee"

  if errorlevel 2 goto :end

  call "%~dp0笔记本发布到Gitee.bat"

  goto :end

)



echo  github 与 gitee 都连不上，请检查网络或换手机热点后重试。

notepad "%~dp0笔记本连接GitHub-必读.txt"



:end

pause

