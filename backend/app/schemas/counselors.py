import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class CounselorCredentialResponse(BaseModel):
    id: Optional[int] = None
    credential_type: str
    issuer_org: str
    credential_id: str
    status: str  # verified, pending, unverified, expired
    country: str
    issued_date: Optional[datetime.datetime] = None
    expiry_date: Optional[datetime.datetime] = None
    verification_source_url: Optional[str] = None
    evidence_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CounselorResponse(BaseModel):
    id: str
    name: str
    title: str
    professional_title: str
    credentials: str
    qualification: str
    certification_org: str
    registration_number: str
    verification_status: str  # verified, pending, unverified, expired
    verification_source: Optional[str] = None
    institution: str
    department: Optional[str] = None
    location: str
    city: str
    state_province: str
    country: str
    specialty: str
    subspecialties: List[str] = []
    telehealth: bool
    languages: List[str] = []
    bio: str
    fee: str
    waitlist_days: int
    experience_years: int
    avatar: Optional[str] = None
    target_loci: List[str] = []
    target_conditions: List[str] = []
    consultation_availability: str
    is_demo_provider: bool = True
    is_saved: Optional[bool] = False
    match_rationale: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CounselorDetailResponse(CounselorResponse):
    services_offered: List[str] = []
    consultation_modes: List[str] = []
    credentials_list: List[CounselorCredentialResponse] = []
    disclaimer: str = (
        "GeneWise AI Counselor Directory provides educational discovery and referral coordination. "
        "Verified credentials reflect documented institutional registration. All clinical decisions "
        "and medical evaluations remain strictly between patient and licensed genetics professionals."
    )

class AppointmentRequestCreate(BaseModel):
    counsellor_id: str
    patient_name: str
    patient_email: EmailStr
    patient_phone: Optional[str] = None
    consultation_purpose: str = "Family history assessment & pedigree review"
    preferred_date: str  # YYYY-MM-DD
    preferred_time_slot: str = "10:00 AM"
    time_zone: str = "America/Los_Angeles"
    consultation_format: str = "telehealth"  # telehealth, in_person
    intake_notes: Optional[str] = None
    consent_data_sharing: bool = True
    attached_report_ids: List[int] = []
    include_pedigree: bool = True
    doctor_prep_summary_id: Optional[str] = None

class AppointmentRequestResponse(BaseModel):
    id: str
    counsellor_id: str
    counsellor_name: str
    patient_name: str
    patient_email: str
    consultation_purpose: str
    preferred_date: str
    preferred_time_slot: str
    time_zone: str
    consultation_format: str
    telehealth_link: Optional[str] = None
    status: str  # pending, accepted, rejected, rescheduled, cancelled
    reschedule_reason: Optional[str] = None
    intake_notes: Optional[str] = None
    consent_data_sharing: bool
    audit_token: str
    created_at: datetime.datetime
    pre_consultation_instructions: List[str] = [
        "Please ensure a stable internet connection and quiet private room for confidential discussion.",
        "Have prior laboratory results or genetic panel reports accessible for screen review.",
        "Prepare documentation on ages of onset for any reported family health conditions.",
        "Your video room link requires authenticated sign-in under your GeneWise account."
    ]

    model_config = ConfigDict(from_attributes=True)

class AppointmentStatusUpdate(BaseModel):
    status: str  # accepted, rejected, rescheduled, cancelled
    reschedule_date: Optional[str] = None
    reschedule_time: Optional[str] = None
    reason: Optional[str] = None

class DoctorPrepRequest(BaseModel):
    counselor_id: Optional[str] = None
    consultation_purpose: str
    selected_goals: List[str] = []
    family_conditions: List[Dict[str, Any]] = []
    relevant_genes: List[str] = []
    attached_report_ids: List[int] = []
    include_saved_pedigree: bool = True
    patient_notes: Optional[str] = None

class DoctorPrepResponse(BaseModel):
    id: str
    consultation_purpose: str
    family_history_overview: str
    questions_to_ask: List[str]
    documents_to_bring: List[str]
    screening_topics: List[str]
    missing_information: List[str]
    important_uncertainties: List[str]
    suggested_counselor_specialty: str
    suggested_counselor_ids: List[str] = []
    disclaimer: str = (
        "This preparation summary is an educational guide generated to help you organize relevant medical "
        "history and questions. It does NOT provide a genetic diagnosis or definitive disease probability."
    )
    created_at: datetime.datetime

class CounselorMatchRequest(BaseModel):
    specialty: Optional[str] = None
    gene_loci: List[str] = []
    conditions: List[str] = []
    location: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    telehealth_only: bool = False

class AdminVerifyCredentialRequest(BaseModel):
    status: str  # verified, pending, unverified, expired
    reviewer_name: str
    review_notes: str
    new_expiry_date: Optional[datetime.datetime] = None

class AdminCreateCounselorRequest(BaseModel):
    full_name: str
    title: str
    professional_title: str
    primary_specialty: str
    subspecialties: List[str] = []
    qualification: str
    certification_org: str
    registration_number: str
    verification_status: str = "verified"
    institution: str
    city: str
    state_province: str
    country: str = "United States"
    practice_location: str
    languages: List[str] = ["English"]
    telehealth_available: bool = True
    consultation_availability: str = "Next available: 4 business days"
    experience_years: int = 10
    fee_structure: str = "Accepts Most Major Insurances · Self-Pay Available"
    bio: str
    target_loci: List[str] = []
    target_conditions: List[str] = []
    services_offered: List[str] = []
