import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = "patient"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    mfa_enabled: bool = False
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class PhoneOTPRequest(BaseModel):
    phone: str
    country_code: Optional[str] = "+1"

class PhoneOTPResponse(BaseModel):
    message: str
    otp_preview: str
    expires_in: int = 300

class PhoneOTPVerify(BaseModel):
    phone: str
    otp: str

# --- Security Architecture v2.0 Schemas ---
class MFAEnrollResponse(BaseModel):
    secret: str
    otpauth_url: str
    backup_codes: List[str]
    message: str = "Scan QR code or enter secret into your authenticator app (Google Authenticator, Authy, Supabase)."

class MFAVerifyRequest(BaseModel):
    code: str

class MFAAuthRequest(BaseModel):
    mfa_token: str
    code: str

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class EmailVerificationConfirm(BaseModel):
    token: str

class UserSessionResponse(BaseModel):
    id: int
    user_id: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime.datetime
    expires_at: datetime.datetime
    last_activity_at: Optional[datetime.datetime] = None
    is_active: bool
    is_current: bool = False

    model_config = ConfigDict(from_attributes=True)

class SuspiciousActivityResponse(BaseModel):
    id: int
    threat_type: str
    severity: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    resolved: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- AI Assistant & Conversations ---
class MessageSource(BaseModel):
    title: str
    journal_or_org: Optional[str] = None
    year: Optional[int] = None
    pmid: Optional[str] = None
    url: Optional[str] = None
    evidence_level: Optional[str] = "Clinical Evidence"

class MessageCreate(BaseModel):
    content: str
    provider: Optional[str] = None  # gemini, openai, local, clinical_evidence
    report_attachment_id: Optional[int] = None

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    safety_alerts: Optional[List[str]] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Medical Consultation"

class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    last_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []

class ProviderStatusResponse(BaseModel):
    current_provider: str
    providers: Dict[str, Dict[str, Any]]

# --- Advanced AI Medical Assistant Upgrade Schemas ---
class SymptomCheckRequest(BaseModel):
    primary_symptom: str = Field(..., description="Chief complaint or primary symptom description")
    duration: Optional[str] = Field("few days", description="Duration of symptom (e.g., '2 days', '3 weeks')")
    severity: int = Field(5, ge=1, le=10, description="Severity score from 1 (mild) to 10 (unbearable)")
    associated_symptoms: Optional[List[str]] = Field(default_factory=list, description="Secondary or related symptoms")
    relevant_medical_history: Optional[List[str]] = Field(default_factory=list, description="Pre-existing conditions or diagnoses")
    current_medications: Optional[List[str]] = Field(default_factory=list, description="Currently prescribed or OTC medications")
    user_age: Optional[int] = Field(None, ge=0, le=125, description="Patient age in years")
    user_biological_sex: Optional[str] = Field(None, description="Biological sex (male, female, other)")

class SymptomCheckResponse(BaseModel):
    triage_level: str
    urgency_explanation: str
    red_flags_detected: List[str] = []
    possible_considerations: List[str] = []
    evidence_sources: List[Dict[str, Any]] = []
    suggested_doctor_questions: List[str] = []
    self_care_precautions: List[str] = []
    emergency_contacts: Dict[str, str] = {}
    statutory_disclaimer: str

class MedicationEducationRequest(BaseModel):
    medication_name: str = Field(..., description="Generic or brand name of medication")
    dosage: Optional[str] = Field(None, description="Reported dosage (for context only, no dose adjustment)")
    current_conditions: Optional[List[str]] = Field(default_factory=list, description="Patient medical conditions for precautions")
    other_medications: Optional[List[str]] = Field(default_factory=list, description="Concurrent medications for interaction screening")

