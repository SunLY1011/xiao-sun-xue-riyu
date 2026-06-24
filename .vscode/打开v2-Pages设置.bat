@echo off
chcp 65001 >nul
cd /d "%~dp0"
title v2 公网开通

echo.
echo  ==========================================
echo    v2 公网 404 / Deployments 红叉
echo  ==========================================
echo.
echo  你若在 Deployments 看到 github-pages 失败：
echo    多半是因为 Pages 来源 = GitHub Actions，
echo    但之前 workflow 只推了 gh-pages 分支（已对）。
echo.
echo  请二选一（推荐 A）：
echo.
echo  [A] 从分支发布（最简单）
echo      Settings - Pages
echo      Source: Deploy from a branch
echo      Branch: gh-pages  或 main
echo      Folder: / (root)  - Save
echo.
echo  [B] 继续用 GitHub Actions
echo      Settings - Pages - Source: GitHub Actions
echo      选中 workflow: Deploy GitHub Pages
echo      Actions - General - Workflow permissions: Read and write
echo      等 Actions 最新一条变绿
echo.
echo  学员链接：
echo  https://saivenwang-byte.github.io/XiaoWangXueRiyu-v2/index.html?v=314
echo.

start "" "https://github.com/saivenwang-byte/XiaoWangXueRiyu-v2/settings/pages"
start "" "https://github.com/saivenwang-byte/XiaoWangXueRiyu-v2/actions/workflows/pages.yml"
pause
