import datetime
import hashlib
import uuid
from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.v1.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import ForbiddenException, NotFoundException
from app.db.session import get_db
from app.models.models import (
    Conversation,
    FamilyHealthConditionModel,
    FamilyMemberModel,
    GeneticCounsellor,
    GeneticTestRecord,
    GeneticVariant,
    HealthMeasurement,
    LaboratoryMeasurement,
    MedicalReport,
    Message,
    PersonalRecord,
    SpecialistReferral,
    User,
    UserConsent,
    WearableMeasurement,
)
from app.schemas.schemas import (
    AuthorizedHealthContextResponse,
    ConsultationSummaryRequest,
    ConsultationSummaryResponse,
    ConversationCreate,
    ConversationDetailResponse,
    ConversationResponse,
    MedicationEducationRequest,
    MedicationEducationResponse,
    MessageCreate,
    MessageResponse,
    ProviderStatusResponse,
    SymptomCheckRequest,
    SymptomCheckResponse,
)
from app.services.ai.factory import AIProviderFactory
from app.services.ai.guardrails import AIGuardrailService
from app.services.ai.medication_service import MedicationEducationService
from app.services.ai.symptom_checker import SymptomCheckerService
from app.services.audit.audit_service import AuditService
from app.services.medical_rag.retrieval_service import MedicalRAGService

router = APIRouter(prefix="/assistant", tags=["Medical Assistant"])

@router.get("/providers", response_model=ProviderStatusResponse)
def get_providers():
    return {
        "current_provider": settings.AI_PROVIDER,
        "providers": AIProviderFactory.get_all_provider_status(),
    }

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    result = []
    for c in convs:
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == c.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        res_item = ConversationResponse.model_validate(c)
        res_item.last_message = last_msg.content[:80] + "..." if last_msg else None
        result.append(res_item)
    return result

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = Conversation(
        user_id=current_user.id,
        title=conv_in.title or "New Medical Consultation",
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Add initial greeting message
    greeting = Message(
        conversation_id=conv.id,
        role="assistant",
        content=(
            "Hello! I am GeneWise AI, your clinical intelligence and medical information assistant. "
            "I can explain laboratory measurements, reference guidelines, and research papers.\n\n"
            "How can I assist your health and medical inquiry today?"
        ),
        sources=[],
    )
    db.add(greeting)
    db.commit()

    return conv

@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise NotFoundException("Conversation not found")
    if conv.user_id != current_user.id:
        raise ForbiddenException()

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    res = ConversationDetailResponse.model_validate(conv)
    res.messages = [MessageResponse.model_validate(m) for m in messages]
    return res

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise NotFoundException("Conversation not found")
    if conv.user_id != current_user.id:
        raise ForbiddenException()

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise NotFoundException("Conversation not found")
    if conv.user_id != current_user.id:
        raise ForbiddenException()

    # 1. Inspect prompt for injection & acute emergencies
    is_emergency, emergency_msg, injection_alert = AIGuardrailService.sanitize_and_inspect_prompt(
        prompt=msg_in.content,
        user_id=current_user.id,
        db=db,
    )

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=msg_in.content,
    )
    db.add(user_msg)
    db.commit()

    if is_emergency:
        assistant_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=AIGuardrailService.enforce_statutory_disclaimer(emergency_msg),
            safety_alerts=["CRITICAL_EMERGENCY_TRIAGE"],
        )
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)
        return assistant_msg

    # If first non-greeting message, update conversation title
    msg_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
    if msg_count <= 2:
        conv.title = msg_in.content[:40] + ("..." if len(msg_in.content) > 40 else "")
        db.commit()

    # 2. Check for attached medical report context (guarded by affirmative consent)
    report_data = None
    has_consent = AIGuardrailService.check_medical_data_access_consent(current_user.id, db)
    if msg_in.report_attachment_id and has_consent:
        report = db.query(MedicalReport).filter(MedicalReport.id == msg_in.report_attachment_id).first()
        if report and report.user_id == current_user.id:
            report_data = {
                "title": report.title,
                "measurements": [
                    {
                        "test_name": m.test_name,
                        "value": m.value,
                        "unit": m.unit,
                        "flag": m.flag,
                        "reference_text": m.reference_text,
                    }
                    for m in report.measurements
                ],
            }

    # 3. Retrieve Evidence Context via Medical RAG
    retrieved_evidence = MedicalRAGService.retrieve_evidence(db, msg_in.content, limit=3)

    # 4. Query AI Provider
    provider = AIProviderFactory.get_provider(msg_in.provider)
    chat_history = [
        {"role": m.role, "content": m.content}
        for m in db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    ]

    ai_result = await provider.generate_response(
        messages=chat_history,
        retrieved_context=retrieved_evidence,
        report_data=report_data,
    )

    content_out = AIGuardrailService.enforce_statutory_disclaimer(ai_result["content"])
    safety_alerts = ai_result.get("safety_alerts", [])
    if injection_alert:
        safety_alerts.append(injection_alert)

    # 5. Save assistant response
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=content_out,
        sources=ai_result.get("sources", []),
        safety_alerts=safety_alerts,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    AuditService.log_event(
        db,
        action="AI_QUERY",
        user_id=current_user.id,
        resource_type="Message",
        resource_id=str(assistant_msg.id),
        details={"provider": ai_result.get("provider"), "model": ai_result.get("model")},
    )

    return assistant_msg