class MedicationEducationResponse(BaseModel):
    medication_name: str
    generic_name: str
    drug_class: str
    primary_uses: List[str]
    mechanism_of_action: str
    common_side_effects: List[str]
    serious_side_effects_warning: List[str]
    precautions_and_warnings: List[str]
    potential_interactions: List[Dict[str, str]]
    food_and_lifestyle_interactions: List[str]
    questions_for_pharmacist_or_doctor: List[str]
    citations: List[Dict[str, Any]]
    non_prescribing_disclaimer: str

class AuthorizedHealthContextResponse(BaseModel):
    user_id: int
    consent_status: Dict[str, bool]
    recent_reports: List[Dict[str, Any]] = []
    vitals_summary: Dict[str, Any] = {}
    wearables_telemetry: Optional[Dict[str, Any]] = None
    family_history_summary: List[Dict[str, Any]] = []
    genetic_predispositions: List[Dict[str, Any]] = []
    active_medications: List[str] = []
    data_minimization_note: str

class ConsultationSummaryRequest(BaseModel):
    counsellor_id: Optional[Union[str, int]] = None
    specialty_requested: str = Field("General Medicine", description="Medical or genetic specialty requested")
    referral_reason: str = Field(..., description="Chief complaint or reason for specialist referral")
    clinical_priority: Optional[str] = Field("routine", description="Urgency: routine, urgent, emergent")
    include_family_tree: bool = Field(True, description="Consent to share pedigree & family conditions")
    include_genetic_tests: bool = Field(True, description="Consent to share genetic variant summaries")
    include_recent_vitals: bool = Field(True, description="Consent to share recent physiological measurements")
    include_medications: bool = Field(True, description="Consent to share active medications")
    consent_granted: bool = Field(True, description="Mandatory affirmative consent token")
    notes_for_specialist: Optional[str] = Field(None, description="Patient-authored notes or questions")

class ConsultationSummaryResponse(BaseModel):
    referral_id: Optional[Union[str, int]] = None
    patient_summary: Dict[str, Any]
    chief_complaint_and_history: str
    relevant_family_and_genetic_findings: List[str] = []
    key_biomarkers_and_vitals: List[Dict[str, Any]] = []
    prepared_clinical_discussion_points: List[str] = []
    consent_audit_token: str
    statutory_disclaimer: str

# --- Laboratory Reports & Measurements ---
class LaboratoryMeasurementBase(BaseModel):
    test_name: str
    category: Optional[str] = "General Biochemistry"
    value: float
    unit: str
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    reference_text: Optional[str] = None
    is_abnormal: Optional[bool] = False
    flag: Optional[str] = "normal"
    confidence: Optional[float] = 0.95
    user_verified: Optional[bool] = False
    original_value: Optional[float] = None
    original_unit: Optional[str] = None
    previous_value: Optional[float] = None
    change_pct: Optional[float] = None
    verification_status: Optional[str] = "pending"
    verified_by: Optional[str] = None
    verified_at: Optional[datetime.datetime] = None
    notes: Optional[str] = None

class LaboratoryMeasurementUpdate(BaseModel):
    test_name: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    reference_text: Optional[str] = None
    user_verified: Optional[bool] = True
    flag: Optional[str] = None
    verification_status: Optional[str] = None
    notes: Optional[str] = None

class LaboratoryMeasurementResponse(LaboratoryMeasurementBase):
    id: int
    report_id: int

    model_config = ConfigDict(from_attributes=True)

class MedicalReportCreate(BaseModel):
    title: str
    report_type: Optional[str] = "Comprehensive Blood Analysis"
    report_date: Optional[datetime.datetime] = None
    summary: Optional[str] = None

