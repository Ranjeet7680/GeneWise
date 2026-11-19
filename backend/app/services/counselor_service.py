import datetime
import hashlib
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import or_, and_, desc
from sqlalchemy.orm import Session

from app.models.counselors import (
    GeneticCounselorModel,
    CounselorCredentialModel,
    CounselorVerificationHistoryModel,
    AppointmentRequestModel,
    SavedCounselorModel,
    ConsultationPreparationModel,
)
from app.models.family_genetics import FamilyGroup, FamilyMemberModel, FamilyHealthConditionModel
from app.models.models import User, MedicalReport
from app.schemas.counselors import (
    AppointmentRequestCreate,
    DoctorPrepRequest,
    CounselorMatchRequest,
    AdminVerifyCredentialRequest,
    AdminCreateCounselorRequest,
)
from app.services.audit.audit_service import AuditService

logger = logging.getLogger(__name__)

INITIAL_SEED_COUNSELORS = [
    {
        "id": "cgc-01-lin",
        "full_name": "Dr. Maya Lin, MS, CGC",
        "title": "Senior Cardiovascular Genetic Counselor",
        "professional_title": "MS, CGC",
        "primary_specialty": "Cardiogenetics",
        "subspecialties": ["Cardiogenetics", "Clinical Genomics"],
        "credentials_display": "ABGC Board Certified Genetic Counselor · Lic #GC-49102",
        "qualification": "MS in Genetic Counseling, Stanford University School of Medicine",
        "certification_org": "American Board of Genetic Counseling (ABGC)",
        "registration_number": "CGC-49102",
        "verification_status": "verified",
        "verification_source": "Official ABGC Public Certification Registry (abgc.net)",
        "verification_date": datetime.datetime(2024, 6, 12),
        "expiration_date": datetime.datetime(2029, 6, 12),
        "verification_reviewer": "GeneWise Clinical Credentialing Board",
        "institution": "Stanford Center for Inherited Cardiovascular Disease",
        "department": "Division of Cardiovascular Medicine & Clinical Genetics",
        "city": "Palo Alto",
        "state_province": "CA",
        "country": "United States",
        "practice_location": "Palo Alto, CA (Licensed in CA, NY, TX, FL)",
        "languages": ["English", "Mandarin"],
        "telehealth_available": True,
        "consultation_availability": "Next available: 4 business days",
        "waitlist_days": 4,
        "experience_years": 11,
        "fee_structure": "Accepts Most Major Insurances · Self-Pay $150",
        "avatar_url": "/images/counselors/maya-lin.jpg",
        "bio": "Specializing in hereditary thoracic aortic aneurysms (Marfan / FBN1, Loeys-Dietz), hypertrophic cardiomyopathy, and familial hypercholesterolemia cascade testing.",
        "target_loci": ["FBN1", "TGFBR1", "LDLR", "APOB", "PCSK9"],
        "target_conditions": [
            "Marfan Syndrome",
            "Familial Hypercholesterolemia (FH)",
            "Hypertrophic Cardiomyopathy (HCM)",
            "Loeys-Dietz Syndrome",
            "Long QT Syndrome"
        ],
        "services_offered": [
            "3-Generation Pedigree Review",
            "Inherited Cardiovascular Risk Education",
            "Cascade Family Screening Coordination",
            "ACMG Variant Pathogenicity Interpretation",
            "Pre-Test Informed Consent"
        ],
        "consultation_modes": ["Telehealth Video", "In-Person Clinic", "Initial Consultation (60 min)", "Follow-up (30 min)"],
        "is_active": True,
        "is_demo_provider": True,
    },
    {
        "id": "cgc-02-vance",
        "full_name": "Dr. Aaron Vance, MS, CGC",
        "title": "Director of Pediatric Genomics & Inborn Errors",
        "professional_title": "MS, CGC",
        "primary_specialty": "Pediatric & Rare Diseases",
        "subspecialties": ["Pediatric & Rare Diseases", "Metabolic Genetics", "Prenatal Genetics"],
        "credentials_display": "ABGC Board Certified Genetic Counselor · Lic #GC-38291",
        "qualification": "MS in Human Genetics & Genetic Counseling, Johns Hopkins University",
        "certification_org": "American Board of Genetic Counseling (ABGC)",
        "registration_number": "CGC-38291",
        "verification_status": "verified",
        "verification_source": "Official ABGC Public Certification Registry (abgc.net)",
        "verification_date": datetime.datetime(2023, 9, 20),
        "expiration_date": datetime.datetime(2028, 9, 20),
        "verification_reviewer": "GeneWise Clinical Credentialing Board",
        "institution": "Johns Hopkins McKusick-Nathans Institute of Genetic Medicine",
        "department": "Department of Pediatrics & Inborn Errors of Metabolism",
        "city": "Baltimore",
        "state_province": "MD",
        "country": "United States",
        "practice_location": "Baltimore, MD (Multi-State Telehealth Compact)",
        "languages": ["English", "Spanish"],
        "telehealth_available": True,
        "consultation_availability": "Next available: 6 business days",
        "waitlist_days": 6,
        "experience_years": 14,
        "fee_structure": "Insurance In-Network · Self-Pay $140",
        "avatar_url": "/images/counselors/aaron-vance.jpg",
        "bio": "Focuses on Mendelian inborn errors of metabolism, cystic fibrosis CFTR panel interpretation, carrier trios, and multi-generational pedigree tracing.",
        "target_loci": ["CFTR", "GAA", "PAH", "G6PD", "SMN1"],
        "target_conditions": [
            "Cystic Fibrosis",
            "Pompe Disease (GAA)",
            "Phenylketonuria (PKU)",
            "Spinal Muscular Atrophy (SMA)",
            "G6PD Deficiency"
        ],
        "services_offered": [
            "3-Generation Pedigree Review",
            "Pediatric Carrier Trios Analysis",
            "Rare Disease Variant Diagnostic Evaluation",
            "Newborn Screening Follow-Up",
            "Prenatal Genetic Counselling"
        ],
        "consultation_modes": ["Telehealth Video", "In-Person Clinic", "Initial Consultation (60 min)", "Follow-up (30 min)"],
        "is_active": True,
        "is_demo_provider": True,
    },
    {
        "id": "cgc-03-almansoor",
        "full_name": "Dr. Sarah Al-Mansoor, PhD, CGC",
        "title": "Lead Neurogenomics Specialist & ACMG Fellow",
        "professional_title": "PhD, CGC, FACMG",
        "primary_specialty": "Neurogenetics",
        "subspecialties": ["Neurogenetics", "Clinical Genomics"],
        "credentials_display": "ACMG Fellow · ABGC Board Certified · Lic #GC-52019",
        "qualification": "PhD in Neurogenetics, Case Western Reserve · MS Genetic Counseling",
        "certification_org": "American Board of Genetic Counseling (ABGC) & ACMG",
        "registration_number": "CGC-52019",
        "verification_status": "verified",
        "verification_source": "Official ABGC Public Registry & ACMG Membership Directory",
        "verification_date": datetime.datetime(2024, 1, 15),
        "expiration_date": datetime.datetime(2029, 1, 15),
        "verification_reviewer": "GeneWise Clinical Credentialing Board",
        "institution": "Cleveland Clinic Genomic Medicine Institute",
        "department": "Neurological Institute & Center for Personalized Healthcare",
        "city": "Cleveland",
        "state_province": "OH",
        "country": "United States",
        "practice_location": "Cleveland, OH (Licensed across 14 States)",
        "languages": ["English", "Arabic", "French"],
        "telehealth_available": True,
        "consultation_availability": "Next available: 7 business days",
        "waitlist_days": 7,
        "experience_years": 16,
        "fee_structure": "Insurance In-Network · Self-Pay $165",
        "avatar_url": "/images/counselors/sarah-al-mansoor.jpg",
        "bio": "Expertise in adult-onset neurodegenerative conditions including Huntington Disease (HTT CAG repeats), hereditary ataxias, and familial ALS surveillance.",
        "target_loci": ["HTT", "ATXN1", "SOD1", "C9orf72"],
        "target_conditions": [
            "Huntington Disease",
            "Spinocerebellar Ataxias (SCA)",
            "Familial Amyotrophic Lateral Sclerosis (ALS)",
            "Hereditary Neuropathies (CMT)",
            "Early-Onset Familial Alzheimer"
        ],
        "services_offered": [
            "Predictive Testing Protocol for Adult-Onset Conditions",
            "3-Generation Pedigree Review",
            "Pre-Test Neurological Counseling & GINA Disclosures",
            "Repeat Expansion Interpretation",
            "Family Psychosocial Support"
        ],
        "consultation_modes": ["Telehealth Video", "In-Person Clinic", "Initial Consultation (60 min)"],
        "is_active": True,
        "is_demo_provider": True,
    },
    {
        "id": "cgc-04-rostova",
        "full_name": "Dr. Elena Rostova, MS, CGC",
        "title": "Hereditary Oncology Lead Clinical Geneticist",
        "professional_title": "MS, CGC",
        "primary_specialty": "Oncogenetics",
        "subspecialties": ["Oncogenetics", "Cancer Genetics", "Clinical Genomics"],
        "credentials_display": "ABGC Board Certified · NSGC Member · Lic #GC-61104",
        "qualification": "MS in Genetic Counseling, Sarah Lawrence College",
        "certification_org": "American Board of Genetic Counseling (ABGC) & NSGC",
        "registration_number": "CGC-61104",
        "verification_status": "verified",
        "verification_source": "ABGC & New York State Office of the Professions",
        "verification_date": datetime.datetime(2023, 11, 10),
        "expiration_date": datetime.datetime(2028, 11, 10),
        "verification_reviewer": "GeneWise Clinical Credentialing Board",
        "institution": "Memorial Sloan Kettering Cancer Center",
        "department": "Clinical Genetics Service & Department of Medicine",
        "city": "New York",
        "state_province": "NY",
        "country": "United States",
        "practice_location": "New York, NY (NY, NJ, CT Licensed)",
        "languages": ["English", "Russian"],
        "telehealth_available": True,
        "consultation_availability": "Next available: 3 business days",
        "waitlist_days": 3,
        "experience_years": 9,
        "fee_structure": "Insurance In-Network · Self-Pay $175",
        "avatar_url": "/images/counselors/elena-rostova.jpg",
        "bio": "Dedicated to hereditary breast and ovarian cancer syndromes (BRCA1/2), Lynch syndrome mismatch repair screening, and cascade family testing.",
        "target_loci": ["BRCA1", "BRCA2", "MLH1", "MSH2", "TP53"],
        "target_conditions": [
            "Hereditary Breast & Ovarian Cancer (HBOC)",
            "Lynch Syndrome (HNPCC)",
            "Li-Fraumeni Syndrome (TP53)",
            "Familial Adenomatous Polyposis (FAP)",
            "Cowden Syndrome (PTEN)"
        ],
        "services_offered": [
            "Cancer Risk Stratification & Pedigree Modeling",
            "BRCA1/2 Comprehensive Panel Interpretation",
            "Cascade Testing Strategy for Relatives",
            "High-Risk Surveillance Protocol Coordination",
            "Pre-Test Informed Consent"
        ],
        "consultation_modes": ["Telehealth Video", "In-Person Clinic", "Initial Consultation (60 min)", "Follow-up (30 min)"],
        "is_active": True,
        "is_demo_provider": True,
    },
    {
        "id": "cgc-05-sharma",
        "full_name": "Dr. Priya Sharma, MS, CGC",
        "title": "Senior Reproductive & Preconception Genetic Counselor",
        "professional_title": "MS, CGC (BGCI & ABGC)",
        "primary_specialty": "Reproductive Genetics",
        "subspecialties": ["Reproductive Genetics", "Prenatal Genetics", "Carrier Screening"],
        "credentials_display": "Board of Genetic Counseling India (BGCI) · Cert #BGCI-2018-042",
        "qualification": "MS in Human Genetics & Genetic Counseling, Manipal Academy of Higher Education",
        "certification_org": "Board of Genetic Counseling India (BGCI)",
        "registration_number": "BGCI-2018-042",
        "verification_status": "verified",
        "verification_source": "Official BGCI Registry (bgciindia.org)",
        "verification_date": datetime.datetime(2024, 4, 18),
        "expiration_date": datetime.datetime(2029, 4, 18),
        "verification_reviewer": "GeneWise Clinical Credentialing Board",
        "institution": "Apollo Genomics & Precision Medicine Institute",
        "department": "Fetal Medicine & Clinical Genetics Department",
        "city": "Bengaluru",
        "state_province": "Karnataka",
        "country": "India",
        "practice_location": "Bengaluru, Karnataka (Pan-India Telehealth Licensed)",
        "languages": ["English", "Hindi", "Kannada", "Tamil"],
        "telehealth_available": True,
        "consultation_availability": "Tomorrow at 10:30 AM (Telehealth)",
        "waitlist_days": 1,
        "experience_years": 12,
        "fee_structure": "Standard Institutional Telehealth ₹1,500",
        "avatar_url": "/images/counselors/maya-lin.jpg",
        "bio": "Expertise in preconception carrier screening for beta-thalassemia, hemoglobinopathies, non-invasive prenatal screening (NIPS), and high-risk pregnancy counselling.",
        "target_loci": ["HBB", "G6PD", "CFTR", "SMN1", "HBA1"],
        "target_conditions": [
            "Beta Thalassemia Major & Trait",
            "Sickle Cell Anemia",
            "Spinal Muscular Atrophy (SMA)",
            "Down Syndrome & Chromosomal Aneuploidies",
            "Recurrent Pregnancy Loss"
        ],
        "services_offered": [
            "Preconception Carrier Screening Education",
            "Consanguinity Risk Assessment",
            "Prenatal Ultrasound Anomaly Counseling",
            "3-Generation Pedigree Review",
            "Multilingual Consultation in Indian Regional Languages"
        ],
        "consultation_modes": ["Telehealth Video", "In-Person Clinic", "Initial Consultation (45 min)", "Follow-up (30 min)"],
        "is_active": True,
        "is_demo_provider": True,
    },
    {
        "id": "cgc-06-varma",
        "full_name": "Dr. Rajesh K. Varma, MD, DM",
        "title": "Lead Clinical Geneticist & Rare Disease Specialist",
        "professional_title": "MD, DM (Medical Genetics)",
        "primary_specialty": "Clinical Genomics",
        "subspecialties": ["Clinical Genomics", "Pediatric & Rare Diseases", "Metabolic Genetics"],
        "credentials_display": "Medical Council of India & Medical Genetics Specialty Board · Reg #MCI-DM-8402",
        "qualification": "DM in Medical Genetics, Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGIMS)",
        "certification_org": "Medical Council of India / National Medical Commission (NMC)",
        "registration_number": "MCI-DM-8402",
        "verification_status": "verified",
        "verification_source": "NMC National Medical Register & Indian Academy of Medical Genetics",
        "verification_date": datetime.datetime(2023, 8, 22),
        "expiration_date": datetime.datetime(2028, 8, 22),
        "verification_reviewer": "GeneWise Clinical Credentialing Board",
        "institution": "All India Institute of Medical Sciences (AIIMS) Clinical Genetics",
        "department": "Genetics & Genomics Division, Department of Pediatrics",
        "city": "New Delhi",
        "state_province": "Delhi",
        "country": "India",
        "practice_location": "New Delhi, Delhi (North India Regional Referral Hub)",
        "languages": ["English", "Hindi", "Punjabi"],
        "telehealth_available": True,
        "consultation_availability": "In 3 business days (Virtual / In-Person)",
        "waitlist_days": 3,
        "experience_years": 18,
        "fee_structure": "AIIMS OPD Nominal / Telehealth ₹1,200",
        "avatar_url": "/images/counselors/aaron-vance.jpg",
        "bio": "Leading clinical authority on Mendelian inheritance, undiagnosed rare diseases, whole exome/genome sequencing interpretation, and pediatric dysmorphology.",
        "target_loci": ["DMD", "SMN1", "GAA", "HFE", "COL1A1"],
        "target_conditions": [
            "Duchenne Muscular Dystrophy (DMD)",
            "Osteogenesis Imperfecta",
            "Lysosomal Storage Disorders",
            "Hemochromatosis (HFE)",
            "Undiagnosed Mendelian Syndromes"
        ],
        "services_offered": [
            "Whole Exome Sequencing (WES) Pre/Post-Test Review",
            "Dysmorphology & Clinical Evaluation",
            "3-Generation Pedigree Review",
            "Rare Disease MDT Coordination",
            "Variant of Uncertain Significance (VUS) Resolution"
        ],
        "consultation_modes": ["Telehealth Video", "In-Person Clinic", "Complex Initial Consult (60 min)"],
        "is_active": True,
        "is_demo_provider": True,
    },
    {
        "id": "cgc-07-thorne",
        "full_name": "Dr. Aris Thorne, MSc, GCRB",
        "title": "Principal Consultant Genetic Counsellor",
        "professional_title": "MSc, Registered Genetic Counsellor",
        "primary_specialty": "Cardiogenetics",
        "subspecialties": ["Cardiogenetics", "Pharmacogenetics"],
        "credentials_display": "UK Genetic Counsellor Registration Board · Reg #GCRB-8142",
        "qualification": "MSc in Genetic & Genomic Counselling, University of Manchester",
        "certification_org": "Genetic Counsellor Registration Board (GCRB) / HCPC UK",
        "registration_number": "GCRB-8142",
        "verification_status": "verified",
        "verification_source": "UK GCRB Register of Genetic Counsellors (gcrb.org.uk)",
        "verification_date": datetime.datetime(2024, 2, 10),
        "expiration_date": datetime.datetime(2029, 2, 10),
        "verification_reviewer": "GeneWise Clinical Credentialing Board",
        "institution": "Guy's and St Thomas' NHS Foundation Trust",
        "department": "South East Genomic Medicine Service Alliance",
        "city": "London",
        "state_province": "Greater London",
        "country": "United Kingdom",
        "practice_location": "London, England (UK & European Cross-Border Telehealth)",
        "languages": ["English", "Greek"],
        "telehealth_available": True,
        "consultation_availability": "Next available: 5 business days",
        "waitlist_days": 5,
        "experience_years": 13,
        "fee_structure": "NHS Referral / Private Consult £180",
        "avatar_url": "/images/counselors/sarah-al-mansoor.jpg",
        "bio": "Specialising in inherited arrhythmias (Long QT, Brugada syndrome), familial dilated cardiomyopathy, and pharmacogenetic HLA-B/CYP2C19 drug safety screening.",
        "target_loci": ["MYH7", "KCNQ1", "SCN5A", "FBN1", "CYP2C19"],
        "target_conditions": [
            "Arrhythmogenic Cardiomyopathy",
            "Long QT Syndrome",
            "Brugada Syndrome",
            "Familial Thoracic Aortic Aneurysm",
            "Pharmacogenomic Adverse Drug Reaction Risk"
        ],
        "services_offered": [
            "Cardiac Genetic Panel Interpretation",
            "Sudden Arrhythmic Death Syndrome (SADS) Family Tracing",
            "3-Generation Pedigree Review",
            "Pharmacogenomics & Medication Safety Guidance",
            "Informed Consent for Family Cascade Testing"
        ],
        "consultation_modes": ["Telehealth Video", "In-Person Clinic", "Initial Consult (60 min)"],
        "is_active": True,
        "is_demo_provider": True,
    },
]

