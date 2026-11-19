import datetime
import logging
import uuid
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.family_genetics import (
    FamilyGroup,
    FamilyMemberModel,
    FamilyRelationshipModel,
    FamilyHealthConditionModel,
    GeneticTestRecord,
    GeneticVariant,
    InheritanceObservation,
    CarrierScreeningInfo,
    PreconceptionPlan,
    GeneticRiskSummary,
    GeneticEvidenceSource,
    GeneticCounsellor,
    SpecialistReferral,
    GeneticDataConsent,
)
from app.models.models import User
from app.schemas.family_genetics import (
    FamilyConditionBase,
    FamilyMemberCreate,
    FamilyMemberUpdate,
    PreconceptionPlanUpdate,
    SpecialistReferralCreate,
)

logger = logging.getLogger(__name__)

STANDARD_DISCLAIMER = (
    "MediPredict AI provides educational genetic and family-history risk awareness. "
    "It does not diagnose genetic conditions, determine reproductive outcomes, or replace clinical "
    "genetic testing and professional genetic counselling."
)

DEFAULT_CARRIER_CONDITIONS = [
    {
        "condition_name": "Beta Thalassemia & Hemoglobin E",
        "category": "Hemoglobinopathy",
        "gene_symbol": "HBB",
        "inheritance_mode": "Autosomal Recessive",
        "clinical_description": "An inherited red blood cell disorder reducing hemoglobin production, leading to microcytic anemia. High carrier prevalence across South Asia, the Mediterranean, and Southeast Asia.",
        "who_should_consider": "Individuals planning pregnancy, couples with microcytic red cell indices (MCV <80 fL), or family history of transfusion dependency.",
        "screening_limitations": "Standard CBC/HPLC detects most carriers; rare silent mutations or copy-number deletions may require targeted HBB sequencing or MLPA.",
        "residual_risk_explanation": "A normal HPLC reduces carrier risk significantly but does not eliminate it if a partner carries a rare mutation. Residual risk is approximately 1 in 200-500 depending on ancestry.",
        "partner_testing_importance": "Crucial: If both partners are carriers of beta-thalassemia or HbE, there is a 25% (1 in 4) chance in each pregnancy of a child with Thalassemia Major.",
        "guideline_source": "ACOG Committee Opinion No. 691 & National Health Mission India",
        "guideline_url": "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/03/carrier-screening-for-genetic-conditions",
        "last_reviewed_date": "2026-06",
    },
    {
        "condition_name": "Sickle Cell Disease & Trait",
        "category": "Hemoglobinopathy",
        "gene_symbol": "HBB (HbS variant)",
        "inheritance_mode": "Autosomal Recessive",
        "clinical_description": "Abnormal hemoglobin S causes red blood cells to sickle under low oxygen tension, causing painful vaso-occlusive crises, organ damage, and hemolytic anemia.",
        "who_should_consider": "Preconception couples, individuals with family history of sickle cell or unexplained anemia, and population-wide screening in high-prevalence belts.",
        "screening_limitations": "Solubility tests alone cannot distinguish trait from disease; quantitative hemoglobin electrophoresis or HPLC is mandatory.",
        "residual_risk_explanation": "HPLC has >99% analytical sensitivity for HbS. Residual risk after normal testing is very low (<1 in 10,000).",
        "partner_testing_importance": "If one partner has Sickle Trait and the other has Beta Thalassemia trait, offspring have a 25% risk of Sickle Beta-Thalassemia.",
        "guideline_source": "CDC Sickle Cell Genetics & ACOG Guidelines",
        "guideline_url": "https://www.cdc.gov/ncbddd/sicklecell/index.html",
        "last_reviewed_date": "2026-05",
    },
    {
        "condition_name": "Cystic Fibrosis (CF)",
        "category": "Cystic Fibrosis",
        "gene_symbol": "CFTR",
        "inheritance_mode": "Autosomal Recessive",
        "clinical_description": "Multi-organ dysfunction caused by thick, viscous mucus secretions affecting the lungs, pancreas, hepatobiliary system, and male reproductive tract.",
        "who_should_consider": "All preconception couples seeking expanded or standard carrier screening, or individuals with family history of bronchiectasis or male infertility (CBAVD).",
        "screening_limitations": "Targeted 23-mutation panels detect 80-90% of carriers in Caucasian populations, but full gene sequencing is necessary for comprehensive detection in diverse global ancestries.",
        "residual_risk_explanation": "A negative panel test reduces carrier probability from ~1/25 to ~1/200; residual risk persists because of rare private variants.",
        "partner_testing_importance": "If both biological parents are carriers, each pregnancy carries a 25% risk of Cystic Fibrosis.",
        "guideline_source": "ACMG Practice Guideline on CFTR Carrier Screening",
        "guideline_url": "https://medlineplus.gov/genetics/condition/cystic-fibrosis/",
        "last_reviewed_date": "2026-04",
    },
    {
        "condition_name": "Spinal Muscular Atrophy (SMA)",
        "category": "Spinal Muscular Atrophy",
        "gene_symbol": "SMN1",
        "inheritance_mode": "Autosomal Recessive",
        "clinical_description": "Progressive degeneration of anterior horn alpha motor neurons in the spinal cord, leading to symmetrical proximal muscle weakness and atrophy.",
        "who_should_consider": "Offered pan-ethnically to all women considering pregnancy or currently pregnant, per ACOG and ACMG recommendations.",
        "screening_limitations": "Standard screening measures SMN1 exon 7 copy number. Approximately 3-4% of carriers have two copies on one chromosome and zero on the other (2+0 genotype), which standard dosage assays miss.",
        "residual_risk_explanation": "A negative (2 copies) test reduces carrier risk from ~1 in 50 to ~1 in 500-1,000 depending on ancestry.",
        "partner_testing_importance": "If both partners are carriers of an SMN1 loss-of-function allele, there is a 25% chance of an affected child in each pregnancy.",
        "guideline_source": "ACOG Committee Opinion No. 691 & ACMG Guidelines",
        "guideline_url": "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/03/carrier-screening-for-genetic-conditions",
        "last_reviewed_date": "2026-07",
    },
    {
        "condition_name": "Inborn Errors of Metabolism (Gaucher, Tay-Sachs, Pompe)",
        "category": "Inborn Error of Metabolism",
        "gene_symbol": "GBA, HEXA, GAA",
        "inheritance_mode": "Autosomal Recessive",
        "clinical_description": "Lysosomal storage disorders and metabolic enzyme deficiencies that lead to toxic substrate accumulation in neural, hepatic, or muscular tissues.",
        "who_should_consider": "Couples with positive family history, consanguineous partnerships, or those electing expanded carrier screening panels (ECS).",
        "screening_limitations": "Enzyme assays and sequencing test only designated gene variants; negative results do not completely rule out atypical or deep intronic variants.",
        "residual_risk_explanation": "Carrier risk is greatly diminished but not zero.",
        "partner_testing_importance": "Critical to establish concordance of carrier status in both biological parents.",
        "guideline_source": "GeneReviews & MedlinePlus Genetics",
        "guideline_url": "https://www.ncbi.nlm.nih.gov/books/NBK1116/",
        "last_reviewed_date": "2026-03",
    },
    {
        "condition_name": "Expanded Carrier Screening (ECS) Pan-Ethnic Panel",
        "category": "Expanded Panel",
        "gene_symbol": "Multi-gene (100–500+ genes)",
        "inheritance_mode": "Autosomal Recessive & X-Linked",
        "clinical_description": "Comprehensive Next-Generation Sequencing panel testing hundreds of severe early-onset inherited conditions regardless of self-reported ethnicity.",
        "who_should_consider": "Couples planning pregnancy who desire maximum available genetic risk visibility before conception.",
        "screening_limitations": "Cannot detect all variants; may uncover Variants of Uncertain Significance (VUS) or mild phenotype variants requiring careful genetic counselling.",
        "residual_risk_explanation": "Residual risk exists for every tested condition due to unmapped private variants and technical sequencing limits.",
        "partner_testing_importance": "Focuses on identifying whether both partners carry pathogenic variants in the same recessive gene, or if the female partner carries an X-linked condition.",
        "guideline_source": "Joint ACOG / ACMG / SMFM / NSGC Statement on Expanded Carrier Screening",
        "guideline_url": "https://www.acmg.net/ACMG/Clinical-Professional-Resources/Carrier_Screening.aspx",
        "last_reviewed_date": "2026-08",
    },
]

