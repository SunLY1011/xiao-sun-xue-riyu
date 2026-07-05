import http.server, ssl, os, sys, socket

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
DIR  = os.path.dirname(os.path.abspath(__file__))
CERT = r"D:\Japanese\Janpan-software\certs\localhost.pem"
KEY  = r"D:\Japanese\Janpan-software\certs\localhost-key.pem"

os.chdir(DIR)

if not (os.path.isfile(CERT) and os.path.isfile(KEY)):
    sys.stdout.write("ERROR: cert files not found\n"); sys.stdout.flush()
    sys.exit(1)

try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80)); lan = s.getsockname()[0]; s.close()
except Exception:
    lan = "127.0.0.1"

ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
try: ctx.minimum_version = ssl.TLSVersion.TLSv1_2
except Exception: pass
ctx.load_cert_chain(CERT, KEY)

handler = http.server.SimpleHTTPRequestHandler
server = http.server.HTTPServer(("0.0.0.0", PORT), handler)
server.socket = ctx.wrap_socket(server.socket, server_side=True)

msg = (
    "\n"
    "===========================================================\n"
    " HTTPS SERVER RUNNING\n"
    "-----------------------------------------------------------\n"
    " localhost : https://localhost:%d/\n"
    " LAN (iPhone): https://%s:%d/\n"
    " Test page  : https://%s:%d/iphone-sw-test.html\n"
    " Press Ctrl+C to stop\n"
    "===========================================================\n"
) % (PORT, lan, PORT, lan, PORT)
sys.stdout.write(msg); sys.stdout.flush()

try:
    server.serve_forever()
except KeyboardInterrupt:
    sys.stdout.write("\nStopped\n"); sys.stdout.flush()
    server.server_close()