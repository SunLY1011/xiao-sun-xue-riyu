# Windows local preview (8765) + proxy gateway check
# Usage: powershell -ExecutionPolicy Bypass -File scripts\win-health-check.ps1
#        add -FixLocal  or  -FixGateway

param(
    [switch]$FixLocal,
    [switch]$FixGateway,
    [switch]$FixGit
)

$ErrorActionPreference = 'Continue'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$fail = 0

function Write-Status([string]$level, [string]$msg) {
    $c = switch ($level) { 'OK' { 'Green' } 'WARN' { 'Yellow' } 'FAIL' { 'Red' } default { 'Cyan' } }
    Write-Host "[$level] $msg" -ForegroundColor $c
}

Write-Host ''
Write-Host '======== Local H5 server (8765) ========'

$probe = & python (Join-Path $Root 'scripts\start-local-server.py') --probe 2>&1
$probe | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) {
    $fail++
    if ($FixLocal) {
        Write-Status 'INFO' 'Starting local-preview-server --watch ...'
        Start-Process -FilePath 'python' -ArgumentList @(
            (Join-Path $Root 'scripts\local-preview-server.py'), '--watch'
        ) -WorkingDirectory $Root -WindowStyle Minimized
        Start-Sleep -Seconds 3
        & python (Join-Path $Root 'scripts\start-local-server.py') --probe
        if ($LASTEXITCODE -ne 0) { $fail++ }
    } else {
        Write-Status 'INFO' 'Fix: run restart-local-server bat or -FixLocal'
    }
}

Write-Host ''
Write-Host '======== System proxy / gateway ========'

$inet = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
$proxyOn = [bool]$inet.ProxyEnable
$proxySrv = [string]$inet.ProxyServer
$proxyLabel = if ($proxyOn) { 'ON' } else { 'OFF' }
Write-Status 'INFO' "System proxy: $proxyLabel $proxySrv"

$ports = [System.Collections.Generic.List[int]]::new()
if ($proxySrv -match ':(\d+)\s*$') { [void]$ports.Add([int]$Matches[1]) }
foreach ($p in @(61905, 61903, 7890, 7891, 7897, 10808, 10809, 56599)) {
    if (-not $ports.Contains($p)) { [void]$ports.Add($p) }
}

$clashProc = Get-Process -Name 'clash-win64', 'Clash for Windows', 'clash' -ErrorAction SilentlyContinue
if ($clashProc) {
    Write-Status 'OK' ('Clash process: ' + ($clashProc.Name -join ', '))
} else {
    Write-Status 'WARN' 'No Clash process (skip if using other VPN)'
}

$sysPort = $null
if ($proxySrv -match ':(\d+)\s*$') { $sysPort = [int]$Matches[1] }

$goodPort = $null
$sysPortOk = $false
foreach ($p in $ports) {
    $listen = $false
    try {
        $t = New-Object Net.Sockets.TcpClient
        $t.Connect('127.0.0.1', $p)
        $listen = $t.Connected
        $t.Close()
    } catch {}
    if (-not $listen) { continue }

    $null = & curl.exe -sS -m 8 -x "http://127.0.0.1:$p" https://api.github.com/zen 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Status 'OK' "Proxy port $p -> GitHub OK"
        if ($sysPort -and $p -eq $sysPort) { $sysPortOk = $true }
        if (-not $goodPort) { $goodPort = $p }
    } elseif ($p -eq 7890 -or $p -eq 7891) {
        Write-Status 'WARN' "Port $p listens but HTTP proxy fails (use mixed-port e.g. 61905)"
    } else {
        Write-Status 'WARN' "Port $p listens, GitHub probe failed"
    }
}

if (-not $goodPort) {
    $fail++
    Write-Status 'FAIL' 'No local proxy port can reach GitHub'
    Write-Status 'INFO' 'Open Clash -> system proxy -> pick node -> latency test'
    if ($FixGateway -and (Test-Path (Join-Path $Root 'scripts\fix-clash-cfw-gateway.ps1'))) {
        & powershell -ExecutionPolicy Bypass -File (Join-Path $Root 'scripts\fix-clash-cfw-gateway.ps1')
    }
} else {
    $recommend = if ($sysPortOk) { $sysPort } else { $goodPort }
    $gitProxy = git config --global --get http.https://github.com.proxy 2>$null
    $want = "http://127.0.0.1:$recommend"
    if ($gitProxy -ne $want) {
        Write-Status 'WARN' "git proxy is [$gitProxy], suggest: $want"
        Write-Status 'INFO' "Fix: git config --global http.https://github.com.proxy $want"
        if ($FixGit) {
            git config --global http.https://github.com.proxy $want
            Write-Status 'OK' "git proxy set to $want"
        }
    } else {
        Write-Status 'OK' "git proxy OK: $gitProxy"
    }
}

Write-Host ''
Write-Host '======== Summary ========'
if ($fail -eq 0) {
    Write-Status 'OK' 'Local preview + gateway OK'
    exit 0
}
Write-Status 'FAIL' "$fail issue(s) need attention"
exit 1
