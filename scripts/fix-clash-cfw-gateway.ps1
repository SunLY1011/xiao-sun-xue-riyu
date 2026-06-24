# Clash for Windows (ikuuu) 网关修复 — 本地配置层
# 用法：以普通用户 PowerShell 运行（需已打开 CFW）
#   powershell -ExecutionPolicy Bypass -File scripts\fix-clash-cfw-gateway.ps1

$ErrorActionPreference = 'Stop'

function Find-CfwDataDir {
    $candidates = @(
        "$env:USERPROFILE\.config\clash",
        "$env:APPDATA\clash_win",
        "$env:APPDATA\Clash for Windows"
    )
    foreach ($top in [System.IO.Directory]::GetDirectories('D:\')) {
        $candidates += (Join-Path $top 'Clash.for.Windows-0.20.16.4-ikuuu\Clash.for.Windows-0.20.16-ikuuu\data')
    }
    foreach ($c in $candidates) {
        if ([System.IO.Directory]::Exists($c)) { return $c }
        $profiles = Join-Path $c 'profiles'
        if ([System.IO.Directory]::Exists($profiles)) { return $c }
    }
    throw '未找到 Clash.for.Windows data 目录。若使用 clash-win64，请在客户端内更新订阅并开启系统代理。'
}

function Get-SystemProxyPort {
    $inet = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
    if ($inet.ProxyEnable -and [string]$inet.ProxyServer -match ':(\d+)\s*$') {
        return [int]$Matches[1]
    }
    return $null
}

$sysPort = Get-SystemProxyPort
if ($sysPort) {
    Write-Host "当前系统代理端口: $sysPort（clash-win64 等）"
    $zen = curl.exe -sS -m 8 -x "http://127.0.0.1:$sysPort" https://api.github.com/zen 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] 经系统代理可访问 GitHub，无需改 CFW 配置时可跳过本脚本。"
        Write-Host "     git 建议: git config --global http.https://github.com.proxy http://127.0.0.1:$sysPort"
    }
}

try {
    $data = Find-CfwDataDir
} catch {
    Write-Warning $_.Exception.Message
    Write-Host "若仅使用 clash-win64：打开客户端 → 更新订阅 → 系统代理 → 选节点测速。"
    exit 1
}
$listYml = Join-Path $data 'profiles\list.yml'
$configYaml = Join-Path $data 'config.yaml'
$profileIkuuu = Join-Path $data 'profiles\1777216296560.yml'
$profile0 = Join-Path $data 'profiles\1777216278573.yml'

$list = [System.IO.File]::ReadAllText($listYml, [System.Text.UTF8Encoding]::new($false))
if ($list -notmatch 'url:\s*(https://[^\s]+)') { throw 'list.yml 中未找到订阅 URL' }
$subUrl = $Matches[1]

Write-Host "下载订阅 …"
$tmp = Join-Path $env:TEMP "clash-sub-$(Get-Date -Format 'yyyyMMddHHmmss').yaml"
Invoke-WebRequest -Uri $subUrl -OutFile $tmp -UseBasicParsing -TimeoutSec 90

$secret = '4e957c88-7b19-441e-b719-cdf12380c619'
$mixedPort = 56599
$ctrlPort = 56598
if (Test-Path $configYaml) {
    $old = [System.IO.File]::ReadAllText($configYaml, [System.Text.UTF8Encoding]::new($false))
    if ($old -match "secret:\s*'([^']+)'") { $secret = $Matches[1] }
    if ($old -match 'mixed-port:\s*(\d+)') { $mixedPort = [int]$Matches[1] }
    if ($old -match "external-controller:\s*'[^']+:(\d+)'") { $ctrlPort = [int]$Matches[1] }
}

$sub = [System.IO.File]::ReadAllText($tmp, [System.Text.UTF8Encoding]::new($false))
$sub = $sub -replace '(?m)^mixed-port:.*\r?\n', ''
$sub = $sub -replace '(?m)^allow-lan:.*\r?\n', ''
$sub = $sub -replace '(?m)^external-controller:.*\r?\n', ''
$sub = $sub -replace '(?m)^secret:.*\r?\n', ''
$header = @"
mixed-port: $mixedPort
allow-lan: false
external-controller: '127.0.0.1:$ctrlPort'
secret: '$secret'