@router.post("/symptom-check", response_model=SymptomCheckResponse)
def evaluate_symptoms(
    req: SymptomCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evidence-grounded symptom triage and red-flag screening.
    Categorizes urgency, returns clinical guideline citations, and physician questions.
    """
    AIGuardrailService.validate_tool_call("symptom_triage_checker", user_id=current_user.id, db=db)

    result = SymptomCheckerService.evaluate_symptoms(
        primary_symptom=req.primary_symptom,
        duration=req.duration or "few days",
        severity=req.severity,
        associated_symptoms=req.associated_symptoms or [],
        relevant_medical_history=req.relevant_medical_history or [],
        current_medications=req.current_medications or [],
        user_age=req.user_age,
        user_biological_sex=req.user_biological_sex,
    )

    AuditService.log_event(
        db,
        action="SYMPTOM_EVALUATION",
        user_id=current_user.id,
        resource_type="SymptomCheck",
        details={
            "primary_symptom": req.primary_symptom,
            "severity": req.severity,
            "triage_level": result["triage_level"],
            "red_flags_count": len(result.get("red_flags_detected", [])),
        },
    )
    return result

@router.get("/health-context", response_model=AuthorizedHealthContextResponse)
def get_authorized_health_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves authorized, minimal clinical telemetry for the active assistant session.
    Respects DPDP Act / HIPAA privacy consent controls and data minimization.
    """
    consent_rows = db.query(UserConsent).filter(UserConsent.user_id == current_user.id).all()
    consent_status = {c.consent_type: c.granted for c in consent_rows}
    if not consent_status:
        consent_status = {
            "medical_data_access": True,
            "genetic_data_processing": True,
            "sensor_telemetry_access": True,
        }

    # 1. Recent laboratory reports (limit 3)
    recent_reports = []
    reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == current_user.id)
        .order_by(MedicalReport.created_at.desc())
        .limit(3)
        .all()
    )
    for r in reports:
        abnormal_items = [
            {"test": m.test_name, "value": m.value, "unit": m.unit, "flag": m.flag}
            for m in r.measurements
            if m.is_abnormal or m.flag in ["high", "low", "critical"]
        ]
        recent_reports.append({
            "id": r.id,
            "title": r.title,
            "date": r.created_at.strftime("%Y-%m-%d") if r.created_at else None,
            "abnormal_findings_count": len(abnormal_items),
            "key_abnormals": abnormal_items[:3],
        })

    # 2. Vitals summary
    vitals_summary = {}
    latest_bp_sys = (
        db.query(HealthMeasurement)
        .filter(HealthMeasurement.user_id == current_user.id, HealthMeasurement.metric_type == "blood_pressure_systolic")
        .order_by(HealthMeasurement.recorded_at.desc())
        .first()
    )
    latest_bp_dia = (
        db.query(HealthMeasurement)
        .filter(HealthMeasurement.user_id == current_user.id, HealthMeasurement.metric_type == "blood_pressure_diastolic")
        .order_by(HealthMeasurement.recorded_at.desc())
        .first()
    )
    latest_hr = (
        db.query(HealthMeasurement)
        .filter(HealthMeasurement.user_id == current_user.id, HealthMeasurement.metric_type == "heart_rate")
        .order_by(HealthMeasurement.recorded_at.desc())
        .first()
    )
    latest_glu = (
        db.query(HealthMeasurement)
        .filter(HealthMeasurement.user_id == current_user.id, HealthMeasurement.metric_type == "blood_glucose")
        .order_by(HealthMeasurement.recorded_at.desc())
        .first()
    )

    if latest_bp_sys and latest_bp_dia:
        vitals_summary["blood_pressure"] = f"{int(latest_bp_sys.value)}/{int(latest_bp_dia.value)} mmHg"
    if latest_hr:
        vitals_summary["resting_heart_rate"] = f"{int(latest_hr.value)} bpm"
    if latest_glu:
        vitals_summary["fasting_blood_glucose"] = f"{latest_glu.value:.1f} mg/dL"

    # 3. Wearable telemetry
    wearable = (
        db.query(WearableMeasurement)
        .filter(WearableMeasurement.user_id == current_user.id)
        .order_by(WearableMeasurement.start_time.desc())
        .first()
    )
    wearable_telemetry = None
    if wearable:
        wearable_telemetry = {
            "device_source": wearable.platform or "Wearable Monitor",
            "metric_type": wearable.metric_type,
            "value": wearable.value,
            "unit": wearable.unit,
            "recorded_at": wearable.start_time.isoformat() if wearable.start_time else None,
        }

    # 4. Family health history (first & second degree)
    family_members = db.query(FamilyMemberModel).filter(FamilyMemberModel.user_id == current_user.id).all()
    family_history_summary = []
    for fm in family_members:
        conds = [c.condition_name for c in fm.conditions]
        if conds:
            family_history_summary.append({
                "relationship": getattr(fm, "relationship_to_proband", "Relative"),
                "first_name": getattr(fm, "name", "Family Member"),
                "conditions": conds,
                "maternal_or_paternal": getattr(fm, "branch", "unknown"),
            })

    # 5. Genetic predispositions
    genetic_variants = (
        db.query(GeneticVariant)
        .join(GeneticTestRecord, GeneticVariant.test_record_id == GeneticTestRecord.id)
        .filter(GeneticTestRecord.user_id == current_user.id)
        .limit(5)
        .all()
    )
    genetic_predispositions = [
        {
            "gene": gv.gene_symbol,
            "variant": gv.variant_hgvs,
            "significance": gv.clinical_significance,
            "zygosity": gv.zygosity,
        }
        for gv in genetic_variants
    ]

    # 6. Active medications
    active_meds = []
    med_records = db.query(PersonalRecord).filter(PersonalRecord.user_id == current_user.id).all()
    for rec in med_records:
        if rec.category and "medication" in rec.category.lower():
            active_meds.append(rec.title)

    AuditService.log_event(
        db,
        action="HEALTH_CONTEXT_ACCESSED",
        user_id=current_user.id,
        resource_type="PersonalHealthContext",
        details={"reports_count": len(recent_reports), "family_records": len(family_history_summary)},
    )

    return AuthorizedHealthContextResponse(
        user_id=current_user.id,
        consent_status=consent_status,
        recent_reports=recent_reports,
        vitals_summary=vitals_summary,
        wearables_telemetry=wearable_telemetry,
        family_history_summary=family_history_summary,
        genetic_predispositions=genetic_predispositions,
        active_medications=active_meds,
        data_minimization_note="Scoped to minimum necessary clinical telemetry under MediPredict Security Architecture v2.0.",
    )

