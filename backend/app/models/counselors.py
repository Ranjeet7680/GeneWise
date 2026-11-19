import datetime
import uuid
from typing import Any, Dict, List, Optional
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

class GeneticCounselorModel(Base):
    __tablename__ = "directory_counselors"

    id = Column(String(100), primary_key=True, default=lambda: f"cgc-{uuid.uuid4().hex[:8]}")
    full_name = Column(String(255), nullable=False, index=True)
    title = Column(String(150), nullable=False)  # e.g., Senior Cardiovascular Genetic Counselor
    professional_title = Column(String(100), nullable=False)  # e.g., MS, CGC / MD, DM
    primary_specialty = Column(String(100), nullable=False, index=True)
    subspecialties = Column(JSON, default=list)  # ["Cardiogenetics", "Clinical Genomics"]
    credentials_display = Column(String(255), nullable=False)  # ABGC Board Certified · Lic #GC-49102
    qualification = Column(String(200), nullable=False)  # MS in Genetic Counseling, Stanford University
    certification_org = Column(String(150), nullable=False)  # ABGC / NSGC / BGCI / GCRB / EBMG
    registration_number = Column(String(100), nullable=False, index=True)  # CGC-49102
    verification_status = Column(String(50), default="verified", index=True)  # verified, pending, unverified, expired
    verification_source = Column(String(255), nullable=True)  # Official ABGC Registry / BGCI Directory
    verification_date = Column(DateTime, nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    verification_reviewer = Column(String(150), nullable=True)
    institution = Column(String(255), nullable=False, index=True)
    department = Column(String(200), nullable=True)
    city = Column(String(100), nullable=False, index=True)
    state_province = Column(String(100), nullable=False)
    country = Column(String(100), default="United States", index=True)
    practice_location = Column(String(255), nullable=False)  # Palo Alto, CA (Licensed in CA, NY, TX, FL)
    languages = Column(JSON, default=lambda: ["English"])  # ["English", "Mandarin"]
    telehealth_available = Column(Boolean, default=True, index=True)
    consultation_availability = Column(String(150), default="Next available: 4 business days")
    waitlist_days = Column(Integer, default=4)
    experience_years = Column(Integer, default=10)
    fee_structure = Column(String(255), default="Accepts Most Major Insurances · Self-Pay Available")
    avatar_url = Column(String(255), nullable=True)
    bio = Column(Text, nullable=False)
    target_loci = Column(JSON, default=list)  # ["FBN1", "TGFBR1", "LDLR", "APOB", "PCSK9"]
    target_conditions = Column(JSON, default=list)  # ["Marfan Syndrome", "Familial Hypercholesterolemia"]
    services_offered = Column(JSON, default=list)  # ["3-Gen Pedigree Review", "Carrier Screening", ...]
    consultation_modes = Column(JSON, default=lambda: ["Telehealth Video", "In-Person Clinic"])
    is_active = Column(Boolean, default=True)
    is_demo_provider = Column(Boolean, default=True)  # Clearly designates demonstration data
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    credentials = relationship("CounselorCredentialModel", back_populates="counselor", cascade="all, delete-orphan")
    verification_history = relationship("CounselorVerificationHistoryModel", back_populates="counselor", cascade="all, delete-orphan")
    appointments = relationship("AppointmentRequestModel", back_populates="counselor", cascade="all, delete-orphan")
    saved_by = relationship("SavedCounselorModel", back_populates="counselor", cascade="all, delete-orphan")

class CounselorCredentialModel(Base):
    __tablename__ = "counselor_credentials"

    id = Column(Integer, primary_key=True, index=True)
    counselor_id = Column(String(100), ForeignKey("directory_counselors.id", ondelete="CASCADE"), nullable=False, index=True)
    credential_type = Column(String(100), nullable=False)  # Board Certification, State License, Academic Degree
    issuer_org = Column(String(200), nullable=False)  # ABGC, BGCI, Medical Board of California
    credential_id = Column(String(100), nullable=False)
    status = Column(String(50), default="verified")  # verified, pending, unverified, expired
    country = Column(String(100), default="United States")
    issued_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    verification_source_url = Column(String(500), nullable=True)
    evidence_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    counselor = relationship("GeneticCounselorModel", back_populates="credentials")

class CounselorVerificationHistoryModel(Base):
    __tablename__ = "counselor_verification_history"

    id = Column(Integer, primary_key=True, index=True)
    counselor_id = Column(String(100), ForeignKey("directory_counselors.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    reviewed_by = Column(String(150), nullable=False)  # Admin user or credential committee
    review_notes = Column(Text, nullable=True)
    audit_hash = Column(String(64), nullable=True)  # SHA256 of review packet
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    counselor = relationship("GeneticCounselorModel", back_populates="verification_history")

class AppointmentRequestModel(Base):
    __tablename__ = "appointment_requests"

    id = Column(String(100), primary_key=True, default=lambda: f"apt-{uuid.uuid4().hex[:10]}")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    counsellor_id = Column(String(100), ForeignKey("directory_counselors.id", ondelete="RESTRICT"), nullable=False, index=True)
    patient_name = Column(String(255), nullable=False)
    patient_email = Column(String(255), nullable=False)
    patient_phone = Column(String(50), nullable=True)
    consultation_purpose = Column(String(255), nullable=False)  # Family history assessment, carrier screening, etc.
    preferred_date = Column(String(50), nullable=False)  # YYYY-MM-DD
    preferred_time_slot = Column(String(50), nullable=False)  # e.g. "10:30 AM"
    time_zone = Column(String(100), default="UTC")
    consultation_format = Column(String(50), default="telehealth")  # telehealth, in_person
    telehealth_link = Column(String(500), nullable=True)  # Protected video room URL
    status = Column(String(50), default="pending", index=True)  # pending, accepted, rejected, rescheduled, cancelled
    reschedule_reason = Column(String(255), nullable=True)
    intake_notes = Column(Text, nullable=True)
    consent_data_sharing = Column(Boolean, default=False)
    attached_report_ids = Column(JSON, default=list)  # [1, 4]
    include_pedigree = Column(Boolean, default=True)
    doctor_prep_summary_id = Column(String(100), nullable=True)
    audit_token = Column(String(100), nullable=True)  # HMAC token for confirmation
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    counselor = relationship("GeneticCounselorModel", back_populates="appointments")

class SavedCounselorModel(Base):
    __tablename__ = "saved_counselors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    counselor_id = Column(String(100), ForeignKey("directory_counselors.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_at = Column(DateTime, default=datetime.datetime.utcnow)

    counselor = relationship("GeneticCounselorModel", back_populates="saved_by")

class ConsultationPreparationModel(Base):
    __tablename__ = "consultation_preparations"

    id = Column(String(100), primary_key=True, default=lambda: f"prep-{uuid.uuid4().hex[:10]}")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    counselor_id = Column(String(100), nullable=True)
    consultation_purpose = Column(String(200), nullable=False)
    selected_goals = Column(JSON, default=list)
    family_history_data = Column(JSON, default=dict)
    relevant_genes = Column(JSON, default=list)
    attached_document_ids = Column(JSON, default=list)
    generated_brief = Column(JSON, nullable=False)  # { summary, questions_to_ask, documents_to_bring, screening_topics, missing_info, uncertainties }
    is_shared_with_counselor = Column(Boolean, default=False)
    shared_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
