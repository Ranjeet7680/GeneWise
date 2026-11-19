import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    family_name = Column(String(255), default="My Family Pedigree")
    proband_name = Column(String(255), default="Proband (Self)")
    consanguinity_reported = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    completeness_score = Column(Float, default=0.0)  # 0.0 to 100.0%
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    members = relationship("FamilyMemberModel", back_populates="group", cascade="all, delete-orphan")
    relationships = relationship("FamilyRelationshipModel", back_populates="group", cascade="all, delete-orphan")
    risk_summaries = relationship("GeneticRiskSummary", back_populates="group", cascade="all, delete-orphan")

class FamilyMemberModel(Base):
    __tablename__ = "family_members"

    id = Column(String(100), primary_key=True, index=True)  # e.g. "proband", "father", "mgf", or uuid
    group_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=True)
    relationship_to_proband = Column(String(100), nullable=False)  # self, father, mother, sister, brother, son, daughter, paternal_grandfather, etc.
    generation = Column(Integer, nullable=False, default=2)  # 1 (grandparents), 2 (parents), 3 (proband/siblings), 4 (children)
    branch = Column(String(50), nullable=False, default="Immediate")  # Paternal, Maternal, Immediate
    gender = Column(String(20), nullable=False, default="unspecified")  # male, female, other, unspecified
    biological_relationship = Column(Boolean, default=True)
    is_proband = Column(Boolean, default=False)
    is_deceased = Column(Boolean, default=False)
    is_carrier = Column(Boolean, default=False)
    current_age = Column(String(50), nullable=True)
    age_at_death = Column(String(50), nullable=True)
    cause_of_death = Column(String(255), nullable=True)
    history_status = Column(String(50), default="known")  # known, incomplete, unknown, adopted
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    group = relationship("FamilyGroup", back_populates="members")
    conditions = relationship("FamilyHealthConditionModel", back_populates="member", cascade="all, delete-orphan")
    genetic_tests = relationship("GeneticTestRecord", back_populates="member", cascade="all, delete-orphan")