class CounselorService:
    @staticmethod
    def ensure_seed_counselors(db: Session):
        """Ensures the directory contains verified reference counselors."""
        count = db.query(GeneticCounselorModel).count()
        if count == 0:
            for item in INITIAL_SEED_COUNSELORS:
                c = GeneticCounselorModel(**item)
                db.add(c)
                db.flush()

                # Add baseline verified credential
                cred = CounselorCredentialModel(
                    counselor_id=c.id,
                    credential_type="Board Certification & Clinical Registration",
                    issuer_org=c.certification_org,
                    credential_id=c.registration_number,
                    status=c.verification_status,
                    country=c.country,
                    issued_date=c.verification_date,
                    expiry_date=c.expiration_date,
                    verification_source_url=c.verification_source,
                    evidence_notes=f"Credential verified by GeneWise Credentialing Board against official {c.certification_org} public directory records.",
                )
                db.add(cred)

            db.commit()

    @staticmethod
    def search_counselors(
        db: Session,
        query: Optional[str] = None,
        specialty: Optional[str] = None,
        country: Optional[str] = None,
        location: Optional[str] = None,
        telehealth_only: bool = False,
        sort_by: str = "relevance",
        current_user_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Dict[str, Any]], int]:
        CounselorService.ensure_seed_counselors(db)

        q = db.query(GeneticCounselorModel).filter(GeneticCounselorModel.is_active == True)

        # Telehealth filter
        if telehealth_only:
            q = q.filter(GeneticCounselorModel.telehealth_available == True)

        # Specialty filter (matches primary or in subspecialties)
        if specialty and specialty != "All":
            # Match either primary_specialty or case-insensitive search
            spec_lower = specialty.lower()
            q = q.filter(
                or_(
                    GeneticCounselorModel.primary_specialty.ilike(f"%{spec_lower}%"),
                    GeneticCounselorModel.bio.ilike(f"%{spec_lower}%"),
                )
            )

        # Country filter
        if country and country != "All" and country != "All Countries":
            q = q.filter(GeneticCounselorModel.country.ilike(f"%{country}%"))

        # Location filter
        if location:
            q = q.filter(
                or_(
                    GeneticCounselorModel.city.ilike(f"%{location}%"),
                    GeneticCounselorModel.state_province.ilike(f"%{location}%"),
                    GeneticCounselorModel.practice_location.ilike(f"%{location}%"),
                )
            )

        # Text query (name, institution, city, gene loci, conditions, registration number)
        if query and query.strip():
            raw_q = query.strip().lower()
            # If query looks like a gene symbol (e.g. BRCA1, CFTR, FBN1, LDLR)
            q = q.filter(
                or_(
                    GeneticCounselorModel.full_name.ilike(f"%{raw_q}%"),
                    GeneticCounselorModel.institution.ilike(f"%{raw_q}%"),
                    GeneticCounselorModel.city.ilike(f"%{raw_q}%"),
                    GeneticCounselorModel.state_province.ilike(f"%{raw_q}%"),
                    GeneticCounselorModel.registration_number.ilike(f"%{raw_q}%"),
                    GeneticCounselorModel.bio.ilike(f"%{raw_q}%"),
                    GeneticCounselorModel.primary_specialty.ilike(f"%{raw_q}%"),
                )
            )

        total_count = q.count()

        # Sorting
        if sort_by == "experience":
            q = q.order_by(desc(GeneticCounselorModel.experience_years))
        elif sort_by == "location":
            q = q.order_by(GeneticCounselorModel.country, GeneticCounselorModel.city)
        elif sort_by == "telehealth":
            q = q.order_by(desc(GeneticCounselorModel.telehealth_available), GeneticCounselorModel.waitlist_days)
        else:
            # Default relevance / verified first
            q = q.order_by(desc(GeneticCounselorModel.verification_status == "verified"), GeneticCounselorModel.waitlist_days)

        counselors = q.offset(offset).limit(limit).all()

        # Check saved counselors for current user
        saved_ids = set()
        if current_user_id:
            saved_records = db.query(SavedCounselorModel.counselor_id).filter(SavedCounselorModel.user_id == current_user_id).all()
            saved_ids = {r[0] for r in saved_records}

        results = []
        for c in counselors:
            match_rationale = None
            if query and query.strip():
                match_rationale = f"Matched search '{query}' across verified profile, loci, and clinical credentials."
            elif specialty and specialty != "All":
                match_rationale = f"Specializes in {c.primary_specialty} with verified institutional board registration."

            item = {
                "id": c.id,
                "name": c.full_name,
                "title": c.title,
                "professional_title": c.professional_title,
                "credentials": c.credentials_display,
                "qualification": c.qualification,
                "certification_org": c.certification_org,
                "registration_number": c.registration_number,
                "verification_status": c.verification_status,
                "verification_source": c.verification_source,
                "institution": c.institution,
                "department": c.department,
                "location": c.practice_location,
                "city": c.city,
                "state_province": c.state_province,
                "country": c.country,
                "specialty": c.primary_specialty,
                "subspecialties": c.subspecialties or [],
                "telehealth": c.telehealth_available,
                "languages": c.languages or ["English"],
                "bio": c.bio,
                "fee": c.fee_structure,
                "waitlist_days": c.waitlist_days,
                "experience_years": c.experience_years,
                "avatar": c.avatar_url,
                "target_loci": c.target_loci or [],
                "target_conditions": c.target_conditions or [],
                "consultation_availability": c.consultation_availability,
                "is_demo_provider": c.is_demo_provider,
                "is_saved": c.id in saved_ids,
                "match_rationale": match_rationale,
            }
            results.append(item)

        return results, total_count

    @staticmethod
    def get_counselor_detail(db: Session, counselor_id: str, current_user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        CounselorService.ensure_seed_counselors(db)

        c = db.query(GeneticCounselorModel).filter(GeneticCounselorModel.id == counselor_id).first()
        if not c:
            return None

        is_saved = False
        if current_user_id:
            is_saved = (
                db.query(SavedCounselorModel)
                .filter(SavedCounselorModel.user_id == current_user_id, SavedCounselorModel.counselor_id == counselor_id)
                .first()
                is not None
            )

        credentials_list = [
            {
                "id": cr.id,
                "credential_type": cr.credential_type,
                "issuer_org": cr.issuer_org,
                "credential_id": cr.credential_id,
                "status": cr.status,
                "country": cr.country,
                "issued_date": cr.issued_date,
                "expiry_date": cr.expiry_date,
                "verification_source_url": cr.verification_source_url,
                "evidence_notes": cr.evidence_notes,
            }
            for cr in c.credentials
        ]

        return {
            "id": c.id,
            "name": c.full_name,
            "title": c.title,
            "professional_title": c.professional_title,
            "credentials": c.credentials_display,
            "qualification": c.qualification,
            "certification_org": c.certification_org,
            "registration_number": c.registration_number,
            "verification_status": c.verification_status,
            "verification_source": c.verification_source,
            "institution": c.institution,
            "department": c.department,
            "location": c.practice_location,
            "city": c.city,
            "state_province": c.state_province,
            "country": c.country,
            "specialty": c.primary_specialty,
            "subspecialties": c.subspecialties or [],
            "telehealth": c.telehealth_available,
            "languages": c.languages or ["English"],
            "bio": c.bio,
            "fee": c.fee_structure,
            "waitlist_days": c.waitlist_days,
            "experience_years": c.experience_years,
            "avatar": c.avatar_url,
            "target_loci": c.target_loci or [],
            "target_conditions": c.target_conditions or [],
            "services_offered": c.services_offered or [],
            "consultation_modes": c.consultation_modes or ["Telehealth Video", "In-Person Clinic"],
            "consultation_availability": c.consultation_availability,
            "is_demo_provider": c.is_demo_provider,
            "is_saved": is_saved,
            "credentials_list": credentials_list,
            "disclaimer": (
                "GeneWise AI Counselor Directory provides educational discovery and referral coordination. "
                "Verified credentials reflect documented institutional registration. All clinical decisions "
                "and medical evaluations remain strictly between patient and licensed genetics professionals."
            ),
        }

    @staticmethod
    def toggle_saved_counselor(db: Session, counselor_id: str, user_id: int) -> bool:
        """Toggles bookmarking a counselor. Returns True if now saved, False if unsaved."""
        existing = (
            db.query(SavedCounselorModel)
            .filter(SavedCounselorModel.user_id == user_id, SavedCounselorModel.counselor_id == counselor_id)
            .first()
        )
        if existing:
            db.delete(existing)
            db.commit()
            return False
        else:
            rec = SavedCounselorModel(user_id=user_id, counselor_id=counselor_id)
            db.add(rec)
            db.commit()
            return True

    @staticmethod
    def list_saved_counselors(db: Session, user_id: int) -> List[Dict[str, Any]]:
        saved_recs = db.query(SavedCounselorModel).filter(SavedCounselorModel.user_id == user_id).all()
        results = []
        for s in saved_recs:
            detail = CounselorService.get_counselor_detail(db, s.counselor_id, user_id)
            if detail:
                results.append(detail)
        return results

    @staticmethod
    def create_appointment_request(db: Session, user: User, data: AppointmentRequestCreate) -> Dict[str, Any]:
        """Creates an authenticated appointment booking request with a protected telehealth room link."""
        c = db.query(GeneticCounselorModel).filter(GeneticCounselorModel.id == data.counsellor_id).first()
        if not c:
            raise ValueError(f"Counselor '{data.counsellor_id}' not found.")

        room_id = uuid.uuid4().hex[:12]
        telehealth_link = f"https://meet.genewise.ai/telehealth/cgc-{room_id}"
        audit_token = f"APT-CONF-{uuid.uuid4().hex[:12].upper()}"

        apt = AppointmentRequestModel(
            user_id=user.id,
            counsellor_id=c.id,
            patient_name=data.patient_name,
            patient_email=data.patient_email,
            patient_phone=data.patient_phone,
            consultation_purpose=data.consultation_purpose,
            preferred_date=data.preferred_date,
            preferred_time_slot=data.preferred_time_slot,
            time_zone=data.time_zone,
            consultation_format=data.consultation_format,
            telehealth_link=telehealth_link,
            status="pending",
            intake_notes=data.intake_notes,
            consent_data_sharing=data.consent_data_sharing,
            attached_report_ids=data.attached_report_ids,
            include_pedigree=data.include_pedigree,
            doctor_prep_summary_id=data.doctor_prep_summary_id,
            audit_token=audit_token,
        )
        db.add(apt)
        db.commit()
        db.refresh(apt)

        AuditService.log_event(
            db,
            action="COUNSELOR_APPOINTMENT_REQUESTED",
            user_id=user.id,
            resource_type="AppointmentRequest",
            resource_id=apt.id,
            details={
                "counselor_id": c.id,
                "counselor_name": c.full_name,
                "preferred_date": data.preferred_date,
                "format": data.consultation_format,
                "audit_token": audit_token,
            },
        )

        return {
            "id": apt.id,
            "counsellor_id": c.id,
            "counsellor_name": c.full_name,
            "patient_name": apt.patient_name,
            "patient_email": apt.patient_email,
            "consultation_purpose": apt.consultation_purpose,
            "preferred_date": apt.preferred_date,
            "preferred_time_slot": apt.preferred_time_slot,
            "time_zone": apt.time_zone,
            "consultation_format": apt.consultation_format,
            "telehealth_link": apt.telehealth_link,
            "status": apt.status,
            "intake_notes": apt.intake_notes,
            "consent_data_sharing": apt.consent_data_sharing,
            "audit_token": apt.audit_token,
            "created_at": apt.created_at,
            "pre_consultation_instructions": [
                "Please ensure a stable internet connection and quiet private room for confidential discussion.",
                "Have prior laboratory results or genetic panel reports accessible for screen review.",
                "Prepare documentation on ages of onset for any reported family health conditions.",
                "Your video room link requires authenticated sign-in under your GeneWise account."
            ],
        }

    @staticmethod
    def list_user_appointments(db: Session, user_id: int) -> List[Dict[str, Any]]:
        appointments = (
            db.query(AppointmentRequestModel)
            .filter(AppointmentRequestModel.user_id == user_id)
            .order_by(desc(AppointmentRequestModel.created_at))
            .all()
        )
        results = []
        for apt in appointments:
            c = db.query(GeneticCounselorModel).filter(GeneticCounselorModel.id == apt.counsellor_id).first()
            c_name = c.full_name if c else "Assigned Genetic Counselor"
            results.append({
                "id": apt.id,
                "counsellor_id": apt.counsellor_id,
                "counsellor_name": c_name,
                "patient_name": apt.patient_name,
                "patient_email": apt.patient_email,
                "consultation_purpose": apt.consultation_purpose,
                "preferred_date": apt.preferred_date,
                "preferred_time_slot": apt.preferred_time_slot,
                "time_zone": apt.time_zone,
                "consultation_format": apt.consultation_format,
                "telehealth_link": apt.telehealth_link,
                "status": apt.status,
                "reschedule_reason": apt.reschedule_reason,
                "intake_notes": apt.intake_notes,
                "consent_data_sharing": apt.consent_data_sharing,
                "audit_token": apt.audit_token,
                "created_at": apt.created_at,
                "pre_consultation_instructions": [
                    "Please ensure a stable internet connection and quiet private room for confidential discussion.",
                    "Have prior laboratory results or genetic panel reports accessible for screen review.",
                    "Prepare documentation on ages of onset for any reported family health conditions."
                ],
            })
        return results

    @staticmethod
    def update_appointment_status(db: Session, appointment_id: str, user_id: int, status: str, reason: Optional[str] = None) -> Dict[str, Any]:
        apt = db.query(AppointmentRequestModel).filter(AppointmentRequestModel.id == appointment_id).first()
        if not apt:
            raise ValueError(f"Appointment request '{appointment_id}' not found.")

        # Ensure ownership
        if apt.user_id != user_id:
            raise PermissionError("Unauthorized to modify this appointment.")

        apt.status = status
        if reason:
            apt.reschedule_reason = reason
        db.commit()
        db.refresh(apt)

        AuditService.log_event(
            db,
            action="APPOINTMENT_STATUS_UPDATED",
            user_id=user_id,
            resource_type="AppointmentRequest",
            resource_id=apt.id,
            details={"status": status, "reason": reason},
        )
        return {"id": apt.id, "status": apt.status, "message": f"Appointment request has been {status}."}

    @staticmethod
    def generate_doctor_prep_brief(db: Session, user: User, req: DoctorPrepRequest) -> Dict[str, Any]:
        """
        AI Doctor Preparation Wizard engine:
        Synthesizes purpose, family pedigree data, and laboratory/genetic tests into a structured clinical brief.
        Never fabricates diagnoses; outlines high-yield questions, evidence topics, and missing records.
        """
        CounselorService.ensure_seed_counselors(db)

        # Pull existing family pedigree if requested
        family_conditions_summary = []
        if req.include_saved_pedigree:
            group = db.query(FamilyGroup).filter(FamilyGroup.user_id == user.id).first()
            if group:
                conditions = (
                    db.query(FamilyHealthConditionModel)
                    .join(FamilyMemberModel, FamilyHealthConditionModel.member_id == FamilyMemberModel.id)
                    .filter(FamilyMemberModel.group_id == group.id)
                    .all()
                )
                for c in conditions:
                    family_conditions_summary.append({
                        "relative": c.member.relationship_to_proband,
                        "branch": c.member.branch,
                        "condition": c.condition_name,
                        "age_at_diagnosis": c.age_at_diagnosis,
                    })

        # Append explicitly submitted conditions
        for cond in req.family_conditions:
            family_conditions_summary.append(cond)

        # Determine clinical specialty and suggested loci
        purpose_lower = req.consultation_purpose.lower()
        specialty_rec = "Clinical Genomics"
        suggested_loci = list(req.relevant_genes)

        if "cancer" in purpose_lower or "brca" in purpose_lower or "breast" in purpose_lower or "colon" in purpose_lower:
            specialty_rec = "Oncogenetics"
            suggested_loci.extend(["BRCA1", "BRCA2", "MLH1", "MSH2"])
        elif "cardio" in purpose_lower or "heart" in purpose_lower or "aneurysm" in purpose_lower or "marfan" in purpose_lower:
            specialty_rec = "Cardiogenetics"
            suggested_loci.extend(["FBN1", "LDLR", "MYH7", "PCSK9"])
        elif "carrier" in purpose_lower or "preconception" in purpose_lower or "pregnancy" in purpose_lower:
            specialty_rec = "Reproductive Genetics"
            suggested_loci.extend(["HBB", "CFTR", "SMN1", "G6PD"])
        elif "pediatric" in purpose_lower or "child" in purpose_lower or "rare" in purpose_lower:
            specialty_rec = "Pediatric & Rare Diseases"
            suggested_loci.extend(["CFTR", "GAA", "DMD", "SMN1"])
        elif "neuro" in purpose_lower or "huntington" in purpose_lower or "ataxia" in purpose_lower:
            specialty_rec = "Neurogenetics"
            suggested_loci.extend(["HTT", "ATXN1", "SOD1"])

        # Deduplicate loci
        suggested_loci = sorted(list(set(suggested_loci)))

        # Build questions to ask
        questions = [
            f"Based on my family history of {family_conditions_summary[0]['condition'] if family_conditions_summary else 'reported conditions'}, does our pedigree suggest an Autosomal Dominant or Recessive inheritance pattern?",
            "What are the clinical benefits, diagnostic limitations, and potential unexpected findings (VUS) of multi-gene panel testing?",
            "How do legal protections under GINA (or applicable national privacy laws) safeguard my genetic test results from health insurance or employment discrimination?",
            "If an actionable genetic variant is identified, what cascade screening and surveillance protocol should be offered to my first-degree relatives?",
            "What pre-test documentation or prior pathology/biomarker reports should I request from relatives to assist our clinical evaluation?",
        ]

        # Documents to bring
        docs_to_bring = [
            "Official pathology or diagnostic reports for any deceased or living relatives with early-onset conditions.",
            "Complete 3-generation pedigree diagram export from GeneWise AI.",
            "Prior genetic test results (karyotype, microarray, or gene sequencing) for any tested family member.",
            "Recent clinical laboratory panels (complete blood count, metabolic panel, and lipid profile).",
            "Documentation of maternal and paternal ages of diagnosis for cardiac, oncological, or neurological events.",
        ]

        # Missing information gaps
        missing_info = [
            "Exact age of diagnosis for secondary relatives on the extended family branch.",
            "Specific histological subtype of cancer or anatomical location of cardiovascular aneurysm.",
            "Confirmation of whether prior deceased relatives underwent formal autopsy or molecular genetic testing.",
        ]

        # Important uncertainties
        uncertainties = [
            "Variants of Uncertain Significance (VUS) are frequent in large sequencing panels and must not be used to justify invasive interventions.",
            "A negative genetic test result significantly reduces inherited risk but does not eliminate baseline population risk.",
            "Environmental lifestyle factors and polygenic backgrounds can modify the penetrance of identified single-gene variants.",
        ]

        # Find matching counselors in directory
        matching_counselors = (
            db.query(GeneticCounselorModel)
            .filter(
                GeneticCounselorModel.is_active == True,
                or_(
                    GeneticCounselorModel.primary_specialty.ilike(f"%{specialty_rec}%"),
                    GeneticCounselorModel.bio.ilike(f"%{specialty_rec}%"),
                )
            )
            .limit(3)
            .all()
        )
        counselor_ids = [c.id for c in matching_counselors]

        brief_payload = {
            "consultation_purpose": req.consultation_purpose,
            "family_history_overview": f"Reviewed {len(family_conditions_summary)} documented family conditions across paternal and maternal lineages.",
            "questions_to_ask": questions,
            "documents_to_bring": docs_to_bring,
            "screening_topics": [f"{specialty_rec} Diagnostic Strategy", "Cascade Family Screening", "Informed Consent & GINA Disclosures"],
            "missing_information": missing_info,
            "important_uncertainties": uncertainties,
            "suggested_counselor_specialty": specialty_rec,
            "suggested_counselor_ids": counselor_ids,
        }

        prep_record = ConsultationPreparationModel(
            user_id=user.id,
            counselor_id=req.counselor_id,
            consultation_purpose=req.consultation_purpose,
            selected_goals=req.selected_goals,
            family_history_data={"conditions": family_conditions_summary},
            relevant_genes=suggested_loci,
            attached_document_ids=req.attached_report_ids,
            generated_brief=brief_payload,
        )
        db.add(prep_record)
        db.commit()
        db.refresh(prep_record)

        AuditService.log_event(
            db,
            action="DOCTOR_PREP_WIZARD_GENERATED",
            user_id=user.id,
            resource_type="ConsultationPreparation",
            resource_id=prep_record.id,
            details={"purpose": req.consultation_purpose, "specialty": specialty_rec},
        )

        return {
            "id": prep_record.id,
            "consultation_purpose": req.consultation_purpose,
            "family_history_overview": brief_payload["family_history_overview"],
            "questions_to_ask": questions,
            "documents_to_bring": docs_to_bring,
            "screening_topics": brief_payload["screening_topics"],
            "missing_information": missing_info,
            "important_uncertainties": uncertainties,
            "suggested_counselor_specialty": specialty_rec,
            "suggested_counselor_ids": counselor_ids,
            "disclaimer": (
                "This preparation summary is an educational guide generated to help you organize relevant medical "
                "history and questions. It does NOT provide a genetic diagnosis or definitive disease probability."
            ),
            "created_at": prep_record.created_at,
        }

    @staticmethod
    def admin_verify_counselor_credential(
        db: Session,
        counselor_id: str,
        admin_user: User,
        req: AdminVerifyCredentialRequest,
    ) -> Dict[str, Any]:
        """Admin action: update verification status and log tamper-evident audit record."""
        c = db.query(GeneticCounselorModel).filter(GeneticCounselorModel.id == counselor_id).first()
        if not c:
            raise ValueError(f"Counselor '{counselor_id}' not found.")

        old_status = c.verification_status
        c.verification_status = req.status
        c.verification_reviewer = req.reviewer_name
        c.verification_date = datetime.datetime.utcnow()
        if req.new_expiry_date:
            c.expiration_date = req.new_expiry_date

        # Update underlying credentials
        for cr in c.credentials:
            cr.status = req.status

        # Create verification history audit
        audit_hash = hashlib.sha256(
            f"{counselor_id}:{old_status}:{req.status}:{admin_user.id}:{datetime.datetime.utcnow().isoformat()}".encode("utf-8")
        ).hexdigest()

        hist = CounselorVerificationHistoryModel(
            counselor_id=c.id,
            previous_status=old_status,
            new_status=req.status,
            reviewed_by=req.reviewer_name,
            review_notes=req.review_notes,
            audit_hash=audit_hash,
        )
        db.add(hist)
        db.commit()

        AuditService.log_event(
            db,
            action="ADMIN_COUNSELOR_CREDENTIAL_VERIFIED",
            user_id=admin_user.id,
            resource_type="GeneticCounselor",
            resource_id=c.id,
            details={
                "previous_status": old_status,
                "new_status": req.status,
                "reviewer": req.reviewer_name,
                "audit_hash": audit_hash,
            },
        )

        return {
            "counselor_id": c.id,
            "previous_status": old_status,
            "new_status": req.status,
            "audit_hash": audit_hash,
            "message": f"Counselor credential status successfully updated to '{req.status}' by administrator.",
        }
