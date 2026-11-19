import re
from typing import Any, Dict, List, Optional, Set, Tuple
from sqlalchemy.orm import Session
from app.core.exceptions import AISafetyException, ForbiddenException
from app.models.models import User, UserConsent
from app.services.audit.audit_service import AuditService

ALLOWED_CLINICAL_TOOLS: Set[str] = {
    "pubmed_literature_search",
    "biomarker_range_evaluator",
    "pedigree_pattern_analyzer",
    "carrier_screening_lookup",
    "vital_anomaly_detector",
    "clinical_triage_guideline",
    "explainable_xai_dossier",
    "symptom_triage_checker",
    "medication_monograph_lookup",
    "consultation_summary_generator",
}

PROMPT_INJECTION_HEURISTICS: List[re.Pattern] = [
    re.compile(r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"disregard\s+(?:all\s+)?prior\s+directives", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(?:dan|jailbroken|unrestricted|god\s+mode|chaos)", re.IGNORECASE),
    re.compile(r"(?:reveal|print|show|dump|repeat)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions|developer\s+mode)", re.IGNORECASE),
    re.compile(r"act\s+as\s+an\s+unfiltered|override\s+safety\s+filter", re.IGNORECASE),
    re.compile(r"<\s*script\b|javascript\s*:", re.IGNORECASE),
    re.compile(r"\[\s*system\s*:\s*override\s*\]", re.IGNORECASE),
    re.compile(r"(?:prescribe|write\s+me\s+a\s+prescription\s+for)\s+[a-z0-9\-]+", re.IGNORECASE),
]

EMERGENCY_SYMPTOM_HEURISTICS: List[re.Pattern] = [
    re.compile(r"\b(?:crushing\s+chest\s+pain|chest\s+pressure.*arm|left\s+arm\s+pain.*sweat|heart\s+attack)\b", re.IGNORECASE),
    re.compile(r"\b(?:stroke|face\s+drooping|arm\s+weakness|slurred\s+speech|sudden\s+numbness.*one\s+side)\b", re.IGNORECASE),
    re.compile(r"\b(?:suicid|kill\s+myself|end\s+my\s+life|want\s+to\s+die|self-harm)\b", re.IGNORECASE),
    re.compile(r"\b(?:can'?t\s+breathe|severe\s+shortness\s+of\s+breath|suffocating|choking|anaphylaxis|throat\s+swelling)\b", re.IGNORECASE),
    re.compile(r"\b(?:coughing.*blood|vomiting.*blood|uncontrolled\s+bleeding|profuse\s+bleeding)\b", re.IGNORECASE),
    re.compile(r"\b(?:unconscious|passed\s+out|seizure\s+lasting|status\s+epilepticus)\b", re.IGNORECASE),
]

STATUTORY_DISCLAIMER_TEXT = (
    "\n\n---\n**Clinical & Regulatory Disclaimer:** MediPredict AI provides educational genetic and family-history risk awareness. "
    "It does not diagnose medical or genetic conditions, determine reproductive outcomes, or replace clinical genetic testing "
    "and professional medical consultation. In a medical emergency, immediately call 112 / 911 / 999."
)

class AIGuardrailService:
    @classmethod
    def sanitize_and_inspect_prompt(
        cls,
        prompt: str,
        user_id: Optional[int] = None,
        db: Optional[Session] = None,
        ip_address: Optional[str] = None,
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Inspects user prompt for prompt-injections, jailbreaks, and acute emergency symptoms.
        Returns: (is_emergency, emergency_response, injection_warning)
        """
        # 1. Emergency symptom detection
        for pat in EMERGENCY_SYMPTOM_HEURISTICS:
            if pat.search(prompt):
                emergency_msg = (
                    "CRITICAL MEDICAL EMERGENCY WARNING:\n"
                    "Your symptoms indicate a potentially life-threatening medical emergency. "
                    "Do NOT wait for an online analysis. Immediately call your local emergency services "
                    "(112 in India/Europe, 911 in North America, 999 in UK) or proceed to the nearest emergency room immediately."
                )
                return True, emergency_msg, None

        # 2. Prompt injection & jailbreak inspection
        for pat in PROMPT_INJECTION_HEURISTICS:
            if pat.search(prompt):
                if db:
                    AuditService.log_suspicious_activity(
                        db=db,
                        threat_type="prompt_injection_attempt",
                        user_id=user_id,
                        ip_address=ip_address,
                        severity="high",
                        details={"matched_pattern": pat.pattern, "prompt_excerpt": prompt[:100]},
                    )
                return False, None, "Potential system prompt manipulation detected and sanitized by AI Security Layer."

        return False, None, None

    @classmethod
    def validate_tool_call(cls, tool_name: str, user_id: Optional[int] = None, db: Optional[Session] = None) -> bool:
        """Enforces strict Tool Allowlist for autonomous AI agents."""
        if tool_name not in ALLOWED_CLINICAL_TOOLS:
            if db:
                AuditService.log_suspicious_activity(
                    db=db,
                    threat_type="prompt_injection_attempt",
                    user_id=user_id,
                    severity="critical",
                    details={"unauthorized_tool": tool_name},
                )
            raise ForbiddenException(
                f"Unauthorized tool invocation: '{tool_name}' is not permitted in the clinical AI tool allowlist."
            )
        return True

    @classmethod
    def check_medical_data_access_consent(cls, patient_id: int, db: Session) -> bool:
        """
        Restricted Medical-Data Access:
        Verifies that the patient has granted affirmative 'ai_data_analysis' consent
        before sensitive health records or biomarkers can be ingested into LLM context.
        """
        consent = (
            db.query(UserConsent)
            .filter(
                UserConsent.user_id == patient_id,
                UserConsent.consent_type == "ai_data_analysis",
                UserConsent.granted == True,
            )
            .first()
        )
        return consent is not None

    @classmethod
    def enforce_statutory_disclaimer(cls, response_text: str) -> str:
        """Appends statutory non-diagnostic clinical disclaimer if not already present."""
        if "STATUTORY CLINICAL NOTICE:" not in response_text:
            return response_text.strip() + STATUTORY_DISCLAIMER_TEXT
        return response_text.strip()
