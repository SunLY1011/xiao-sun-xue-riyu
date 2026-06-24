@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  ==========================================
echo    标日 あと学習 · 上传小程序代码
echo  ==========================================
echo.
echo  须先在 mp.weixin.qq.com 注册小程序并记下 AppID。
echo  修改：japanese_learning_miniapp\project.config.json 的 appid
echo.
echo  微信开发者工具内操作（无法在本 bat 内代你点「上传」）：
echo    1. 导入目录：%CD%\japanese_learning_miniapp
echo    2. 编译 → 真机预览自测 → 右下角「刷新」能加载 H5
echo    3. 菜单「上传」→ 版本号建议 1.0.3 · 备注 v300 散点+壳层
echo    4. 登录 mp.weixin.qq.com → 版本管理 → 选开发版/提交审核
echo.
echo  H5 内容来自 GitHub Pages，须先 push 主仓库（帮你发布好了.bat）。
echo.

set "DEVTOOLS=%LOCALAPPDATA%\微信开发者工具\微信开发者工具.exe"
if not exist "%DEVTOOLS%" set "DEVTOOLS=%ProgramFiles(x86)%\Tencent\微信web开发者工具\微信开发者工具.exe"
if exist "%DEVTOOLS%" (
  echo  正在打开微信开发者工具...
  start "" "%DEVTOOLS%" "%CD%\japanese_learning_miniapp"
) else (
  echo  未找到开发者工具，请安装：
  echo  https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
  start "" "https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html"
)

explorer "%CD%\japanese_learning_miniapp"
pause