DEMO_COUNSELLORS = [
    {
        "id": "cgc-01",
        "full_name": "Dr. Ananya Sharma",
        "title": "MS, CGC — Board Certified Genetic Counsellor",
        "specialty": "Certified Genetic Counsellor",
        "board_certification": "American Board of Genetic Counseling (ABGC) & Board of Genetic Counseling India (BGCI)",
        "clinic_affiliation": "Apollo Genomics & Precision Medicine Institute",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "telehealth_available": True,
        "languages_spoken": ["English", "Hindi", "Kannada"],
        "consultation_availability": "Tomorrow at 10:30 AM (Telehealth)",
        "is_demo_provider": True,
        "profile_bio": "12+ years clinical experience in prenatal, preconception carrier screening, and familial cardiogenetic pedigree analysis.",
    },
    {
        "id": "cgc-02",
        "full_name": "Dr. Rajesh K. Varma",
        "title": "MD, DM (Medical Genetics) — Clinical Geneticist",
        "specialty": "Clinical Geneticist",
        "board_certification": "Medical Council of India & Medical Genetics Specialty Board",
        "clinic_affiliation": "All India Institute of Medical Sciences (AIIMS) Genetics Center",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "telehealth_available": True,
        "languages_spoken": ["English", "Hindi", "Punjabi"],
        "consultation_availability": "In 3 business days (In-Person / Virtual)",
        "is_demo_provider": True,
        "profile_bio": "Specializes in rare Mendelian inherited disorders, multi-generational pedigree mapping, and genomic variant interpretation.",
    },
    {
        "id": "cgc-03",
        "full_name": "Dr. Meenakshi Sundaram",
        "title": "MD, DNB (OBGYN), Fellow in Reproductive Genetics",
        "specialty": "Reproductive Medicine Specialist",
        "board_certification": "Indian College of Obstetricians and Gynaecologists",
        "clinic_affiliation": "Max Healthcare Reproductive Medicine & Preconception Care",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "country": "India",
        "telehealth_available": True,
        "languages_spoken": ["English", "Tamil", "Telugu"],
        "consultation_availability": "Today at 4:00 PM (Telehealth)",
        "is_demo_provider": True,
        "profile_bio": "Focuses on pre-implantation genetic testing (PGT), recurrent pregnancy loss investigation, and expanded carrier screening review.",
    },
    {
        "id": "cgc-04",
        "full_name": "Dr. Priya Deshmukh",
        "title": "MS, CGC — Specialist Genetic Counsellor",
        "specialty": "Maternal-Fetal Medicine Specialist",
        "board_certification": "Board of Genetic Counseling India (BGCI)",
        "clinic_affiliation": "Kokilaben Dhirubhai Ambani Hospital Genomic Medicine",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "telehealth_available": True,
        "languages_spoken": ["English", "Marathi", "Hindi", "Gujarati"],
        "consultation_availability": "Thursday at 2:00 PM (Telehealth)",
        "is_demo_provider": True,
        "profile_bio": "Expert in fetal ultrasound anomalies, non-invasive prenatal screening (NIPS), and high-risk pregnancy counselling.",
    },
]

