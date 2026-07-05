# -*- coding: utf-8 -*-
"""
一键 HTTPS 服务器 + 自动生成自签名证书
用法: python run-https.py        （端口默认 8443）
  或: python run-https.py 4433
"""
import http.server, ssl, sys, os, socket, subprocess, datetime, ipaddress

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
CERT_DIR    = r"D:\Japanese\Janpan-software\certs"
CERT_FILE   = os.path.join(CERT_DIR, "localhost.pem")
KEY_FILE    = os.path.join(CERT_DIR, "localhost-key.pem")
PORT        = int(sys.argv[1]) if len(sys.argv) > 1 else 8443


def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        if ip and ip != "127.0.0.1":
            return ip
    except Exception:
        pass
    # 回退
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None):
            ip = info[4][0]
            try:
                ip_obj = ipaddress.ip_address(ip)
                if ip_obj.is_private and not ip_obj.is_loopback:
                    return ip
            except Exception:
                pass
    except Exception:
        pass
    return "127.0.0.1"


def generate_cert_python(lan_ip):
    """用 Python cryptography 库生成自签名证书（最可靠，零外部依赖）"""
    try:
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.backends import default_backend
    except ImportError:
        print("  [需要安装] cryptography 模块，正在自动安装...")
        rc = subprocess.call([sys.executable, "-m", "pip", "install", "cryptography"])
        if rc != 0:
            return False
        # 重新 import
        try:
            from cryptography import x509
            from cryptography.x509.oid import NameOID
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            from cryptography.hazmat.backends import default_backend
        except ImportError:
            return False

    print("  [证书] 用 Python cryptography 库生成 RSA-2048 自签名证书...")

    # 生成私钥
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048, backend=default_backend())

    # 生成证书（包含 SAN：localhost, 127.0.0.1, 局域网 IP）
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "CN"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Local"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "Local"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Local Dev"),
        x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, "PWA Test"),
        x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
    ])

    san_list = [x509.DNSName("localhost"), x509.IPAddress(ipaddress.ip_address("127.0.0.1"))]
    if lan_ip and lan_ip != "127.0.0.1":
        try:
            san_list.append(x509.IPAddress(ipaddress.ip_address(lan_ip)))
        except Exception:
            pass

    now = datetime.datetime.utcnow()
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - datetime.timedelta(days=1))
        .not_valid_after(now + datetime.timedelta(days=3650))
        .add_extension(x509.SubjectAlternativeName(san_list), critical=False)
        .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
        .add_extension(x509.KeyUsage(digital_signature=True, content_commitment=False,
                                       key_encipherment=True, data_encipherment=False,
                                       key_agreement=False, key_cert_sign=False,
                                       crl_sign=False, encipher_only=False, decipher_only=False), critical=True)
        .sign(key, hashes.SHA256(), default_backend())
    )

    # 写证书
    with open(CERT_FILE, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    # 写私钥
    with open(KEY_FILE, "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))

    return True


def ensure_certs():
    if not os.path.isdir(CERT_DIR):
        os.makedirs(CERT_DIR, exist_ok=True)

    if os.path.isfile(CERT_FILE) and os.path.isfile(KEY_FILE):
        print(f"[证书] 已存在 -> {CERT_FILE}")
        return True

    print(f"[证书] 未找到，开始自动生成 -> {CERT_DIR}")
    lan_ip = get_lan_ip()
    print(f"[证书] 局域网 IP: {lan_ip}")

    # 方案 1: 有 mkcert 就用
    for mk in ("mkcert", "mkcert.exe"):
        try:
            rc = subprocess.call([mk, "-help"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=15)
            if rc in (0, 2):
                print("  [方案 A] 检测到 mkcert")
                try: subprocess.call([mk, "-install"], timeout=30)
                except Exception: pass
                args = [mk, "-cert-file", CERT_FILE, "-key-file", KEY_FILE,
                        "localhost", "127.0.0.1"]
                if lan_ip != "127.0.0.1":
                    args.append(lan_ip)
                rc2 = subprocess.call(args, cwd=CERT_DIR, timeout=60)
                if rc2 == 0 and os.path.isfile(CERT_FILE):
                    return True
        except Exception:
            pass

    # 方案 2: 有 openssl 就用
    for ossl in ("openssl", "openssl.exe",
                 r"C:\Program Files\Git\usr\bin\openssl.exe",
                 r"C:\Program Files (x86)\Git\usr\bin\openssl.exe",
                 r"C:\Program Files\OpenSSL-Win64\bin\openssl.exe"):
        try:
            rc = subprocess.call([ossl, "version"], stdout=subprocess.DEVNULL,
                                 stderr=subprocess.DEVNULL, timeout=15)
            if rc == 0:
                print(f"  [方案 B] 检测到 OpenSSL: {ossl}")
                cnf = os.path.join(CERT_DIR, "openssl.cnf")
                san = f"DNS:localhost,IP:127.0.0.1,IP:{lan_ip}" if lan_ip != "127.0.0.1" else "DNS:localhost,IP:127.0.0.1"
                with open(cnf, "w", encoding="ascii") as f:
                    f.write(f"""[req]
default_bits=2048
prompt=no
default_md=sha256
distinguished_name=dn
x509_extensions=v3_req
[dn]
C=CN
O=Local Dev
CN=localhost
[v3_req]
subjectAltName={san}
basicConstraints=CA:FALSE
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
""")
                rc2 = subprocess.call([ossl, "req", "-x509", "-newkey", "rsa:2048",
                                        "-nodes", "-keyout", KEY_FILE, "-out", CERT_FILE,
                                        "-days", "3650", "-config", cnf],
                                       cwd=CERT_DIR, timeout=60)
                if rc2 == 0 and os.path.isfile(CERT_FILE) and os.path.isfile(KEY_FILE):
                    return True
        except Exception:
            pass

    # 方案 3: 纯 Python cryptography（自动安装）
    print("  [方案 C] 使用 Python cryptography 库")
    if generate_cert_python(lan_ip):
        return True

    return False


def start_server():
    os.chdir(PROJECT_DIR)
    lan = get_lan_ip()

    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    try:
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    except Exception:
        pass
    ctx.load_cert_chain(CERT_FILE, KEY_FILE)

    handler = http.server.SimpleHTTPRequestHandler
    server = http.server.HTTPServer(("0.0.0.0", PORT), handler)
    server.socket = ctx.wrap_socket(server.socket, server_side=True)

    print()
    print("=" * 60)
    print("  HTTPS Server Ready  ")
    print("=" * 60)
    print(f"  localhost     : https://localhost:{PORT}/")
    print(f"  127.0.0.1     : https://127.0.0.1:{PORT}/")
    print(f"  LAN (iPhone)  : https://{lan}:{PORT}/")
    print(f"  SW Test Page  : https://{lan}:{PORT}/iphone-sw-test.html")
    print(f"  Main Page     : https://{lan}:{PORT}/index.html")
    print("=" * 60)
    print("  iPhone steps:")
    print(f"  1. Connect iPhone to same WiFi as this PC")
    print(f"  2. Safari open: https://{lan}:{PORT}/iphone-sw-test.html")
    print(f"  3. Tap 'Show Details' then 'Visit this website'")
    print(f"  4. If stuck: Windows Firewall -> allow Python on Private")
    print("=" * 60)
    print("  Ctrl+C to stop")
    print("=" * 60)
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


def main():
    os.chdir(PROJECT_DIR)
    print("=" * 60)
    print("  HTTPS Server + Auto Cert Generator")
    print("=" * 60)
    print(f"  Project: {PROJECT_DIR}")
    print(f"  Cert Dir: {CERT_DIR}")
    print(f"  Port: {PORT}")
    print(f"  Python: {sys.version.split()[0]}")
    print("=" * 60)
    print()

    if not ensure_certs():
        print()
        print("[ERROR] Failed to generate certificate.")
        print()
        print("Install ONE of these and rerun:")
        print("  - mkcert (recommended): download mkcert-...-windows-amd64.exe")
        print("     from https://github.com/FiloSottile/mkcert/releases")
        print("     rename to mkcert.exe, put in C:\\Windows\\System32\\")
        print("  - Git for Windows (includes openssl): https://git-scm.com")
        print("  - Or just run: pip install cryptography")
        sys.exit(1)

    print()
    print(f"[证书] OK: {CERT_FILE}")
    print(f"[证书] OK: {KEY_FILE}")

    start_server()


if __name__ == "__main__":
    main()