@router.post("/medication-education", response_model=MedicationEducationResponse)
def get_medication_education(
    req: MedicationEducationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Evidence-grounded medication pharmacology reference monograph.
    Includes indications, mechanisms, side effects, precautions, interactions, and doctor questions.
    """
    AIGuardrailService.validate_tool_call("medication_monograph_lookup", user_id=current_user.id, db=db)

    result = MedicationEducationService.get_medication_education(
        medication_name=req.medication_name,
        current_conditions=req.current_conditions,
        other_medications=req.other_medications,
    )

    AuditService.log_event(
        db,
        action="MEDICATION_EDUCATION_LOOKUP",
        user_id=current_user.id,
        resource_type="MedicationEducation",
        details={"medication": req.medication_name, "drug_class": result.get("drug_class")},
    )
    return result

@router.post("/referral-summary", response_model=ConsultationSummaryResponse)
def create_specialist_referral_summary(
    req: ConsultationSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a structured, consent-gated consultation summary for specialist referral.
    Compiles pedigree patterns, genetic variants, key vitals, and prepared physician questions.
    """
    if not req.consent_granted:
        raise ForbiddenException("Affirmative patient consent is required to assemble a specialist consultation summary.")

    AIGuardrailService.validate_tool_call("consultation_summary_generator", user_id=current_user.id, db=db)

    patient_summary = {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "specialty_requested": req.specialty_requested,
        "clinical_priority": req.clinical_priority,
    }

    relevant_findings = []
    if req.include_family_tree:
        f_members = db.query(FamilyMemberModel).filter(FamilyMemberModel.user_id == current_user.id).all()
        for fm in f_members:
            for cond in fm.conditions:
                rel = getattr(fm, "relationship_to_proband", "Relative")
                relevant_findings.append(f"Family History: {rel} diagnosed with {cond.condition_name}")

    if req.include_genetic_tests:
        g_variants = (
            db.query(GeneticVariant)
            .join(GeneticTestRecord, GeneticVariant.test_record_id == GeneticTestRecord.id)
            .filter(GeneticTestRecord.user_id == current_user.id)
            .all()
        )
        for gv in g_variants:
            relevant_findings.append(f"Genetic Variant: {gv.gene_symbol} ({gv.variant_hgvs}) — {gv.clinical_significance}")

    key_biomarkers = []
    if req.include_recent_vitals:
        vitals = (
            db.query(HealthMeasurement)
            .filter(HealthMeasurement.user_id == current_user.id)
            .order_by(HealthMeasurement.recorded_at.desc())
            .limit(5)
            .all()
        )
        for v in vitals:
            key_biomarkers.append({"metric": v.metric_type, "value": v.value, "unit": v.unit})

    prepared_questions = [
        f"What diagnostic tests are recommended to evaluate: '{req.referral_reason}'?",
        "Do current family history observations warrant formal germline or specialized genetic testing?",
        "Are there preventative lifestyle or therapeutic adjustments appropriate based on recent biomarkers?",
    ]

    raw_token = f"{current_user.id}:{req.specialty_requested}:{datetime.datetime.utcnow().isoformat()}"
    audit_token = f"CONSENT-{hashlib.sha256(raw_token.encode()).hexdigest()[:16].upper()}"

    ref_id = f"ref_{uuid.uuid4().hex[:12]}"
    counsellor = db.query(GeneticCounsellor).first()
    counsellor_id_str = str(req.counsellor_id) if (req.counsellor_id and db.query(GeneticCounsellor).filter(GeneticCounsellor.id == str(req.counsellor_id)).first()) else (counsellor.id if counsellor else "cgc-01")

    referral = SpecialistReferral(
        id=ref_id,
        user_id=current_user.id,
        counsellor_id=counsellor_id_str,
        specialty_requested=req.specialty_requested,
        referral_reason=req.referral_reason,
        clinical_priority=req.clinical_priority or "routine",
        status="pending_consultation",
        consent_granted=True,
        consent_timestamp=datetime.datetime.utcnow(),
        include_family_tree=req.include_family_tree,
        include_genetic_tests=req.include_genetic_tests,
        notes_for_specialist=req.notes_for_specialist,
        secure_referral_summary=(
            f"REASON FOR REFERRAL: {req.referral_reason}\n"
            f"FINDINGS: {'; '.join(relevant_findings[:5])}\n"
            f"AUDIT TOKEN: {audit_token}"
        ),
    )
    db.add(referral)
    db.commit()
    db.refresh(referral)

    AuditService.log_event(
        db,
        action="SPECIALIST_REFERRAL_SUMMARY_GENERATED",
        user_id=current_user.id,
        resource_type="SpecialistReferral",
        resource_id=str(referral.id),
        details={"specialty": req.specialty_requested, "audit_token": audit_token},
    )

    statutory_disclaimer = (
        "MediPredict AI provides structured clinical summaries to facilitate specialist consultations. "
        "It does NOT establish a clinical diagnosis or replace direct clinical assessment by a licensed specialist."
    )

    return ConsultationSummaryResponse(
        referral_id=referral.id,
        patient_summary=patient_summary,
        chief_complaint_and_history=req.referral_reason,
        relevant_family_and_genetic_findings=relevant_findings,
        key_biomarkers_and_vitals=key_biomarkers,
        prepared_clinical_discussion_points=prepared_questions,
        consent_audit_token=audit_token,
        statutory_disclaimer=statutory_disclaimer,
    )