class MedicalReportResponse(BaseModel):
    id: int
    user_id: int
    title: str
    report_type: str
    report_date: datetime.datetime
    status: str
    file_name: Optional[str] = None
    summary: Optional[str] = None
    ai_interpretation: Optional[str] = None
    extraction_confidence: float
    requires_verification: bool
    created_at: datetime.datetime
    measurement_count: Optional[int] = 0
    abnormal_count: Optional[int] = 0
    laboratory_name: Optional[str] = "Metropolis Reference Laboratory"
    patient_mrn: Optional[str] = "MRN-92041"
    triage_priority: Optional[str] = "routine"
    clinician_status: Optional[str] = "pending"
    clinician_notes: Optional[str] = None
    clinician_reviewed_at: Optional[datetime.datetime] = None
    audit_token: Optional[str] = None
    escalation_reason: Optional[str] = None
    escalation_department: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MedicalReportDetailResponse(MedicalReportResponse):
    measurements: List[LaboratoryMeasurementResponse] = []

class ReportAnalysisResponse(BaseModel):
    report_id: int
    summary: str
    ai_interpretation: str
    key_findings: List[str]
    potential_abnormalities: List[str]
    clinical_disclaimer: str
    report_date: Optional[str] = None
    normal_measurements_count: Optional[int] = 0
    abnormal_measurements_count: Optional[int] = 0
    important_limitations: Optional[List[str]] = []
    doctor_questions: Optional[List[str]] = []
    evidence_references: Optional[List[Dict[str, Any]]] = []
    professional_follow_up: Optional[List[str]] = []

# --- Health Measurements (Trends) ---
class HealthMeasurementCreate(BaseModel):
    metric_type: str  # blood_pressure, blood_glucose, heart_rate, hba1c, bmi, weight
    value: float
    secondary_value: Optional[float] = None
    unit: str
    recorded_at: Optional[datetime.datetime] = None
    source: Optional[str] = "Manual Entry"
    notes: Optional[str] = None

class HealthMeasurementUpdate(BaseModel):
    value: Optional[float] = None
    secondary_value: Optional[float] = None
    unit: Optional[str] = None
    recorded_at: Optional[datetime.datetime] = None
    notes: Optional[str] = None

class HealthMeasurementResponse(HealthMeasurementCreate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class HealthMetricSummary(BaseModel):
    metric_type: str
    unit: str
    latest_value: float
    latest_secondary: Optional[float] = None
    latest_date: datetime.datetime
    min_value: float
    max_value: float
    average: float
    status: str  # normal, elevated, low, critical

class CareRelationshipRequest(BaseModel):
    patient_id: int
    relationship_type: Optional[str] = "direct_care"
    clinical_rationale: Optional[str] = "Direct clinical evaluation agreement"
    notes: Optional[str] = None
    duration_days: Optional[int] = 30

# --- Research, Diseases & Genetics ---
class DiseaseConditionResponse(BaseModel):
    id: int
    name: str
    specialty: str
    summary: str
    symptoms: Optional[List[str]] = None
    risk_factors: Optional[List[str]] = None
    diagnostic_tests: Optional[List[str]] = None
    clinical_guidelines: Optional[str] = None
    last_reviewed: datetime.datetime
    pmid_references: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)

class GeneAssociationResponse(BaseModel):
    id: int
    gene_symbol: str
    gene_name: str
    chromosome: Optional[str] = None
    inheritance_pattern: Optional[str] = None
    associated_condition: str
    doid: Optional[str] = None
    omim_id: Optional[str] = None
    pmid: Optional[str] = None
    description: str
    clinical_uncertainty_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MedicalReferenceResponse(BaseModel):
    id: int
    title: str
    authors: Optional[str] = None
    journal: Optional[str] = None
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None
    abstract: Optional[str] = None
    key_findings: Optional[str] = None
    category: str
    evidence_level: str
    url: Optional[str] = None
    is_bookmarked: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class BookmarkCreate(BaseModel):
    reference_id: int
    notes: Optional[str] = None

class BookmarkResponse(BaseModel):
    id: int
    user_id: int
    reference_id: int
    notes: Optional[str] = None
    created_at: datetime.datetime
    reference: Optional[MedicalReferenceResponse] = None

    model_config = ConfigDict(from_attributes=True)

