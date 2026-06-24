# HTTPS 证书自动生成脚本 · 双击运行
# 需要: 以管理员身份运行 PowerShell
# 结果: 在 D:\Japanese\Janpan-software\certs\ 生成 localhost.pem + localhost-key.pem

$ErrorActionPreference = "Stop"
$CERT_DIR = "D:\Japanese\Janpan-software\certs"

Write-Host "=== 生成 HTTPS 证书 ===" -ForegroundColor Cyan
Write-Host "证书目录: $CERT_DIR"
Write-Host ""

# 1) 创建目录
New-Item -ItemType Directory -Force -Path $CERT_DIR | Out-Null
Set-Location $CERT_DIR

# 2) 获取局域网 IP
$lanIP = $null
try {
    $ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -match '^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)' -and
        $_.InterfaceAlias -notmatch 'Loopback|VMware|VirtualBox|Docker|vEthernet'
    }
    if ($ips -and $ips.Count -gt 0) { $lanIP = ($ips | Select-Object -First 1).IPAddress }
} catch {}
if (-not $lanIP) { $lanIP = "127.0.0.1" }

Write-Host "局域网 IP: $lanIP" -ForegroundColor Green
Write-Host ""

# 3) 尝试 mkcert
$mkcert = Get-Command mkcert -ErrorAction SilentlyContinue
if ($mkcert) {
    Write-Host "[方案 1] 使用 mkcert..." -ForegroundColor Yellow
    try { & mkcert -install *>$null } catch { Write-Host "  (提示: mkcert -install 失败，可能需要管理员)" -ForegroundColor Gray }
    & mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1 ::1 $lanIP
    if (Test-Path "localhost.pem" -and Test-Path "localhost-key.pem") {
        Write-Host ""
        Write-Host "✅ mkcert 证书生成成功！" -ForegroundColor Green
        Write-Host "  iPhone 信任步骤:"
        Write-Host "  ① 执行: mkcert -CAROOT  查看根 CA 目录"
        Write-Host "  ② 把 rootCA.pem 发到 iPhone"
        Write-Host "  ③ 设置 → 通用 → VPN 与设备管理 → 安装"
        Write-Host "  ④ 设置 → 通用 → 关于 → 证书信任设置 → 打开开关"
        goto :end
    }
}

# 4) 尝试 openssl
$openssl = $null
if (Get-Command openssl -ErrorAction SilentlyContinue) { $openssl = "openssl" }
elseif (Test-Path "C:\Program Files\Git\usr\bin\openssl.exe") { $openssl = "C:\Program Files\Git\usr\bin\openssl.exe" }
elseif (Test-Path "C:\Program Files (x86)\Git\usr\bin\openssl.exe") { $openssl = "C:\Program Files (x86)\Git\usr\bin\openssl.exe" }

if ($openssl) {
    Write-Host "[方案 2] 使用 OpenSSL..." -ForegroundColor Yellow
    @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req
[dn]
C = CN
ST = Local
L = Local
O = Local Dev
OU = PWA Test
emailAddress = dev@localhost
CN = localhost
[v3_req]
subjectAltName = DNS:localhost,IP:127.0.0.1,IP:$lanIP
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
"@ | Out-File -Encoding ascii openssl.cnf
    & $openssl req -x509 -newkey rsa:2048 -nodes -keyout localhost-key.pem -out localhost.pem -days 3650 -config openssl.cnf 2>$null
    if (Test-Path "localhost.pem" -and Test-Path "localhost-key.pem") {
        Write-Host ""
        Write-Host "✅ OpenSSL 自签名证书生成成功！" -ForegroundColor Green
        Write-Host "  iPhone 信任步骤:"
        Write-Host "  ① 把 $CERT_DIR\localhost.pem 发到 iPhone"
        Write-Host "  ② 设置 → 通用 → VPN 与设备管理 → 安装"
        Write-Host "  ③ 设置 → 通用 → 关于 → 证书信任设置 → 打开开关"
        goto :end
    }
}

# 5) 回退: PowerShell PKI 生成 PFX
Write-Host "[方案 3] 使用 PowerShell PKI 生成 PFX..." -ForegroundColor Yellow
$cert = New-SelfSignedCertificate -Subject "CN=localhost" -DnsName "localhost","127.0.0.1",$lanIP -CertStoreLocation "Cert:\CurrentUser\My" -Type SSLServerAuthentication -NotAfter (Get-Date).AddYears(10)
$pwd = ConvertTo-SecureString -String "temp" -Force -AsPlainText
Export-PfxCertificate -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" -FilePath "localhost.pfx" -Password $pwd | Out-Null
Write-Host "  已生成 localhost.pfx"

if (-not $openssl) {
    Write-Host ""
    Write-Host "⚠️  只生成了 PFX，还需要 OpenSSL 转成 PEM 供 Python 读取" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请安装以下任意一个，然后重新运行本脚本:"
    Write-Host "  • Git for Windows（自带 openssl）: https://git-scm.com/download/win"
    Write-Host "  • OpenSSL: https://slproweb.com/products/Win32OpenSSL.html"
    Write-Host "  • mkcert（最简单）: https://github.com/FiloSottile/mkcert/releases"
    goto :pause
}

& $openssl pkcs12 -in localhost.pfx -nokeys -out localhost.pem -passin pass:temp 2>$null
& $openssl pkcs12 -in localhost.pfx -nodes -nocerts -out localhost-key.pem -passin pass:temp 2>$null

if (Test-Path "localhost.pem" -and Test-Path "localhost-key.pem") {
    Write-Host ""
    Write-Host "✅ 由 PowerShell + OpenSSL 生成 PEM 证书" -ForegroundColor Green
    goto :end
}

Write-Host "❌ 所有方案都失败了" -ForegroundColor Red
goto :pause

:end
Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步: 双击 https-start.bat 启动服务器"
Write-Host ""
:pause
if ($env:PSInteractive) { Read-Host "按回车退出" }