class FamilyGeneticsService:
    @staticmethod
    def get_or_create_family_group(db: Session, user: User) -> FamilyGroup:
        group = db.query(FamilyGroup).filter(FamilyGroup.user_id == user.id).first()
        if not group:
            group = FamilyGroup(
                user_id=user.id,
                family_name=f"{user.full_name}'s Family Health History",
                proband_name=user.full_name,
                consanguinity_reported=False,
                completeness_score=35.0,
            )
            db.add(group)
            db.commit()
            db.refresh(group)

            # Seed standard 3-generation core pedigree
            proband = FamilyMemberModel(
                id=f"proband_{user.id}",
                group_id=group.id,
                user_id=user.id,
                name=user.full_name,
                relationship_to_proband="Self (Proband)",
                generation=3,
                branch="Immediate",
                gender="unspecified",
                biological_relationship=True,
                is_proband=True,
                is_deceased=False,
                current_age="32",
                history_status="known",
                clinical_notes="Consulting proband.",
            )
            father = FamilyMemberModel(
                id=f"father_{user.id}",
                group_id=group.id,
                user_id=user.id,
                name="Father",
                relationship_to_proband="Father",
                generation=2,
                branch="Paternal",
                gender="male",
                biological_relationship=True,
                is_proband=False,
                is_deceased=False,
                current_age="60",
                history_status="known",
            )
            mother = FamilyMemberModel(
                id=f"mother_{user.id}",
                group_id=group.id,
                user_id=user.id,
                name="Mother",
                relationship_to_proband="Mother",
                generation=2,
                branch="Maternal",
                gender="female",
                biological_relationship=True,
                is_proband=False,
                is_deceased=False,
                current_age="58",
                history_status="known",
            )
            pgf = FamilyMemberModel(
                id=f"pgf_{user.id}",
                group_id=group.id,
                user_id=user.id,
                name="Paternal Grandfather",
                relationship_to_proband="Paternal Grandfather",
                generation=1,
                branch="Paternal",
                gender="male",
                biological_relationship=True,
                is_proband=False,
                is_deceased=True,
                age_at_death="72",
                history_status="known",
            )
            pgm = FamilyMemberModel(
                id=f"pgm_{user.id}",
                group_id=group.id,
                user_id=user.id,
                name="Paternal Grandmother",
                relationship_to_proband="Paternal Grandmother",
                generation=1,
                branch="Paternal",
                gender="female",
                biological_relationship=True,
                is_proband=False,
                is_deceased=False,
                current_age="82",
                history_status="known",
            )
            mgf = FamilyMemberModel(
                id=f"mgf_{user.id}",
                group_id=group.id,
                user_id=user.id,
                name="Maternal Grandfather",
                relationship_to_proband="Maternal Grandfather",
                generation=1,
                branch="Maternal",
                gender="male",
                biological_relationship=True,
                is_proband=False,
                is_deceased=True,
                age_at_death="68",
                history_status="known",
            )
            mgm = FamilyMemberModel(
                id=f"mgm_{user.id}",
                group_id=group.id,
                user_id=user.id,
                name="Maternal Grandmother",
                relationship_to_proband="Maternal Grandmother",
                generation=1,
                branch="Maternal",
                gender="female",
                biological_relationship=True,
                is_proband=False,
                is_deceased=False,
                current_age="80",
                history_status="known",
            )

            db.add_all([proband, father, mother, pgf, pgm, mgf, mgm])
            db.commit()

            # Seed parent-child relationships
            rels = [
                FamilyRelationshipModel(group_id=group.id, from_member_id=father.id, to_member_id=proband.id, relationship_type="parent_of"),
                FamilyRelationshipModel(group_id=group.id, from_member_id=mother.id, to_member_id=proband.id, relationship_type="parent_of"),
                FamilyRelationshipModel(group_id=group.id, from_member_id=pgf.id, to_member_id=father.id, relationship_type="parent_of"),
                FamilyRelationshipModel(group_id=group.id, from_member_id=pgm.id, to_member_id=father.id, relationship_type="parent_of"),
                FamilyRelationshipModel(group_id=group.id, from_member_id=mgf.id, to_member_id=mother.id, relationship_type="parent_of"),
                FamilyRelationshipModel(group_id=group.id, from_member_id=mgm.id, to_member_id=mother.id, relationship_type="parent_of"),
            ]
            db.add_all(rels)
            db.commit()

        # Ensure seed carrier screening records exist in DB
        FamilyGeneticsService._ensure_carrier_seed_data(db)
        FamilyGeneticsService._ensure_counsellor_seed_data(db)

        return group

    @staticmethod
    def _ensure_carrier_seed_data(db: Session):
        count = db.query(CarrierScreeningInfo).count()
        if count == 0:
            for item in DEFAULT_CARRIER_CONDITIONS:
                rec = CarrierScreeningInfo(**item)
                db.add(rec)
            db.commit()

    @staticmethod
    def _ensure_counsellor_seed_data(db: Session):
        count = db.query(GeneticCounsellor).count()
        if count == 0:
            for item in DEMO_COUNSELLORS:
                rec = GeneticCounsellor(**item)
                db.add(rec)
            db.commit()

    @staticmethod
    def calculate_completeness(members: List[FamilyMemberModel]) -> float:
        if not members:
            return 0.0
        # Criteria: 7 standard core members (4 grandparents, 2 parents, proband)
        expected_roles = {"self (proband)", "father", "mother", "paternal grandfather", "paternal grandmother", "maternal grandfather", "maternal grandmother"}
        present_roles = {m.relationship_to_proband.lower() for m in members}
        core_coverage = len(expected_roles.intersection(present_roles)) / 7.0

        # Quality factors: known age/age of death, documented history status, condition reporting
        quality_points = 0
        for m in members:
            if m.history_status == "known":
                quality_points += 1
            if m.current_age or m.age_at_death:
                quality_points += 1
            if m.conditions:
                quality_points += 1

        max_quality = len(members) * 3
        quality_score = (quality_points / max_quality) if max_quality > 0 else 0.5
        total_score = (core_coverage * 0.6 + quality_score * 0.4) * 100.0
        return round(min(100.0, max(15.0, total_score)), 1)

    @staticmethod
    def run_risk_intelligence_engine(db: Session, group: FamilyGroup, user: User) -> Dict[str, Any]:
        """
        Analyzes 3-generation family pedigree and available genetic test records.
        Distinguishes Mendelian patterns (AD, AR, X-linked) from common multifactorial traits.
        Never generates clinical diagnoses; produces structured educational risk awareness.
        """
        members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()
        conditions = (
            db.query(FamilyHealthConditionModel)
            .join(FamilyMemberModel, FamilyHealthConditionModel.member_id == FamilyMemberModel.id)
            .filter(FamilyMemberModel.group_id == group.id)
            .all()
        )
        tests = db.query(GeneticTestRecord).filter(GeneticTestRecord.user_id == user.id).all()

        completeness_pct = FamilyGeneticsService.calculate_completeness(members)
        group.completeness_score = completeness_pct
        db.commit()

        observations = []
        condition_info = []
        missing_info = []
        questions = []
        next_steps = []
        evidence_refs = []
        possible_inheritance = []

        # 1. Inspect conditions
        paternal_conditions = [c for c in conditions if c.member.branch == "Paternal"]
        maternal_conditions = [c for c in conditions if c.member.branch == "Maternal"]
        immediate_conditions = [c for c in conditions if c.member.branch == "Immediate"]

        # Track condition frequencies
        cond_map: Dict[str, List[FamilyMemberModel]] = {}
        for c in conditions:
            c_name = c.condition_name.strip()
            cond_map.setdefault(c_name, []).append(c.member)

        # Evaluate potential Autosomal Dominant patterns
        ad_candidates = []
        for c_name, aff_members in cond_map.items():
            gens = {m.generation for m in aff_members}
            if len(gens) >= 2 and len(aff_members) >= 2:
                ad_candidates.append((c_name, aff_members))
                observations.append({
                    "pattern": "Vertical Transmission (Successive Generations)",
                    "condition": c_name,
                    "affected_count": len(aff_members),
                    "generations": sorted(list(gens)),
                    "notes": f"Observed in {len(aff_members)} members across {len(gens)} generations. May be consistent with autosomal dominant predisposition or shared polygenic/environmental factors.",
                })
                possible_inheritance.append(f"Autosomal Dominant susceptibility or polygenic clustering for '{c_name}'")

        # Evaluate potential Autosomal Recessive & Carrier flags
        carrier_members = [m for m in members if m.is_carrier]
        variants = []
        for t in tests:
            for v in t.variants:
                variants.append(v)
                if v.clinical_significance in ["Pathogenic", "Likely Pathogenic"]:
                    observations.append({
                        "pattern": "Validated Genetic Variant Detected",
                        "condition": v.associated_condition or v.gene_symbol,
                        "gene": v.gene_symbol,
                        "variant": v.variant_hgvs,
                        "zygosity": v.zygosity,
                        "significance": v.clinical_significance,
                        "notes": f"Laboratory report identifies a {v.zygosity} {v.clinical_significance} variant in {v.gene_symbol}.",
                    })
                    possible_inheritance.append(f"{v.inheritance_pattern} ({v.gene_symbol})")

        # Missing information checks
        if completeness_pct < 60.0:
            missing_info.append("Maternal or paternal grand-generational health history has unrecorded entries.")
        for m in members:
            if m.history_status in ["incomplete", "unknown"]:
                missing_info.append(f"Health status for {m.relationship_to_proband} ({m.name or 'Unnamed'}) is recorded as incomplete/unknown.")
            for c in m.conditions:
                if not c.age_at_diagnosis:
                    missing_info.append(f"Age at onset for {c.condition_name} in {m.relationship_to_proband} is unrecorded (early vs late onset is clinically significant).")

        # Determine Educational Risk Category
        has_pathogenic_variant = any(v.clinical_significance in ["Pathogenic", "Likely Pathogenic"] for v in variants)
        has_multi_gen_ad = len(ad_candidates) > 0
        has_carrier_flag = len(carrier_members) > 0 or any(v.zygosity == "Heterozygous" for v in variants)

        if has_pathogenic_variant or (has_multi_gen_ad and len(conditions) >= 3):
            educational_category = "Professional genetic evaluation suggested"
            attention_rationale = (
                "Multi-generational occurrence of reported health conditions and/or validated genetic test variants "
                "suggest that formal genetic risk assessment by a certified professional would be clinically prudent."
            )
        elif has_multi_gen_ad or has_carrier_flag or len(conditions) >= 2:
            educational_category = "Further discussion may be useful"
            attention_rationale = (
                "Observed patterns show shared family history or carrier status that may warrant informational "
                "counselling or pre-test risk education, particularly if considering pregnancy or early screening."
            )
        elif completeness_pct < 50.0:
            educational_category = "Insufficient information"
            attention_rationale = (
                "The current family health tree has several unrecorded or unknown branches. Additional family "
                "records, onset ages, or medical verifications are needed before meaningful educational patterns can be identified."
            )
        else:
            educational_category = "No clear pattern identified"
            attention_rationale = (
                "No strong multi-generational clustering or high-penetrance genetic signals were identified in the reported history. "
                "This does not guarantee zero risk, as polygenic and environmental risk factors may still exist."
            )

        # Standard clinical questions for doctor
        questions = [
            "Given the reported conditions in my pedigree, is dedicated genetic counselling or targeted panel testing indicated for me?",
            "Are the conditions reported in my family typical of early-onset inherited syndromes or multifactorial adult-onset disease?",
            "Should my partner and I consider expanded carrier screening prior to pregnancy planning?",
            "What specific surveillance or earlier clinical screening intervals (e.g. lipid panels, colonoscopy, mammography) apply to me?",
        ]

        next_steps = [
            "Review unrecorded family members and confirm missing ages of onset with living relatives.",
            "Obtain relevant clinical documentation or death certificates for close relatives where hereditary conditions are suspected.",
            "Schedule an educational consultation with a certified genetic counsellor to interpret these findings in clinical context.",
            "Export the Family Health Tree summary to share with your primary care physician during your next physical.",
        ]

        # Trusted Evidence Sources
        evidence_refs = [
            {
                "source": "MedlinePlus Genetics (National Library of Medicine)",
                "title": "Inheritance Patterns and Family Health History",
                "url": "https://medlineplus.gov/genetics/understanding/inheritance/patterns/",
                "date": "2026",
                "notes": "Explains autosomal dominant, recessive, and X-linked transmission mechanics for patients.",
            },
            {
                "source": "GeneReviews® (NCBI / NIH)",
                "title": "Genetic Evaluation of Family Health History",
                "url": "https://www.ncbi.nlm.nih.gov/books/NBK1116/",
                "date": "2025",
                "notes": "Peer-reviewed medical reference resource for clinicians on hereditary disease identification.",
            },
            {
                "source": "CDC Office of Public Health Genomics",
                "title": "Family Health History & Carrier Screening Best Practices",
                "url": "https://www.cdc.gov/genomics/famhistory/index.htm",
                "date": "2026",
                "notes": "Guidelines on collecting structured three-generation family pedigree information.",
            },
        ]

        # Build summary
        summary_text = (
            f"Based on {len(members)} recorded family members across 3 generations and {len(conditions)} reported health condition(s), "
            f"the educational assessment categorizes this pedigree as: '{educational_category}'. "
            f"Completeness is evaluated at {completeness_pct}%. {attention_rationale}"
        )

        risk_rec = GeneticRiskSummary(
            user_id=user.id,
            group_id=group.id,
            summary_text=summary_text,
            educational_category=educational_category,
            family_history_observations=observations,
            relevant_condition_info=[{"condition": c.condition_name, "member": c.member.relationship_to_proband, "age": c.age_at_diagnosis} for c in conditions],
            attention_rationale=attention_rationale,
            missing_information=missing_info,
            suggested_clinician_questions=questions,
            recommended_next_steps=next_steps,
            evidence_references=evidence_refs,
            data_quality_indicator=f"{'High' if completeness_pct >= 75 else 'Moderate' if completeness_pct >= 50 else 'Low'} Completeness ({completeness_pct}%)",
            disclaimer=STANDARD_DISCLAIMER,
        )
        db.add(risk_rec)
        db.commit()
        db.refresh(risk_rec)

        return {
            "id": risk_rec.id,
            "group_id": group.id,
            "summary_text": summary_text,
            "educational_category": educational_category,
            "family_history_observations": observations,
            "relevant_condition_info": risk_rec.relevant_condition_info,
            "attention_rationale": attention_rationale,
            "missing_information": missing_info,
            "suggested_clinician_questions": questions,
            "recommended_next_steps": next_steps,
            "evidence_references": evidence_refs,
            "data_quality_indicator": risk_rec.data_quality_indicator,
            "disclaimer": STANDARD_DISCLAIMER,
            "created_at": risk_rec.created_at,
        }

    @staticmethod
    def get_or_create_preconception_plan(db: Session, user: User) -> PreconceptionPlan:
        plan = db.query(PreconceptionPlan).filter(PreconceptionPlan.user_id == user.id).first()
        if not plan:
            plan = PreconceptionPlan(
                user_id=user.id,
                target_timeline="Planning within 6-12 months",
                checklist_state={
                    "family_history_reviewed": True,
                    "folic_acid_started": False,
                    "carrier_screening_discussed": False,
                    "rubella_varicella_immunity_checked": False,
                    "medication_safety_audit": False,
                    "dental_checkup": False,
                    "partner_carrier_screening": False,
                    "genetic_counsellor_scheduled": False,
                },
                custom_questions=[
                    "Are there any prescription or OTC medications I should modify before trying to conceive?",
                    "Do my partner and I need genetic carrier screening for hemoglobinopathies or spinal muscular atrophy?",
                    "When should preconception prenatal vitamins with 400-800 mcg folic acid be initiated?",
                ],
                clinical_summary_notes="Personal preconception education workspace initiated.",
            )
            db.add(plan)
            db.commit()
            db.refresh(plan)
        return plan

    @staticmethod
    def create_specialist_referral(
        db: Session,
        user: User,
        data: SpecialistReferralCreate,
    ) -> SpecialistReferral:
        if not data.consent_granted:
            raise ValueError("Explicit consent is legally required before initiating a specialist referral.")

        counsellor = db.query(GeneticCounsellor).filter(GeneticCounsellor.id == data.counsellor_id).first()
        if not counsellor:
            raise ValueError(f"Specialist '{data.counsellor_id}' not found in directory.")

        ref_id = f"ref_{uuid.uuid4().hex[:10]}"
        group = db.query(FamilyGroup).filter(FamilyGroup.user_id == user.id).first()

        # Build sanitized referral package
        summary_payload = {
            "patient_full_name": user.full_name,
            "patient_email": user.email,
            "referral_date": datetime.datetime.utcnow().isoformat(),
            "specialist": counsellor.full_name,
            "reason": data.referral_reason,
            "priority": data.clinical_priority,
            "family_tree_attached": data.include_family_tree,
            "genetic_tests_attached": data.include_genetic_tests,
            "disclaimer": STANDARD_DISCLAIMER,
        }

        referral = SpecialistReferral(
            id=ref_id,
            user_id=user.id,
            counsellor_id=counsellor.id,
            specialty_requested=counsellor.specialty,
            referral_reason=data.referral_reason,
            clinical_priority=data.clinical_priority,
            status="Requested",
            consent_granted=True,
            consent_timestamp=datetime.datetime.utcnow(),
            include_family_tree=data.include_family_tree,
            include_genetic_tests=data.include_genetic_tests,
            scheduled_appointment_time=datetime.datetime.utcnow() + datetime.timedelta(days=3),
            secure_referral_summary=summary_payload,
            notes_for_specialist=data.notes_for_specialist,
        )
        db.add(referral)
        db.commit()
        db.refresh(referral)
        return referral

    @staticmethod
    def get_dashboard_overview(db: Session, user: User) -> Dict[str, Any]:
        group = FamilyGeneticsService.get_or_create_family_group(db, user)
        members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()
        conditions = (
            db.query(FamilyHealthConditionModel)
            .join(FamilyMemberModel, FamilyHealthConditionModel.member_id == FamilyMemberModel.id)
            .filter(FamilyMemberModel.group_id == group.id)
            .all()
        )
        tests = db.query(GeneticTestRecord).filter(GeneticTestRecord.user_id == user.id).all()
        referrals = db.query(SpecialistReferral).filter(SpecialistReferral.user_id == user.id).all()
        pending_refs = [r for r in referrals if r.status in ["Requested", "Consent Confirmed", "Scheduled"]]
        latest_risk = (
            db.query(GeneticRiskSummary)
            .filter(GeneticRiskSummary.user_id == user.id)
            .order_by(GeneticRiskSummary.created_at.desc())
            .first()
        )
        observations = db.query(InheritanceObservation).filter(InheritanceObservation.group_id == group.id).all()

        plan = db.query(PreconceptionPlan).filter(PreconceptionPlan.user_id == user.id).first()
        carrier_completed = 1 if (plan and plan.carrier_screening_discussed) else 0

        completeness = FamilyGeneticsService.calculate_completeness(members)

        return {
            "family_members_count": len(members),
            "family_history_completeness_pct": completeness,
            "known_conditions_count": len(conditions),
            "genetic_tests_count": len(tests),
            "screening_discussions_completed": carrier_completed,
            "pending_referrals_count": len(pending_refs),
            "educational_risk_level": latest_risk.educational_category if latest_risk else "Educational Assessment Pending",
            "observed_patterns_count": len(observations),
            "disclaimer": STANDARD_DISCLAIMER,
        }