# --- Personal Health Records ---
class PersonalRecordCreate(BaseModel):
    title: str
    category: Optional[str] = "Clinical Consultation"
    record_date: Optional[datetime.datetime] = None
    doctor_or_facility: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None

class PersonalRecordResponse(PersonalRecordCreate):
    id: int
    user_id: int
    file_name: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Privacy & Consents ---
class ConsentUpdate(BaseModel):
    consent_type: str
    granted: bool

class ConsentResponse(BaseModel):
    id: int
    consent_type: str
    granted: bool
    version: str
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class PrivacyExportResponse(BaseModel):
    user_profile: Dict[str, Any]
    reports: List[Dict[str, Any]]
    health_measurements: List[Dict[str, Any]]
    personal_records: List[Dict[str, Any]]
    conversations: List[Dict[str, Any]]
    consents: List[Dict[str, Any]]
    exported_at: datetime.datetime

# --- ML Risk Prediction ---
class CeliacRiskRequest(BaseModel):
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., description="Male or Female")
    diabetes: str = Field("No", description="Yes or No")
    diabetes_type: Optional[str] = Field("None", description="Type 1, Type 2, or None")
    diarrhoea: str = Field("no", description="inflammatory, fatty, watery, or no")
    abdominal_pain: str = Field("no", description="yes or no")
    short_stature: str = Field("no", description="PSS, Variant, or no")
    sticky_stool: str = Field("no", description="yes or no")
    weight_loss: str = Field("no", description="yes or no")
    iga: float = Field(..., description="Serum IgA in g/L")
    igg: float = Field(..., description="Serum IgG in g/L")
    igm: float = Field(..., description="Serum IgM in g/L")
    # Advanced clinical biomarkers
    anti_ttg_iga: Optional[float] = Field(None, description="Anti-tTG IgA in U/mL (Ref: < 10.0 U/mL)")
    total_iga: Optional[float] = Field(None, description="Total serum IgA in g/L (Ref: 0.8 - 3.0 g/L)")
    anti_dgp_igg: Optional[float] = Field(None, description="Anti-Deamidated Gliadin Peptide IgG in U/mL")
    ema_iga: Optional[str] = Field("not_tested", description="Endomysial Antibody (positive, negative, equivocal, not_tested)")
    # Advanced clinical symptoms & duration
    symptom_duration: Optional[str] = Field("chronic", description="<1_month, 1_to_6_months, chronic")
    gi_symptoms: Optional[List[str]] = Field(default_factory=list, description="Associated GI symptoms: bloating, nausea, etc.")
    # Family history & Genetics
    family_history_celiac: Optional[str] = Field("none", description="none, first_degree, second_degree")
    family_inherited_conditions: Optional[List[str]] = Field(default_factory=list)
    genetic_testing_hla: Optional[str] = Field("not_tested", description="positive_dq2_dq8, negative_both, not_tested")
    # Metadata & provenance
    ethnicity: Optional[str] = Field("general", description="Demographic/ethnic background")
    lab_measurement_date: Optional[str] = Field(None, description="ISO measurement date YYYY-MM-DD")
    lab_source: Optional[str] = Field(None, description="Laboratory source name")
    existing_diagnoses: Optional[List[str]] = Field(default_factory=list)

class CeliacRiskResponse(BaseModel):
    estimated_risk_probability: float
    risk_level: str  # Low, Moderate / Equivocal, Elevated Risk, High Probability, Insufficient Information
    predicted_classification: str
    confidence_interval: List[float]
    model_provenance: Dict[str, Any]
    contributing_factors: List[str]
    recommended_clinical_followup: List[str]
    disclaimer: str
    # Advanced Explainability & Clinical Architecture
    data_completeness: Optional[Dict[str, Any]] = None
    shap_explanations: Optional[List[Dict[str, Any]]] = None
    model_transparency: Optional[Dict[str, Any]] = None
    evidence_citations: Optional[List[Dict[str, Any]]] = None
    clinician_review: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

