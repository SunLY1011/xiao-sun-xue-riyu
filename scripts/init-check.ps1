# 工作流阶段 3：初始化检查（Windows）
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "[init] 仓库根: $Root"

if (-not (Test-Path "AGENTS.md")) {
    Write-Host "[FAIL] 缺少 AGENTS.md"
    exit 1
}

if (-not (Test-Path "docs/iteration-baseline.json")) {
    Write-Host "[FAIL] 缺少 docs/iteration-baseline.json"
    exit 1
}

$preShip = Join-Path $Root "scripts/pre-ship-check.py"
if (Test-Path $preShip) {
    python $preShip
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FAIL] pre-ship-check 未通过"
        exit $LASTEXITCODE
    }
    Write-Host "[OK] pre-ship-check 通过"
    exit 0
}

$bat = Join-Path $Root "发布前自检.bat"
if (Test-Path $bat) {
    & cmd /c "`"$bat`""
    exit $LASTEXITCODE
}

Write-Host "[FAIL] 未找到 pre-ship-check.py 或 发布前自检.bat"
exit 1
