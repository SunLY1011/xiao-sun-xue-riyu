# 正式上线：发布到 Netlify（需本机已 netlify login 一次）
# 无 CLI 时请用：打开Netlify拖拽部署.bat
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Site = "qingjing-biaori"
$Origin = "https://$Site.netlify.app"
$ver = "28"
if (Test-Path "$Root\index.html") {
  $m = [regex]::Match((Get-Content "$Root\index.html" -Raw), '\?v=(\d+)')
  if ($m.Success) { $ver = $m.Groups[1].Value }
}
$LearnUrl = "$Origin/index.html?v=$ver"

Write-Host ""
Write-Host "=== 标日课后巩固 · Netlify 正式发布 ===" -ForegroundColor Cyan
Write-Host "目标: $LearnUrl"
Write-Host ""

function Test-Live {
  try {
    $r = Invoke-WebRequest -Uri $LearnUrl -UseBasicParsing -TimeoutSec 12
    return $r.StatusCode -eq 200
  } catch { return $false }
}

if (Test-Live) {
  Write-Host "线上已是 200，可跳过部署。" -ForegroundColor Green
  exit 0
}

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Host "未找到 npx → 请拖拽部署" -ForegroundColor Yellow
  Start-Process "https://app.netlify.com/drop"
  exit 1
}

Write-Host "Netlify CLI 发布中（需已 netlify login）..."
$log = Join-Path $env:TEMP "netlify-deploy.log"
& npx --yes netlify-cli deploy --prod --dir . --site $Site 2>&1 | Tee-Object -FilePath $log
if ($LASTEXITCODE -ne 0) {
  Write-Host "CLI 失败。请拖拽整个文件夹到 Netlify，站点名: $Site" -ForegroundColor Yellow
  Start-Process "https://app.netlify.com/drop"
  exit 1
}

Start-Sleep -Seconds 3
if (Test-Live) {
  Write-Host "部署成功。请手机 4G 验收: $LearnUrl" -ForegroundColor Green
  exit 0
}

Write-Host "部署命令已执行，但 $LearnUrl 仍不可访问（404）。" -ForegroundColor Yellow
Write-Host "请确认 Netlify 站点名为 $Site，或改 js/public-url.config.js 为实际域名后再发布。"
Start-Process "https://app.netlify.com/drop"
exit 1