class ClinicianModelReviewRequest(BaseModel):
    review_status: str = Field(..., description="approved, rejected, or escalated")
    clinician_notes: str = Field(..., description="Clinical interpretation notes")
    reviewer_name: Optional[str] = Field("Dr. Elena Rostova, MD", description="Reviewing clinician name")
    escalation_department: Optional[str] = Field(None, description="Department for escalation, e.g. Gastroenterology")
    corrected_inputs: Optional[Dict[str, Any]] = Field(None, description="Any corrected input biomarkers")

class ClinicianModelReviewResponse(BaseModel):
    status: str
    review_id: str
    reviewed_at: str
    reviewer_name: str
    review_status: str
    clinician_notes: str
    escalation_department: Optional[str] = None
    audit_token: str
    disclaimer: str

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Clinician Workspace Schemas ---
class ClinicianReviewRequest(BaseModel):
    clinician_notes: str
    status: str = "approved"  # reviewed, approved, escalated, rejected
    escalation_reason: Optional[str] = None
    escalation_department: Optional[str] = None

class ClinicianSignOffRequest(BaseModel):
    clinician_notes: str
    decision: str = "approved"  # approved, reviewed, rejected, escalated
    reviewed_sections: List[str] = Field(default_factory=lambda: ["serology", "abnormal_flags", "patient_history"])
    attending_physician: str = "Dr. Elena Rostova, MD"
    department: Optional[str] = "Gastroenterology & Clinical Genetics"
    escalation_reason: Optional[str] = None
    escalation_department: Optional[str] = None

class ClinicianSignOffResponse(BaseModel):
    status: str
    report_id: int
    audit_token: str
    signed_off_at: datetime.datetime
    attending_physician: str
    decision: str
    message: str
    statutory_disclaimer: str = (
        "GeneWise AI Laboratory Analysis & Clinician CDS is an investigational decision-support tool. "
        "It is strictly for research and clinical education. It does NOT provide an independent diagnosis, "
        "does NOT prescribe treatments, and does NOT replace licensed clinician evaluation or clinical pathology consultation."
    )

class ClinicianReportResponse(MedicalReportDetailResponse):
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    patient_mrn: Optional[str] = "MRN-92041"
    laboratory_name: Optional[str] = "Metropolis Reference Laboratory"
    clinician_notes: Optional[str] = None
    clinician_status: Optional[str] = "pending"
    clinician_reviewed_at: Optional[datetime.datetime] = None
    triage_priority: Optional[str] = "routine"
    assigned_clinician: Optional[str] = "Dr. Elena Rostova, MD"
    review_deadline: Optional[str] = None
    escalation_reason: Optional[str] = None
    escalation_department: Optional[str] = None
    audit_token: Optional[str] = None

# --- Unified Search Schemas ---
class UnifiedSearchResult(BaseModel):
    category: str
    id: int
    title: str
    subtitle: Optional[str] = None
    link: str

# --- Admin Stats Schemas ---
class AdminStatsResponse(BaseModel):
    total_users: int
    total_reports: int
    total_measurements: int
    total_conversations: int
    total_audit_events: int
    database_status: str
    ai_provider: str

# --- Device & IoT Schemas ---
class DeviceBase(BaseModel):
    device_name: str
    device_type: str  # wearable, medical_sensor, iot_gateway, edge_device
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    mac_address: Optional[str] = None
    connection_protocol: Optional[str] = "https"
    device_metadata: Optional[Dict[str, Any]] = None

class DeviceCreate(DeviceBase):
    id: Optional[str] = None

class DeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    connection_status: Optional[str] = None
    battery_level: Optional[int] = None
    firmware_version: Optional[str] = None
    device_metadata: Optional[Dict[str, Any]] = None

