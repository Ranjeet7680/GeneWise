import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

# ----------------- Condition Schemas -----------------
class FamilyConditionBase(BaseModel):
    condition_name: str
    category: Optional[str] = "General"
    icd10_code: Optional[str] = None
    age_at_diagnosis: Optional[str] = None
    is_genetic: Optional[bool] = False
    suspected_inheritance: Optional[str] = "Unknown"
    verification_level: Optional[str] = "Family Reported"
    clinical_details: Optional[str] = None

class FamilyConditionCreate(FamilyConditionBase):
    member_id: str

class FamilyConditionOut(FamilyConditionBase):
    id: int
    member_id: str
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Member Schemas -----------------
class FamilyMemberBase(BaseModel):
    name: Optional[str] = None
    relationship_to_proband: str
    generation: int = Field(default=2, ge=1, le=4)
    branch: str = "Immediate"  # Paternal, Maternal, Immediate
    gender: str = "unspecified"  # male, female, other, unspecified
    biological_relationship: bool = True
    is_proband: bool = False
    is_deceased: bool = False
    is_carrier: bool = False
    current_age: Optional[str] = None
    age_at_death: Optional[str] = None
    cause_of_death: Optional[str] = None
    history_status: str = "known"  # known, incomplete, unknown, adopted
    clinical_notes: Optional[str] = None

class FamilyMemberCreate(FamilyMemberBase):
    id: Optional[str] = None
    conditions: Optional[List[FamilyConditionBase]] = []

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relationship_to_proband: Optional[str] = None
    generation: Optional[int] = None
    branch: Optional[str] = None
    gender: Optional[str] = None
    biological_relationship: Optional[bool] = None
    is_proband: Optional[bool] = None
    is_deceased: Optional[bool] = None
    is_carrier: Optional[bool] = None
    current_age: Optional[str] = None
    age_at_death: Optional[str] = None
    cause_of_death: Optional[str] = None
    history_status: Optional[str] = None
    clinical_notes: Optional[str] = None

class FamilyMemberOut(FamilyMemberBase):
    id: str
    group_id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    conditions: List[FamilyConditionOut] = []
    model_config = ConfigDict(from_attributes=True)

# ----------------- Relationship Schemas -----------------
class FamilyRelationshipCreate(BaseModel):
    from_member_id: str
    to_member_id: str
    relationship_type: str  # parent_of, child_of, spouse_of, sibling_of
    is_biological: bool = True

class FamilyRelationshipOut(FamilyRelationshipCreate):
    id: int
    group_id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Tree Export -----------------
class FamilyTreeExportResponse(BaseModel):
    group_id: int
    family_name: str
    proband_name: str
    exported_at: str
    completeness_score: float
    members_count: int
    members: List[FamilyMemberOut]
    relationships: List[FamilyRelationshipOut]
    disclaimer: str

# ----------------- Genetic Test & Variants -----------------
class GeneticVariantBase(BaseModel):
    gene_symbol: str
    variant_hgvs: Optional[str] = None
    clinical_significance: str = "Uncertain Significance"
    zygosity: str = "Heterozygous"
    inheritance_pattern: str = "Autosomal Recessive"
    associated_condition: Optional[str] = None
    evidence_tier: str = "Tier II (Potential Clinical Significance)"
    evidence_source: Optional[str] = None
    notes: Optional[str] = None

class GeneticVariantCreate(GeneticVariantBase):
    test_record_id: int

class GeneticVariantOut(GeneticVariantBase):
    id: int
    test_record_id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class GeneticTestRecordBase(BaseModel):
    test_name: str
    test_type: str
    testing_laboratory: Optional[str] = None
    test_date: Optional[datetime.datetime] = None
    methodology: Optional[str] = None
    indication: Optional[str] = None
    overall_result: str = "Normal"
    clinician_notes: Optional[str] = None

class GeneticTestRecordCreate(GeneticTestRecordBase):
    member_id: Optional[str] = None
    variants: Optional[List[GeneticVariantBase]] = []

class GeneticTestRecordOut(GeneticTestRecordBase):
    id: int
    user_id: int
    member_id: Optional[str] = None
    created_at: datetime.datetime
    variants: List[GeneticVariantOut] = []
    model_config = ConfigDict(from_attributes=True)