"@
$final = $header + $sub
$utf8 = [System.Text.UTF8Encoding]::new($false)
foreach ($path in @($configYaml, $profileIkuuu, $profile0)) {
    [System.IO.File]::WriteAllText($path, $final, $utf8)
}

$list = [System.IO.File]::ReadAllText($listYml, $utf8)
$list = $list -replace '(?m)^index:\s*\d+\s*$', 'index: 1'
$list = [regex]::Replace(
    $list,
    '(?s)(  - time: 1777216296560\.yml\r?\n    name: iKuuu_V2\.yaml\r?\n    url: [^\r\n]+\r?\n)    selected:.*?(?=\r?\n    interval:)',
    '$1'
)
[System.IO.File]::WriteAllText($listYml, $list, $utf8)

Write-Host "重载 Clash 核心 …"
$cfgPath = ($configYaml -replace '\\', '/')
$reloadBody = (@{ path = $cfgPath } | ConvertTo-Json -Compress)
$h = @{ Authorization = "Bearer $secret" }
try {
    Invoke-RestMethod -Uri "http://127.0.0.1:$ctrlPort/configs?force=true" -Method PUT -Headers $h -ContentType 'application/json' -Body $reloadBody | Out-Null
} catch {
    Write-Warning "API 重载失败（可先完全退出 CFW 再打开）: $($_.Exception.Message)"
}

# GLOBAL -> 主选择组；主选择组 -> 日本1（名称从 API 读取，避免编码问题）
Start-Sleep -Seconds 2
try {
    $p = Invoke-RestMethod -Uri "http://127.0.0.1:$ctrlPort/proxies" -Headers $h
    $main = $p.proxies.PSObject.Properties | Where-Object {
        $_.Value.type -eq 'Selector' -and @($_.Value.all).Count -eq 8
    } | Select-Object -First 1
    if ($main) {
        $b1 = Join-Path $env:TEMP 'cfw-global.json'
        $b2 = Join-Path $env:TEMP 'cfw-main.json'
        [System.IO.File]::WriteAllText($b1, ('{"name":' + (ConvertTo-Json $main.Name -Compress) + '}'), $utf8)
        [System.IO.File]::WriteAllText($b2, ('{"name":' + (ConvertTo-Json $main.Value.all[0] -Compress) + '}'), $utf8)
        $enc = python -c "import urllib.parse; print(urllib.parse.quote('''$($main.Name)'''))"
        curl.exe -sS -X PUT "http://127.0.0.1:$ctrlPort/proxies/GLOBAL" -H "Authorization: Bearer $secret" -H "Content-Type: application/json" --data-binary "@$b1" | Out-Null
        curl.exe -sS -X PUT "http://127.0.0.1:$ctrlPort/proxies/$enc" -H "Authorization: Bearer $secret" -H "Content-Type: application/json" --data-binary "@$b2" | Out-Null
        Invoke-RestMethod -Uri "http://127.0.0.1:$ctrlPort/configs" -Method PATCH -Headers $h -ContentType 'application/json' -Body '{"mode":"rule"}' | Out-Null
    }
} catch {
    Write-Warning "代理组切换失败，请在 CFW 界面手动选节点: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "本地配置已修复。请在 CFW 中确认："
Write-Host "  1) Profiles 选中 iKuuu_V2（非空 config.yaml）"
Write-Host "  2) 打开 System Proxy（系统代理）"
Write-Host "  3) Proxies -> 选择节点 -> 点测速，选延迟最低的日本节点"
Write-Host "  4) 若全部超时：登录 ikuuu 控制台更新订阅或更换节点套餐"
Write-Host ""
Write-Host "混合代理端口: $mixedPort | 控制面板: http://127.0.0.1:$ctrlPort/ui"