class DeviceResponse(DeviceBase):
    id: str
    user_id: int
    connection_status: str
    last_seen: Optional[datetime.datetime] = None
    firmware_version: Optional[str] = None
    battery_level: Optional[int] = None
    is_active: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class DeviceStatusResponse(BaseModel):
    device_id: str
    connection_status: str
    last_seen: Optional[datetime.datetime] = None
    battery_level: Optional[int] = None
    uptime_seconds: Optional[int] = None
    active_stream: bool = False

# --- Unified Device Ingestion (Section 10 Standard) ---
class UnifiedSensorPayload(BaseModel):
    device_id: str
    user_id: Optional[Union[str, int]] = None
    measurement_type: str
    value: float
    secondary_value: Optional[float] = None
    unit: str
    timestamp: Optional[datetime.datetime] = None
    source: Optional[str] = "compatible_wearable"
    quality_status: Optional[str] = "unverified"
    metadata: Optional[Dict[str, Any]] = None

class UnifiedSensorBatchPayload(BaseModel):
    device_id: str
    measurements: List[UnifiedSensorPayload]

class SensorMeasurementResponse(BaseModel):
    id: int
    user_id: int
    device_id: Optional[str] = None
    measurement_type: str
    value: float
    secondary_value: Optional[float] = None
    unit: str
    timestamp: datetime.datetime
    source: str
    quality_status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class WearableMeasurementItem(BaseModel):
    metric_type: str
    value: float
    unit: str
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    source_record_id: Optional[str] = None

class WearableIngestionPayload(BaseModel):
    platform: str  # apple_health, health_connect, fitbit, garmin, wear_os
    device_id: Optional[str] = None
    records: List[WearableMeasurementItem]

class WearableMeasurementResponse(BaseModel):
    id: int
    user_id: int
    device_id: Optional[str] = None
    platform: str
    metric_type: str
    value: float
    unit: str
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    synced_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class IngestionResult(BaseModel):
    status: str
    ingested_count: int
    rejected_count: int
    duplicate_count: int
    quality_status: str
    message: str

# --- Analytics Schemas ---
class AnalyticsOverviewResponse(BaseModel):
    total_measurements: int
    active_devices_count: int
    average_heart_rate: Optional[float] = None
    latest_blood_pressure: Optional[str] = None
    latest_spo2: Optional[float] = None
    data_quality_score: float
    recent_anomalies_count: int
    timestamp: datetime.datetime

class DeviceHealthItem(BaseModel):
    device_id: str
    device_name: str
    device_type: str
    status: str
    battery_level: Optional[int]
    last_seen: Optional[datetime.datetime]
    data_points_24h: int
    error_rate: float

class DataQualityReport(BaseModel):
    overall_quality_percentage: float
    verified_points: int
    calibrated_points: int
    unverified_points: int
    flagged_outliers: int
    recommendations: List[str]

# --- Multi-Agent Schemas ---
class AgentRunRequest(BaseModel):
    agent_type: str = "supervisor"  # supervisor, medical_information, medical_report, health_monitoring, research, device_integration, healthcare_workflow
    task_description: str
    context: Optional[Dict[str, Any]] = None

class AgentRunResponse(BaseModel):
    id: str
    user_id: int
    agent_type: str
    task_description: str
    status: str
    result: Optional[Dict[str, Any]] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    human_review_required: bool = False
    human_review_notes: Optional[str] = None
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- ML Experiment Schemas ---
class MLExperimentCreate(BaseModel):
    model_name: str
    experiment_name: str
    dataset_name: str
    parameters: Optional[Dict[str, Any]] = None
    metrics: Dict[str, float]
    artifact_path: Optional[str] = None
    version: Optional[str] = "1.0.0"

class MLExperimentResponse(BaseModel):
    id: str
    model_name: str
    experiment_name: str
    dataset_name: str
    parameters: Optional[Dict[str, Any]] = None
    metrics: Dict[str, Any]
    artifact_path: Optional[str] = None
    version: str
    status: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

