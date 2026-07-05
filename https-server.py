# -*- coding: utf-8 -*-
import http.server, ssl, sys, os, socket
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
CERT_DIR    = r"D:\Japanese\Janpan-software\certs"
CERT_FILE   = os.path.join(CERT_DIR, "localhost.pem")
KEY_FILE    = os.path.join(CERT_DIR, "localhost-key.pem")
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8443

os.chdir(PROJECT_DIR)

if not (os.path.isfile(CERT_FILE) and os.path.isfile(KEY_FILE)):
    print(f"[错误] 找不到证书！")
    print(f"       需要: {CERT_FILE}")
    print(f"       需要: {KEY_FILE}")
    print(f"       请先运行: gen-cert.ps1  (右键 → 使用 PowerShell 运行)")
    sys.exit(1)

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    lan = s.getsockname()[0]
    s.close()
except Exception:
    lan = "127.0.0.1"

print("="*60)
print(f"  项目: {PROJECT_DIR}")
print(f"  证书: {CERT_FILE}")
print(f"  端口: {port}")
print("="*60)
print(f"  本机:      https://localhost:{port}/")
print(f"  本机:      https://127.0.0.1:{port}/")
print(f"  局域网:    https://{lan}:{port}/")
print(f"  SW 测试:   https://{lan}:{port}/iphone-sw-test.html")
print(f"  主页:      https://{lan}:{port}/index.html")
print("="*60)
print("  iPhone 同 WiFi 访问上方 局域网 地址")
print("  Ctrl+C 停止")
print("="*60)

ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.minimum_version = ssl.TLSVersion.TLSv1_2
ctx.load_cert_chain(CERT_FILE, KEY_FILE)

server = http.server.HTTPServer(("0.0.0.0", port), http.server.SimpleHTTPRequestHandler)
server.socket = ctx.wrap_socket(server.socket, server_side=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\n已停止。")
    server.server_close()