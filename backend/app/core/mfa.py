import base64
import hashlib
import hmac
import os
import secrets
import struct
import time
import urllib.parse
from typing import List, Optional, Tuple

def generate_totp_secret() -> str:
    """Generates a random 20-byte base32-encoded secret string for RFC 6238 TOTP."""
    raw = os.urandom(20)
    return base64.b32encode(raw).decode("utf-8").rstrip("=")

def generate_backup_codes(count: int = 8) -> List[str]:
    """Generates emergency one-time recovery backup codes."""
    return [secrets.token_hex(4).upper() for _ in range(count)]

def generate_otpauth_url(secret: str, email: str, issuer: str = "MediPredict AI") -> str:
    """Constructs the standard otpauth:// URL for authenticator QR codes."""
    label = f"{urllib.parse.quote(issuer)}:{urllib.parse.quote(email)}"
    issuer_quoted = urllib.parse.quote(issuer)
    # Pad secret if needed
    padded_secret = secret + "=" * ((8 - len(secret) % 8) % 8)
    return f"otpauth://totp/{label}?secret={padded_secret}&issuer={issuer_quoted}&algorithm=SHA1&digits=6&period=30"

def calculate_totp(secret: str, timestamp: Optional[float] = None, interval: int = 30) -> str:
    """Calculates the standard RFC 6238 6-digit TOTP code for a given secret."""
    if timestamp is None:
        timestamp = time.time()
    padded_secret = secret + "=" * ((8 - len(secret) % 8) % 8)
    key = base64.b32decode(padded_secret, casefold=True)
    counter = int(timestamp // interval)
    msg = struct.pack(">Q", counter)
    digest = hmac.new(key, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    code = (struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF) % 1000000
    return f"{code:06d}"

def verify_totp_code(secret: str, code: str, window: int = 1, interval: int = 30) -> bool:
    """
    Verifies a 6-digit TOTP code against a secret within a time window drift.
    window=1 allows current interval, 1 previous interval (-30s), and 1 future interval (+30s).
    """
    if not secret or not code or len(code.strip()) != 6:
        return False
    clean_code = code.strip()
    now = time.time()
    for w in range(-window, window + 1):
        expected = calculate_totp(secret, timestamp=now + (w * interval), interval=interval)
        if hmac.compare_digest(expected, clean_code):
            return True
    return False

def verify_and_consume_backup_code(backup_codes: Optional[List[str]], input_code: str) -> Tuple[bool, List[str]]:
    """Verifies a single-use emergency backup code and removes it from the remaining list."""
    if not backup_codes or not input_code:
        return False, backup_codes or []
    clean_input = input_code.strip().upper()
    for i, code in enumerate(backup_codes):
        if hmac.compare_digest(code.upper(), clean_input):
            remaining = [c for idx, c in enumerate(backup_codes) if idx != i]
            return True, remaining
    return False, backup_codes
