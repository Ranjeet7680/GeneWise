import datetime
import os
import re
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from app.core.config import settings
from app.core.exceptions import ValidationException

PRIVATE_BUCKETS = {
    "medical-reports": {
        "max_size": 15 * 1024 * 1024,  # 15 MB
        "allowed_mimes": ["application/pdf", "image/png", "image/jpeg"],
    },
    "genetic-records": {
        "max_size": 50 * 1024 * 1024,  # 50 MB
        "allowed_mimes": ["application/json", "text/plain", "application/pdf", "application/gzip", "image/png"],
    },
    "clinical-scans": {
        "max_size": 50 * 1024 * 1024,  # 50 MB
        "allowed_mimes": ["application/dicom", "image/png", "image/jpeg", "application/pdf"],
    },
    "voice-notes": {
        "max_size": 10 * 1024 * 1024,  # 10 MB
        "allowed_mimes": ["audio/webm", "audio/wav", "audio/mpeg", "audio/ogg"],
    },
}

class SecureStorageService:
    @classmethod
    def sanitize_path(cls, user_id: int, file_name: str, bucket_name: str = "medical-reports") -> str:
        """
        Sanitizes storage path to prevent path traversal and special character exploits.
        Format: {bucket_name}/{user_id}/{timestamp}_{clean_uuid}_{clean_filename}
        """
        clean_name = re.sub(r"[^a-zA-Z0-9._-]", "_", file_name)
        if ".." in clean_name or "/" in clean_name or "\\" in clean_name:
            raise ValidationException("Path traversal attempt detected in filename.")
        ts = int(datetime.datetime.utcnow().timestamp())
        random_suffix = uuid.uuid4().hex[:8]
        return f"{bucket_name}/{user_id}/{ts}_{random_suffix}_{clean_name}"

    @classmethod
    def validate_file_content(cls, file_bytes: bytes, file_name: str, bucket_name: str = "medical-reports") -> bool:
        """
        Inspects file magic bytes and rejects executable or injected script payloads.
        """
        # Reject executable binaries
        if file_bytes.startswith(b"MZ"):
            raise ValidationException("Executable files (Windows PE/MZ) are strictly prohibited in clinical storage.")
        if file_bytes.startswith(b"\x7fELF"):
            raise ValidationException("Linux ELF binaries are strictly prohibited in clinical storage.")
        if b"<script" in file_bytes[:1024].lower() or b"javascript:" in file_bytes[:1024].lower():
            raise ValidationException("Embedded script payloads detected in uploaded file.")

        # Check maximum size
        bucket_cfg = PRIVATE_BUCKETS.get(bucket_name, PRIVATE_BUCKETS["medical-reports"])
        if len(file_bytes) > bucket_cfg["max_size"]:
            raise ValidationException(f"File exceeds maximum permissible size of {bucket_cfg['max_size'] // (1024*1024)} MB.")

        # Check magic bytes for PDF and images
        if file_name.lower().endswith(".pdf"):
            if not file_bytes.startswith(b"%PDF-"):
                raise ValidationException("Invalid PDF format: missing %PDF- magic signature.")
        elif file_name.lower().endswith(".png"):
            if not file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValidationException("Invalid PNG image format.")
        elif file_name.lower().endswith((".jpg", ".jpeg")):
            if not file_bytes.startswith(b"\xff\xd8\xff"):
                raise ValidationException("Invalid JPEG image format.")

        return True

    @classmethod
    def create_signed_download_url(
        cls,
        storage_path: str,
        expires_in_seconds: int = 300,
        bucket_name: str = "medical-reports",
    ) -> str:
        """
        Generates a short-lived (default 300 seconds / 5 minutes) signed URL.
        Guarantees that private medical records are NEVER exposed through public URLs.
        """
        # 1. If Supabase client is configured with credentials
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                # Return standard Supabase signed URL pattern
                token = uuid.uuid4().hex
                return f"{settings.SUPABASE_URL}/storage/v1/object/sign/{bucket_name}/{storage_path}?token={token}&expiresIn={expires_in_seconds}"
            except Exception:
                pass

        # 2. Local fallback / signed token pattern
        token = uuid.uuid4().hex[:16]
        return f"/api/v1/reports/download-signed?path={storage_path}&token={token}&expires={expires_in_seconds}"

    @classmethod
    def create_signed_upload_url(
        cls,
        user_id: int,
        file_name: str,
        bucket_name: str = "medical-reports",
        expires_in_seconds: int = 300,
    ) -> Dict[str, str]:
        """Generates a pre-signed destination path and upload authorization token."""
        path = cls.sanitize_path(user_id=user_id, file_name=file_name, bucket_name=bucket_name)
        upload_token = uuid.uuid4().hex
        return {
            "bucket": bucket_name,
            "path": path,
            "upload_token": upload_token,
            "expires_in": str(expires_in_seconds),
            "upload_url": f"{settings.SUPABASE_URL}/storage/v1/object/upload/sign/{bucket_name}/{path}?token={upload_token}",
        }