# ----------------- Risk Intelligence Summary -----------------
class GeneticRiskSummaryOut(BaseModel):
    id: Optional[int] = None
    group_id: int
    summary_text: str
    educational_category: str  # Insufficient information, No clear pattern identified, Further discussion may be useful, Professional genetic evaluation suggested
    family_history_observations: List[Dict[str, Any]]
    relevant_condition_info: List[Dict[str, Any]]
    attention_rationale: str
    missing_information: List[str]
    suggested_clinician_questions: List[str]
    recommended_next_steps: List[str]
    evidence_references: List[Dict[str, Any]]
    data_quality_indicator: str
    disclaimer: str
    created_at: Optional[datetime.datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ----------------- Carrier Screening -----------------
class CarrierScreeningItemOut(BaseModel):
    id: int
    condition_name: str
    category: str
    gene_symbol: str
    inheritance_mode: str
    clinical_description: str
    who_should_consider: str
    screening_limitations: str
    residual_risk_explanation: str
    partner_testing_importance: str
    guideline_source: str
    guideline_url: Optional[str] = None
    last_reviewed_date: str
    model_config = ConfigDict(from_attributes=True)

# ----------------- Preconception Planner -----------------
class PreconceptionPlanUpdate(BaseModel):
    target_timeline: Optional[str] = None
    partner_history_completed: Optional[bool] = None
    partner_consented_sharing: Optional[bool] = None
    known_conditions_reviewed: Optional[bool] = None
    carrier_screening_discussed: Optional[bool] = None
    medications_reviewed: Optional[bool] = None
    vaccinations_reviewed: Optional[bool] = None
    counselling_scheduled: Optional[bool] = None
    custom_questions: Optional[List[str]] = None
    checklist_state: Optional[Dict[str, Any]] = None
    clinical_summary_notes: Optional[str] = None

class PreconceptionPlanOut(BaseModel):
    id: int
    user_id: int
    target_timeline: str
    partner_history_completed: bool
    partner_consented_sharing: bool
    known_conditions_reviewed: bool
    carrier_screening_discussed: bool
    medications_reviewed: bool
    vaccinations_reviewed: bool
    counselling_scheduled: bool
    custom_questions: Optional[List[str]] = None
    checklist_state: Optional[Dict[str, Any]] = None
    clinical_summary_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Counsellors & Referrals -----------------
class GeneticCounsellorOut(BaseModel):
    id: str
    full_name: str
    title: str
    specialty: str
    board_certification: str
    clinic_affiliation: str
    city: str
    state: str
    country: str
    telehealth_available: bool
    languages_spoken: Optional[List[str]] = None
    consultation_availability: str
    is_demo_provider: bool
    profile_bio: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SpecialistReferralCreate(BaseModel):
    counsellor_id: str
    referral_reason: str
    clinical_priority: Optional[str] = "Routine Educational Referral"
    consent_granted: bool = Field(..., description="Explicit user consent required before transmitting referral.")
    include_family_tree: bool = True
    include_genetic_tests: bool = True
    notes_for_specialist: Optional[str] = None

class SpecialistReferralOut(BaseModel):
    id: str
    user_id: int
    counsellor_id: str
    counsellor_name: Optional[str] = None
    specialty_requested: str
    referral_reason: str
    clinical_priority: str
    status: str
    consent_granted: bool
    consent_timestamp: Optional[datetime.datetime] = None
    scheduled_appointment_time: Optional[datetime.datetime] = None
    notes_for_specialist: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

# ----------------- Consent & Privacy -----------------
class ConsentToggleRequest(BaseModel):
    consent_type: str
    granted: bool

class ConsentItemOut(BaseModel):
    consent_type: str
    granted: bool
    version: str
    granted_at: Optional[datetime.datetime] = None
    revoked_at: Optional[datetime.datetime] = None

class ConsentStateOut(BaseModel):
    consents: List[ConsentItemOut]
    disclaimer: str

# ----------------- AI Genetic Assistant -----------------
class AIAssistantRequest(BaseModel):
    query: str
    conversation_id: Optional[int] = None
    language: Optional[str] = "en-US"
    include_pedigree_context: bool = True

class AIAssistantResponse(BaseModel):
    summary: str
    family_history_observations: List[str]
    possible_inheritance_patterns: List[str]
    educational_risk_category: str  # Insufficient information, No clear pattern identified, Further discussion may be useful, Professional genetic evaluation suggested
    evidence: List[Dict[str, str]]
    uncertainties: List[str]
    screening_discussion_options: List[str]
    professional_follow_up: List[str]
    medical_disclaimer: str
    audio_content_base64: Optional[str] = None
    language: str = "en-US"

# ----------------- Dashboard Overview -----------------
class OverviewDashboardOut(BaseModel):
    family_members_count: int
    family_history_completeness_pct: float
    known_conditions_count: int
    genetic_tests_count: int
    screening_discussions_completed: int
    pending_referrals_count: int
    educational_risk_level: str
    observed_patterns_count: int
    disclaimer: str
