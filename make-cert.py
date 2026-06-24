# -*- coding: utf-8 -*-
"""直接生成证书，IP = 192.168.10.36"""
import datetime, ipaddress, os, subprocess, sys

CERT_DIR = r"D:\Japanese\Janpan-software\certs"
LAN_IP = "192.168.10.36"

os.makedirs(CERT_DIR, exist_ok=True)
os.chdir(CERT_DIR)

try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
except ImportError:
    print("正在安装 cryptography...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cryptography"])
    from cryptography import x509
    from cryptography.x509.oid import NameOID
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa

print(f"生成证书 IP = {LAN_IP}...")

key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
subj = x509.Name([
    x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
    x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Local Dev"),
])
now = datetime.datetime.utcnow()
cert = (
    x509.CertificateBuilder()
    .subject_name(subj)
    .issuer_name(subj)
    .public_key(key.public_key())
    .serial_number(x509.random_serial_number())
    .not_valid_before(now - datetime.timedelta(days=1))
    .not_valid_after(now + datetime.timedelta(days=3650))
    .add_extension(x509.SubjectAlternativeName([
        x509.DNSName("localhost"),
        x509.IPAddress(ipaddress.ip_address("127.0.0.1")),
        x509.IPAddress(ipaddress.ip_address(LAN_IP)),
    ]), critical=False)
    .sign(key, hashes.SHA256())
)

with open("localhost.pem", "wb") as f:
    f.write(cert.public_bytes(serialization.Encoding.PEM))
with open("localhost-key.pem", "wb") as f:
    f.write(key.private_bytes(serialization.Encoding.PEM,
                                serialization.PrivateFormat.TraditionalOpenSSL,
                                serialization.NoEncryption()))

print("✅ 生成成功！")
print(f"   {os.path.join(CERT_DIR, 'localhost.pem')}")
print(f"   {os.path.join(CERT_DIR, 'localhost-key.pem')}")