class FamilyRelationshipModel(Base):
    __tablename__ = "family_relationships"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    from_member_id = Column(String(100), ForeignKey("family_members.id", ondelete="CASCADE"), nullable=False)
    to_member_id = Column(String(100), ForeignKey("family_members.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(50), nullable=False)  # parent_of, child_of, spouse_of, sibling_of
    is_biological = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    group = relationship("FamilyGroup", back_populates="relationships")

class FamilyHealthConditionModel(Base):
    __tablename__ = "family_health_conditions"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(String(100), ForeignKey("family_members.id", ondelete="CASCADE"), nullable=False, index=True)
    condition_name = Column(String(255), nullable=False)
    category = Column(String(100), default="General")  # Cardiovascular, Oncologic, Metabolic, Neurological, Hematologic
    icd10_code = Column(String(50), nullable=True)
    age_at_diagnosis = Column(String(50), nullable=True)
    is_genetic = Column(Boolean, default=False)
    suspected_inheritance = Column(String(100), nullable=True)  # Autosomal Dominant, Autosomal Recessive, X-Linked, Multifactorial, Unknown
    verification_level = Column(String(100), default="Family Reported")  # Medical Records, Clinically Confirmed, Death Certificate, Family Reported, Suspected
    clinical_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    member = relationship("FamilyMemberModel", back_populates="conditions")

class GeneticTestRecord(Base):
    __tablename__ = "genetic_test_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(String(100), ForeignKey("family_members.id", ondelete="CASCADE"), nullable=True, index=True)
    test_name = Column(String(255), nullable=False)
    test_type = Column(String(100), nullable=False)  # Carrier Screening, Diagnostic Sequencing, Pharmacogenomic, Whole Exome, Targeted Panel
    testing_laboratory = Column(String(255), nullable=True)
    test_date = Column(DateTime, nullable=True)
    methodology = Column(String(255), nullable=True)  # NGS, Sanger, MLPA, qPCR, Microarray
    indication = Column(Text, nullable=True)
    overall_result = Column(String(100), default="Normal")  # Positive / Variant Detected, Carrier Identified, Negative, VUS Detected
    clinician_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    member = relationship("FamilyMemberModel", back_populates="genetic_tests")
    variants = relationship("GeneticVariant", back_populates="test_record", cascade="all, delete-orphan")

class GeneticVariant(Base):
    __tablename__ = "genetic_variants"

    id = Column(Integer, primary_key=True, index=True)
    test_record_id = Column(Integer, ForeignKey("genetic_test_records.id", ondelete="CASCADE"), nullable=False, index=True)
    gene_symbol = Column(String(50), nullable=False, index=True)  # e.g. HBB, CFTR, BRCA1, SMN1
    variant_hgvs = Column(String(255), nullable=True)  # e.g. c.521A>G, p.Glu7Val
    clinical_significance = Column(String(100), default="Uncertain Significance")  # Pathogenic, Likely Pathogenic, Variant of Uncertain Significance (VUS), Likely Benign, Benign
    zygosity = Column(String(50), default="Heterozygous")  # Heterozygous, Homozygous, Hemizygous
    inheritance_pattern = Column(String(100), default="Autosomal Recessive")  # Autosomal Dominant, Autosomal Recessive, X-linked
    associated_condition = Column(String(255), nullable=True)
    evidence_tier = Column(String(100), default="Tier II (Potential Clinical Significance)")
    evidence_source = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    test_record = relationship("GeneticTestRecord", back_populates="variants")

class InheritanceObservation(Base):
    __tablename__ = "inheritance_observations"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    condition_name = Column(String(255), nullable=False)
    observed_pattern = Column(String(100), nullable=False)  # Autosomal Dominant Pattern, Autosomal Recessive Flag, X-Linked Recessive Pattern, Incomplete Pedigree
    affected_members_count = Column(Integer, default=1)
    generations_spanned = Column(Integer, default=1)
    transmission_branch = Column(String(50), default="Maternal & Paternal")  # Maternal, Paternal, Both
    confidence_level = Column(String(50), default="Moderate (Educational Observation)")
    reason_for_attention = Column(Text, nullable=False)
    missing_data_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CarrierScreeningInfo(Base):
    __tablename__ = "carrier_screening_information"

    id = Column(Integer, primary_key=True, index=True)
    condition_name = Column(String(255), nullable=False, unique=True, index=True)
    category = Column(String(100), nullable=False)  # Hemoglobinopathy, Cystic Fibrosis, Spinal Muscular Atrophy, Inborn Error of Metabolism, Expanded Panel
    gene_symbol = Column(String(50), nullable=False)
    inheritance_mode = Column(String(100), default="Autosomal Recessive")
    clinical_description = Column(Text, nullable=False)
    who_should_consider = Column(Text, nullable=False)
    screening_limitations = Column(Text, nullable=False)
    residual_risk_explanation = Column(Text, nullable=False)
    partner_testing_importance = Column(Text, nullable=False)
    guideline_source = Column(String(255), nullable=False)  # ACOG, ACMG, CDC, MedlinePlus
    guideline_url = Column(String(500), nullable=True)
    last_reviewed_date = Column(String(50), default="2026-06")

class PreconceptionPlan(Base):
    __tablename__ = "preconception_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_timeline = Column(String(100), default="Planning within 6-12 months")
    partner_history_completed = Column(Boolean, default=False)
    partner_consented_sharing = Column(Boolean, default=False)
    known_conditions_reviewed = Column(Boolean, default=False)
    carrier_screening_discussed = Column(Boolean, default=False)
    medications_reviewed = Column(Boolean, default=False)
    vaccinations_reviewed = Column(Boolean, default=False)
    counselling_scheduled = Column(Boolean, default=False)
    custom_questions = Column(JSON, nullable=True)  # List of string questions
    checklist_state = Column(JSON, nullable=True)  # Detailed task dictionary
    clinical_summary_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class GeneticRiskSummary(Base):
    __tablename__ = "genetic_risk_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    group_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    summary_text = Column(Text, nullable=False)
    educational_category = Column(String(100), nullable=False)  # Insufficient information, No clear pattern identified, Further discussion may be useful, Professional genetic evaluation suggested
    family_history_observations = Column(JSON, nullable=False)  # List of observation objects
    relevant_condition_info = Column(JSON, nullable=False)
    attention_rationale = Column(Text, nullable=False)
    missing_information = Column(JSON, nullable=False)  # List of missing fields/lineage gaps
    suggested_clinician_questions = Column(JSON, nullable=False)
    recommended_next_steps = Column(JSON, nullable=False)
    evidence_references = Column(JSON, nullable=False)  # List of citation objects
    data_quality_indicator = Column(String(50), default="Moderate Completeness (Educational Only)")
    disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    group = relationship("FamilyGroup", back_populates="risk_summaries")

class GeneticEvidenceSource(Base):
    __tablename__ = "genetic_evidence_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False, index=True)  # MedlinePlus Genetics, GeneReviews, NHGRI, CDC Genomics, PubMed
    reference_title = Column(String(500), nullable=False)
    topic_category = Column(String(100), nullable=False)  # Inheritance, Carrier Screening, Variant Interpretation, Guidelines
    publication_date = Column(String(50), nullable=True)
    url = Column(String(500), nullable=True)
    evidence_tier = Column(String(100), default="Clinical Practice Guideline / Peer Reviewed")
    limitations = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GeneticCounsellor(Base):
    __tablename__ = "genetic_counsellors"

    id = Column(String(100), primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    title = Column(String(100), nullable=False)  # MS, CGC / Clinical Geneticist, MD
    specialty = Column(String(100), nullable=False, index=True)  # Certified Genetic Counsellor, Clinical Geneticist, Reproductive Medicine, Maternal-Fetal Medicine
    board_certification = Column(String(255), nullable=False)  # ABGC, ACMG, etc.
    clinic_affiliation = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    country = Column(String(100), default="India")
    telehealth_available = Column(Boolean, default=True)
    languages_spoken = Column(JSON, nullable=True)  # ["English", "Hindi", "Tamil", etc.]
    consultation_availability = Column(String(100), default="Next available: 2 business days")
    is_demo_provider = Column(Boolean, default=True)  # Clearly distinguishes simulated directory from live EHR
    profile_bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    referrals = relationship("SpecialistReferral", back_populates="counsellor")

class SpecialistReferral(Base):
    __tablename__ = "specialist_referrals"

    id = Column(String(100), primary_key=True, index=True)  # ref_uuid
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    counsellor_id = Column(String(100), ForeignKey("genetic_counsellors.id", ondelete="RESTRICT"), nullable=False, index=True)
    specialty_requested = Column(String(100), nullable=False)
    referral_reason = Column(String(255), nullable=False)  # Family history review, preconception carrier screening, abnormal test follow-up
    clinical_priority = Column(String(50), default="Routine Educational Referral")
    status = Column(String(50), default="Requested")  # Requested, Consent Confirmed, Transmitted, Scheduled, Completed, Cancelled
    consent_granted = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime, nullable=True)
    include_family_tree = Column(Boolean, default=True)
    include_genetic_tests = Column(Boolean, default=True)
    scheduled_appointment_time = Column(DateTime, nullable=True)
    secure_referral_summary = Column(JSON, nullable=True)  # Sanitized payload prepared for clinician
    notes_for_specialist = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    counsellor = relationship("GeneticCounsellor", back_populates="referrals")

class GeneticDataConsent(Base):
    __tablename__ = "genetic_data_consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consent_type = Column(String(100), nullable=False, index=True)  # family_history_analysis, carrier_screening_education, partner_data_sharing, referral_data_transfer, research_anonymized
    granted = Column(Boolean, default=False)
    version = Column(String(20), default="1.0")
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    granted_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
