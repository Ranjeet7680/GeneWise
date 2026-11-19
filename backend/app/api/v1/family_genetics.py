import datetime
import logging
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_db
from app.models.family_genetics import (
    FamilyGroup,
    FamilyMemberModel,
    FamilyRelationshipModel,
    FamilyHealthConditionModel,
    GeneticTestRecord,
    GeneticVariant,
    CarrierScreeningInfo,
    PreconceptionPlan,
    GeneticRiskSummary,
    GeneticEvidenceSource,
    GeneticCounsellor,
    SpecialistReferral,
    GeneticDataConsent,
)
from app.models.models import User, AuditEvent
from app.services.audit.audit_service import AuditService
from app.schemas.family_genetics import (
    AIAssistantRequest,
    AIAssistantResponse,
    CarrierScreeningItemOut,
    ConsentItemOut,
    ConsentStateOut,
    ConsentToggleRequest,
    FamilyConditionBase,
    FamilyConditionCreate,
    FamilyConditionOut,
    FamilyMemberCreate,
    FamilyMemberOut,
    FamilyMemberUpdate,
    FamilyRelationshipCreate,
    FamilyRelationshipOut,
    FamilyTreeExportResponse,
    GeneticCounsellorOut,
    GeneticRiskSummaryOut,
    OverviewDashboardOut,
    PreconceptionPlanOut,
    PreconceptionPlanUpdate,
    SpecialistReferralCreate,
    SpecialistReferralOut,
)
from app.services.family_genetics_service import (
    FamilyGeneticsService,
    STANDARD_DISCLAIMER,
)
from app.services.ai.genetic_assistant import GeneticAIAssistant
from app.services.ai.explainable_engine import explainable_ai

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/family-genetics", tags=["Family Health & Genetics"])

# ----------------- Dashboard Overview -----------------
@router.get("/overview", response_model=OverviewDashboardOut)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns high-level summary cards and completeness metrics for Family Health & Genetics."""
    return FamilyGeneticsService.get_dashboard_overview(db, current_user)

# ----------------- Family Tree & Members -----------------
@router.get("/tree")
def get_family_tree(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves full three-generation family tree structure, members, and conditions."""
    group = FamilyGeneticsService.get_or_create_family_group(db, current_user)
    members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()
    relationships = db.query(FamilyRelationshipModel).filter(FamilyRelationshipModel.group_id == group.id).all()
    completeness = FamilyGeneticsService.calculate_completeness(members)

    return {
        "group_id": group.id,
        "family_name": group.family_name,
        "proband_name": group.proband_name,
        "completeness_score": completeness,
        "consanguinity_reported": group.consanguinity_reported,
        "members": members,
        "relationships": relationships,
        "disclaimer": STANDARD_DISCLAIMER,
    }

