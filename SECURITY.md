# Security Policy & Responsible Vulnerability Disclosure

## Supported Versions
Security updates are actively applied to the default production branch:

| Version | Supported | Status |
|:---|:---|:---|
| `main` (v2.4 ClinVar / ACMG) | ✅ Yes | Active Production Deployment |
| `< 2.0` | ❌ No | Deprecated |

## Reporting a Vulnerability
We take the security of Protected Health Information (PHI) and clinical decision support systems seriously.

If you believe you have found a security vulnerability in GeneWise:
1. **Do NOT publicly disclose the issue via public GitHub issues or forums.**
2. Send an email to the security team or open a **Private Security Advisory** directly on GitHub under the repository's `Security -> Advisories` tab.
3. Include:
   - Type of issue (e.g., authorization bypass, IDOR, SQL injection, cryptographic signing failure).
   - Step-by-step reproduction instructions or proof-of-concept payload.
   - Potential impact on clinical records or patient privacy under DPDP 2023 / HIPAA guidelines.

## Security Architecture & Core Controls
- **ReBAC Authorization**: Mandatory verification of active physician-patient care relationships (`check_active_care_relationship`).
- **MFA (RFC 6238)**: Zero-dependency TOTP authentication with encrypted backup recovery tokens.
- **Audit Logging**: Immutable HMAC-SHA256 signature chains on all PHI access and diagnostic sign-offs.
- **Data Protection**: Strict segregation of de-identified clinical telemetry from identifiable genomic pedigree records.
- **MIME & Antivirus Validation**: Strict byte-signature inspection on all file upload streams (`%PDF-`, `\x89PNG`, `\xff\xd8\xff`).

We will acknowledge receipt within 48 hours and work with you to coordinate a responsible disclosure and prompt resolution.