@router.post("/members", response_model=FamilyMemberOut, status_code=status.HTTP_201_CREATED)
def add_family_member(
    data: FamilyMemberCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Adds a relative to the family tree with biological relationships and branch specifications."""
    group = FamilyGeneticsService.get_or_create_family_group(db, current_user)
    member_id = data.id or f"mem_{uuid.uuid4().hex[:8]}"

    member = FamilyMemberModel(
        id=member_id,
        group_id=group.id,
        user_id=current_user.id,
        name=data.name or data.relationship_to_proband,
        relationship_to_proband=data.relationship_to_proband,
        generation=data.generation,
        branch=data.branch,
        gender=data.gender,
        biological_relationship=data.biological_relationship,
        is_proband=data.is_proband,
        is_deceased=data.is_deceased,
        is_carrier=data.is_carrier,
        current_age=data.current_age,
        age_at_death=data.age_at_death,
        cause_of_death=data.cause_of_death,
        history_status=data.history_status,
        clinical_notes=data.clinical_notes,
    )
    db.add(member)
    db.commit()

    if data.conditions:
        for c in data.conditions:
            cond = FamilyHealthConditionModel(
                member_id=member.id,
                condition_name=c.condition_name,
                category=c.category or "General",
                icd10_code=c.icd10_code,
                age_at_diagnosis=c.age_at_diagnosis,
                is_genetic=c.is_genetic or False,
                suspected_inheritance=c.suspected_inheritance or "Unknown",
                verification_level=c.verification_level or "Family Reported",
                clinical_details=c.clinical_details,
            )
            db.add(cond)
        db.commit()

    # Recalculate completeness
    all_members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()
    group.completeness_score = FamilyGeneticsService.calculate_completeness(all_members)
    db.commit()
    db.refresh(member)

    # Audit logging with HMAC tamper-evident signature
    AuditService.log_event(
        db=db,
        action="FAMILY_MEMBER_CREATE",
        user_id=current_user.id,
        resource_type="family_member",
        resource_id=str(member.id),
        details={"relationship": member.relationship_to_proband, "branch": member.branch},
        ip_address=request.client.host if request.client else "127.0.0.1",
    )

    return member

@router.put("/members/{member_id}", response_model=FamilyMemberOut)
def update_family_member(
    member_id: str,
    data: FamilyMemberUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates relative details, vital status, and notes."""
    member = (
        db.query(FamilyMemberModel)
        .filter(FamilyMemberModel.id == member_id, FamilyMemberModel.user_id == current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found.")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(member, k, v)

    member.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(member)
    return member

@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family_member(
    member_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Removes a family member and associated relations from the pedigree."""
    member = (
        db.query(FamilyMemberModel)
        .filter(FamilyMemberModel.id == member_id, FamilyMemberModel.user_id == current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found.")

    if member.is_proband:
        raise HTTPException(status_code=400, detail="Cannot delete proband (primary user) node from family tree.")

    group_id = member.group_id
    db.delete(member)
    db.commit()

    # Recalculate completeness
    group = db.query(FamilyGroup).filter(FamilyGroup.id == group_id).first()
    if group:
        all_members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()
        group.completeness_score = FamilyGeneticsService.calculate_completeness(all_members)
        db.commit()

    return None

@router.post("/conditions", response_model=FamilyConditionOut, status_code=status.HTTP_201_CREATED)
def add_member_condition(
    data: FamilyConditionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Records a health condition and onset age for a specific relative."""
    member = (
        db.query(FamilyMemberModel)
        .filter(FamilyMemberModel.id == data.member_id, FamilyMemberModel.user_id == current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found.")

    cond = FamilyHealthConditionModel(
        member_id=data.member_id,
        condition_name=data.condition_name,
        category=data.category or "General",
        icd10_code=data.icd10_code,
        age_at_diagnosis=data.age_at_diagnosis,
        is_genetic=data.is_genetic or False,
        suspected_inheritance=data.suspected_inheritance or "Unknown",
        verification_level=data.verification_level or "Family Reported",
        clinical_details=data.clinical_details,
    )
    db.add(cond)
    db.commit()
    db.refresh(cond)
    return cond

@router.delete("/conditions/{condition_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member_condition(
    condition_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes a recorded health condition from a relative's profile."""
    cond = (
        db.query(FamilyHealthConditionModel)
        .join(FamilyMemberModel, FamilyHealthConditionModel.member_id == FamilyMemberModel.id)
        .filter(FamilyHealthConditionModel.id == condition_id, FamilyMemberModel.user_id == current_user.id)
        .first()
    )
    if not cond:
        raise HTTPException(status_code=404, detail="Condition record not found.")

    db.delete(cond)
    db.commit()
    return None

@router.get("/export", response_model=FamilyTreeExportResponse)
def export_family_history_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates an exportable three-generation family pedigree and health condition summary."""
    group = FamilyGeneticsService.get_or_create_family_group(db, current_user)
    members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()
    relationships = db.query(FamilyRelationshipModel).filter(FamilyRelationshipModel.group_id == group.id).all()
    completeness = FamilyGeneticsService.calculate_completeness(members)

    return {
        "group_id": group.id,
        "family_name": group.family_name,
        "proband_name": group.proband_name,
        "exported_at": datetime.datetime.utcnow().isoformat(),
        "completeness_score": completeness,
        "members_count": len(members),
        "members": members,
        "relationships": relationships,
        "disclaimer": STANDARD_DISCLAIMER,
    }

# ----------------- Genetic Risk Intelligence Engine -----------------
@router.post("/risk-analysis", response_model=GeneticRiskSummaryOut)
def run_risk_intelligence_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Executes the educational risk-awareness engine across the pedigree."""
    group = FamilyGeneticsService.get_or_create_family_group(db, current_user)
    return FamilyGeneticsService.run_risk_intelligence_engine(db, group, current_user)

@router.get("/risk-summary/latest", response_model=Optional[GeneticRiskSummaryOut])
def get_latest_risk_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves the most recent structured risk summary generated for this user."""
    rec = (
        db.query(GeneticRiskSummary)
        .filter(GeneticRiskSummary.user_id == current_user.id)
        .order_by(GeneticRiskSummary.created_at.desc())
        .first()
    )
    if not rec:
        group = FamilyGeneticsService.get_or_create_family_group(db, current_user)
        return FamilyGeneticsService.run_risk_intelligence_engine(db, group, current_user)
    return rec

# ----------------- Carrier Screening -----------------
@router.get("/carrier-screening", response_model=List[CarrierScreeningItemOut])
def get_carrier_screening_catalog(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the evidence-based educational carrier screening information directory."""
    FamilyGeneticsService._ensure_carrier_seed_data(db)
    q = db.query(CarrierScreeningInfo)
    if category:
        q = q.filter(CarrierScreeningInfo.category.ilike(f"%{category}%"))
    return q.all()

# ----------------- Preconception Planning -----------------
@router.get("/preconception", response_model=PreconceptionPlanOut)
def get_preconception_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Gets the user's guided preconception planning workspace state."""
    return FamilyGeneticsService.get_or_create_preconception_plan(db, current_user)

@router.put("/preconception", response_model=PreconceptionPlanOut)
def update_preconception_plan(
    data: PreconceptionPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates preconception milestones, partner consent status, and custom clinician questions."""
    plan = FamilyGeneticsService.get_or_create_preconception_plan(db, current_user)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(plan, k, v)
    plan.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/preconception/export")
def export_preconception_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates a downloadable preconception preparation summary for clinical consultation."""
    plan = FamilyGeneticsService.get_or_create_preconception_plan(db, current_user)
    overview = FamilyGeneticsService.get_dashboard_overview(db, current_user)

    return {
        "title": "MediPredict AI — Preconception Planning & Carrier Screening Summary",
        "patient": current_user.full_name,
        "timeline": plan.target_timeline,
        "exported_at": datetime.datetime.utcnow().isoformat(),
        "checklist": plan.checklist_state,
        "questions_to_ask": plan.custom_questions,
        "family_history_completeness": f"{overview['family_history_completeness_pct']}%",
        "conditions_recorded": overview["known_conditions_count"],
        "educational_risk_level": overview["educational_risk_level"],
        "notes": plan.clinical_summary_notes,
        "disclaimer": STANDARD_DISCLAIMER,
    }

# ----------------- Counsellors & Referrals -----------------
@router.get("/counsellors", response_model=List[GeneticCounsellorOut])
def list_genetic_counsellors(
    specialty: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    telehealth_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Searches the verified specialist and genetic counsellor directory (demo directory)."""
    FamilyGeneticsService._ensure_counsellor_seed_data(db)
    q = db.query(GeneticCounsellor)
    if specialty:
        q = q.filter(GeneticCounsellor.specialty.ilike(f"%{specialty}%"))
    if city:
        q = q.filter(GeneticCounsellor.city.ilike(f"%{city}%"))
    if telehealth_only:
        q = q.filter(GeneticCounsellor.telehealth_available.is_(True))
    return q.all()

@router.post("/referrals", response_model=SpecialistReferralOut, status_code=status.HTTP_201_CREATED)
def create_specialist_referral(
    data: SpecialistReferralCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Initiates an appointment request to a specialist with verified consent."""
    try:
        referral = FamilyGeneticsService.create_specialist_referral(db, current_user, data)
        # Log referral creation with HMAC signature
        AuditService.log_event(
            db=db,
            action="SPECIALIST_REFERRAL_CREATE",
            user_id=current_user.id,
            resource_type="specialist_referral",
            resource_id=referral.id,
            details={"counsellor_id": data.counsellor_id, "priority": data.clinical_priority},
            ip_address=request.client.host if request.client else "127.0.0.1",
        )
        return referral
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/referrals", response_model=List[SpecialistReferralOut])
def list_my_referrals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists current user's requested referrals and appointment reminders."""
    referrals = (
        db.query(SpecialistReferral)
        .filter(SpecialistReferral.user_id == current_user.id)
        .order_by(SpecialistReferral.created_at.desc())
        .all()
    )
    for r in referrals:
        if r.counsellor:
            r.counsellor_name = r.counsellor.full_name
    return referrals

# ----------------- AI Genetic Assistant -----------------
@router.post("/assistant/query", response_model=AIAssistantResponse)
def query_ai_genetic_assistant(
    data: AIAssistantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Executes the explainable AI genetic assistant with structured 9-field response format."""
    return GeneticAIAssistant.answer_genetic_query(
        query=data.query,
        user=current_user,
        db=db,
        language=data.language or "en-US",
        include_pedigree_context=data.include_pedigree_context,
    )

# ----------------- Consent & Privacy Governance -----------------
@router.get("/consent", response_model=ConsentStateOut)
def get_genetic_consent_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns granular consent states for family history analysis and partner sharing."""
    consents = db.query(GeneticDataConsent).filter(GeneticDataConsent.user_id == current_user.id).all()
    out_items = []
    types_found = {c.consent_type for c in consents}

    standard_types = [
        "family_history_analysis",
        "carrier_screening_education",
        "partner_data_sharing",
        "referral_data_transfer",
    ]

    for c in consents:
        out_items.append(
            ConsentItemOut(
                consent_type=c.consent_type,
                granted=c.granted,
                version=c.version,
                granted_at=c.granted_at,
                revoked_at=c.revoked_at,
            )
        )

    for st in standard_types:
        if st not in types_found:
            out_items.append(
                ConsentItemOut(
                    consent_type=st,
                    granted=True if st == "family_history_analysis" else False,
                    version="1.0",
                )
            )

    return {"consents": out_items, "disclaimer": STANDARD_DISCLAIMER}

@router.post("/consent", response_model=ConsentStateOut)
def toggle_genetic_consent(
    data: ConsentToggleRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grants or withdraws specific consent for genetic data processing."""
    rec = (
        db.query(GeneticDataConsent)
        .filter(GeneticDataConsent.user_id == current_user.id, GeneticDataConsent.consent_type == data.consent_type)
        .first()
    )
    now = datetime.datetime.utcnow()
    ip = request.client.host if request.client else "127.0.0.1"

    if not rec:
        rec = GeneticDataConsent(
            user_id=current_user.id,
            consent_type=data.consent_type,
            granted=data.granted,
            version="1.0",
            ip_address=ip,
            granted_at=now if data.granted else None,
            revoked_at=None if data.granted else now,
        )
        db.add(rec)
    else:
        rec.granted = data.granted
        rec.ip_address = ip
        if data.granted:
            rec.granted_at = now
            rec.revoked_at = None
        else:
            rec.revoked_at = now

    db.commit()

    # Audit logging with HMAC signature
    AuditService.log_event(
        db=db,
        action="GENETIC_CONSENT_UPDATE",
        user_id=current_user.id,
        resource_type="genetic_consent",
        resource_id=data.consent_type,
        details={"granted": data.granted},
        ip_address=ip,
    )

    return get_genetic_consent_status(db, current_user)

@router.post("/purge-data", status_code=status.HTTP_200_OK)
def purge_genetic_and_family_data(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Irrevocably deletes all personal pedigree, condition, and genetic data (DPDP / HIPAA compliant)."""
    group = db.query(FamilyGroup).filter(FamilyGroup.user_id == current_user.id).first()
    if group:
        db.delete(group)

    plan = db.query(PreconceptionPlan).filter(PreconceptionPlan.user_id == current_user.id).first()
    if plan:
        db.delete(plan)

    db.query(GeneticTestRecord).filter(GeneticTestRecord.user_id == current_user.id).delete()
    db.query(SpecialistReferral).filter(SpecialistReferral.user_id == current_user.id).delete()
    db.query(GeneticRiskSummary).filter(GeneticRiskSummary.user_id == current_user.id).delete()
    db.query(GeneticDataConsent).filter(GeneticDataConsent.user_id == current_user.id).delete()

    AuditService.log_event(
        db=db,
        action="FAMILY_GENETICS_PURGE",
        user_id=current_user.id,
        resource_type="family_genetics",
        resource_id=str(current_user.id),
        details={"status": "all_family_and_genetic_records_purged"},
        ip_address=request.client.host if request.client else "127.0.0.1",
    )

    return {"message": "All family health history and genetic data successfully purged.", "status": "purged"}

# ----------------- Evidence Catalog -----------------
@router.get("/evidence")
def list_genetic_evidence_sources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns trusted medical evidence sources underpinning the risk awareness models."""
    sources = [
        {
            "source_name": "MedlinePlus Genetics (National Library of Medicine)",
            "reference_title": "Inheritance Patterns and Genetic Mechanisms",
            "topic_category": "Inheritance",
            "publication_date": "2026",
            "url": "https://medlineplus.gov/genetics/understanding/inheritance/",
            "evidence_tier": "NIH / National Library of Medicine",
            "limitations": "Educational consumer health resource; does not supersede molecular diagnostic interpretation.",
        },
        {
            "source_name": "GeneReviews® (NCBI / NIH)",
            "reference_title": "Genetic Evaluation of Hereditary Disorders",
            "topic_category": "Clinical Genetics",
            "publication_date": "2025",
            "url": "https://www.ncbi.nlm.nih.gov/books/NBK1116/",
            "evidence_tier": "Peer-Reviewed Clinical Reference Manual",
            "limitations": "Comprehensive expert monographs; requires qualified medical genetics training to apply to clinical care.",
        },
        {
            "source_name": "National Human Genome Research Institute (NHGRI)",
            "reference_title": "Talking Glossary of Genomic and Genetic Terms",
            "topic_category": "Education",
            "publication_date": "2026",
            "url": "https://www.genome.gov/genetics-glossary",
            "evidence_tier": "Federal Research Institute Standards",
            "limitations": "Definitional glossary; should not be used as clinical diagnostic criteria.",
        },
        {
            "source_name": "ACOG Committee Opinion No. 691",
            "reference_title": "Carrier Screening for Genetic Conditions",
            "topic_category": "Carrier Screening",
            "publication_date": "Reaffirmed 2026",
            "url": "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/03/carrier-screening-for-genetic-conditions",
            "evidence_tier": "Clinical Practice Guideline",
            "limitations": "Practice guideline; patient-specific decisions must be personalized by an obstetrician or clinical geneticist.",
        },
    ]
    return {"evidence_sources": sources, "disclaimer": STANDARD_DISCLAIMER}

# ----------------- Explainable AI Engine -----------------
@router.post("/explain")
def generate_explainable_dossier(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Produces a 6-dimensional explainability breakdown for any clinical or genetic insight.
    """
    title = payload.get("title", "Genetic Risk & Carrier Trait Finding")
    insight_type = payload.get("insight_type", "genetics_pedigree")

    # Fetch actual pedigree nodes for contextual grounding
    group = FamilyGeneticsService.get_or_create_family_group(db, current_user)
    members = db.query(FamilyMemberModel).filter(FamilyMemberModel.group_id == group.id).all()

    family_obs = []
    for m in members:
        if m.is_carrier or m.conditions:
            cond_names = ", ".join(c.condition_name for c in m.conditions) or "Carrier Trait"
            family_obs.append({"relative": m.name or m.relationship_to_proband, "branch": m.branch, "condition": cond_names})

    dossier = explainable_ai.generate_explainability_dossier(
        insight_type=insight_type,
        title=title,
        analyzed_data={"pedigree_nodes_count": len(members)},
        family_history_context=family_obs if family_obs else None,
        clinical_logic=payload.get("clinical_logic"),
        missing_data_points=payload.get("missing_data_points"),
        next_steps=payload.get("next_steps"),
    )
    return dossier

# ----------------- Interactive Preconception Questionnaire -----------------
@router.get("/questionnaire")
def get_preconception_questionnaire(
    current_user: User = Depends(get_current_user),
):
    """
    Returns the guided 5-part questionnaire schema for family history & preconception screening.
    """
    sections = [
        {
            "id": "ancestral_origins",
            "title": "Ancestral Origins & Consanguinity",
            "description": "Certain conditions occur with higher prevalence in specific geographical or cultural cohorts.",
            "questions": [
                {
                    "id": "q_ancestry",
                    "label": "Are either you or your reproductive partner of Mediterranean, South Asian, African, or Middle Eastern descent?",
                    "type": "boolean",
                    "clinical_significance": "Associated with elevated prevalence of hemoglobinopathies (Thalassemia, Sickle Cell Disease)."
                },
                {
                    "id": "q_consanguinity",
                    "label": "Are you and your partner blood relatives (e.g. first cousins, second cousins)?",
                    "type": "boolean",
                    "clinical_significance": "Consanguinity increases the statistical likelihood of sharing rare autosomal recessive alleles."
                }
            ]
        },
        {
            "id": "known_conditions",
            "title": "Personal & Partner Medical Conditions",
            "description": "Document known hereditary or early-onset medical conditions.",
            "questions": [
                {
                    "id": "q_chronic_conditions",
                    "label": "Do you or your partner have a history of diabetes, hypertension, epilepsy, or autoimmune conditions?",
                    "type": "boolean",
                    "clinical_significance": "Maternal glycemic control and blood pressure require preconception stabilization to prevent congenital anomalies."
                },
                {
                    "id": "q_unexplained_loss",
                    "label": "Has there been any history of recurrent pregnancy loss (2+ miscarriages) or stillbirth in your family?",
                    "type": "boolean",
                    "clinical_significance": "May warrant parental karyotyping to rule out balanced chromosomal translocations."
                }
            ]
        },
        {
            "id": "medications_teratogens",
            "title": "Medications & Teratogen Audit",
            "description": "Certain prescription drugs carry teratogenic risk during embryogenesis.",
            "questions": [
                {
                    "id": "q_teratogens",
                    "label": "Are you taking medications such as ACE inhibitors, retinoids/isotretinoin, methotrexate, or anti-seizure drugs (valproate)?",
                    "type": "boolean",
                    "clinical_significance": "High teratogenic risk requiring medication transition prior to attempting conception."
                },
                {
                    "id": "q_folic_acid",
                    "label": "Have you begun daily folic acid supplementation (400-800 mcg/day)?",
                    "type": "boolean",
                    "clinical_significance": "Significantly mitigates neural tube defect (anencephaly, spina bifida) risk when started prior to conception."
                }
            ]
        },
        {
            "id": "previous_genetics",
            "title": "Prior Genetic & Carrier Testing",
            "description": "Record previous molecular or chromosomal tests.",
            "questions": [
                {
                    "id": "q_past_testing",
                    "label": "Have you or your partner ever undergone carrier screening, karyotyping, or DNA variant testing?",
                    "type": "boolean",
                    "clinical_significance": "Prevents redundant testing and guides targeted single-gene testing."
                }
            ]
        }
    ]
    return {"sections": sections, "disclaimer": STANDARD_DISCLAIMER}

@router.post("/questionnaire/submit")
def submit_preconception_questionnaire(
    answers: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits questionnaire answers and updates the user's preconception planning record.
    """
    plan = db.query(PreconceptionPlan).filter(PreconceptionPlan.user_id == current_user.id).first()
    if not plan:
        plan = PreconceptionPlan(user_id=current_user.id)
        db.add(plan)

    curr_state = plan.checklist_state or {}
    curr_state.update(answers)
    plan.checklist_state = curr_state

    # Auto-update milestone flags if indicated
    if answers.get("q_past_testing") is True:
        plan.carrier_screening_discussed = True
    if answers.get("q_teratogens") is not None:
        plan.medications_reviewed = True

    db.commit()
    db.refresh(plan)

    return {
        "status": "success",
        "message": "Preconception questionnaire answers saved successfully.",
        "plan_id": plan.id,
        "completed_answers_count": len(curr_state),
    }
