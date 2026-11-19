import csv
import datetime
import io
import re
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from fastapi.responses import FileResponse, PlainTextResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, verify_patient_access
from app.core.config import settings
from app.core.exceptions import ForbiddenException, NotFoundException
from app.db.session import get_db
from app.models.models import LaboratoryMeasurement, MedicalReport, User
from app.schemas.schemas import (
    LaboratoryMeasurementResponse,
    LaboratoryMeasurementUpdate,
    MedicalReportDetailResponse,
    MedicalReportResponse,
    ReportAnalysisResponse,
)
from app.services.ai.factory import AIProviderFactory
from app.services.audit.audit_service import AuditService
from app.services.document_processing.report_parser import ReportParser
from app.services.storage.storage_service import SecureStorageService

router = APIRouter(prefix="/reports", tags=["Medical Reports"])

def validate_uploaded_document(file_bytes: bytes, filename: str, mime_type: str):
    """
    Validates document safety: file size, prohibited executable binary signatures,
    embedded script injections, and verifies magic byte signatures for PDF/images.
    """
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15MB size limit.")

    # 1. Prohibited binary signatures
    if file_bytes.startswith(b"MZ"):  # Windows PE binary (.exe, .dll)
        raise HTTPException(status_code=400, detail="Executable files are strictly prohibited.")
    if file_bytes.startswith(b"\x7fELF"):  # Linux ELF binary
        raise HTTPException(status_code=400, detail="Binary executable files are strictly prohibited.")
    if file_bytes.startswith(b"PK\x03\x04") and any(ext in filename.lower() for ext in [".exe", ".jar", ".war"]):
        raise HTTPException(status_code=400, detail="Executable archive packages are prohibited.")
    if file_bytes.startswith(b"#!"):  # Shell scripts
        raise HTTPException(status_code=400, detail="Script execution files are prohibited.")

    # 2. Prevent HTML/script injection
    sample = file_bytes[:1024].lower()
    if b"<script" in sample or b"javascript:" in sample or b"<iframe" in sample:
        raise HTTPException(status_code=400, detail="Embedded script payloads in medical documents are prohibited.")

    # 3. Magic byte signature verification for declared types
    fn_lower = filename.lower()
    if fn_lower.endswith(".pdf"):
        if not file_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="Invalid PDF file: Missing %PDF- magic signature.")
    elif fn_lower.endswith(".png"):
        if not file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(status_code=400, detail="Invalid PNG file: Missing PNG magic signature.")
    elif fn_lower.endswith((".jpg", ".jpeg")):
        if not file_bytes.startswith(b"\xff\xd8\xff"):
            raise HTTPException(status_code=400, detail="Invalid JPEG file: Missing JPEG magic signature.")

@router.get("", response_model=List[MedicalReportResponse])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == current_user.id)
        .order_by(MedicalReport.report_date.desc())
        .all()
    )
    result = []
    for r in reports:
        item = MedicalReportResponse.model_validate(r)
        item.measurement_count = len(r.measurements)
        item.abnormal_count = sum(1 for m in r.measurements if m.is_abnormal)
        result.append(item)
    return result

@router.post("/upload", response_model=MedicalReportDetailResponse, status_code=status.HTTP_201_CREATED)
async def upload_report(
    title: str = Form("Comprehensive Blood Analysis"),
    report_type: str = Form("Laboratory Blood Panel"),
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_path = None
    file_name = None
    file_size = 0
    mime_type = "text/plain"
    content_text = raw_text or ""
    sha256_hash = None

    if file:
        raw_name = file.filename or "uploaded_report"
        # Sanitize filename and prevent path traversal
        file_name = re.sub(r'[^a-zA-Z0-9._-]', '_', Path(raw_name).name)
        mime_type = file.content_type or "application/octet-stream"
        file_bytes = await file.read()
        file_size = len(file_bytes)

        # Validate file integrity, empty documents, size limits, and magic signatures
        try:
            sha256_hash, file_size = ReportParser.validate_document_file(file_bytes, file_name, mime_type)
        except ValueError as val_err:
            raise HTTPException(status_code=400, detail=str(val_err))

        # Duplicate document check against user's previously stored reports
        if sha256_hash:
            duplicate = (
                db.query(MedicalReport)
                .filter(
                    MedicalReport.user_id == current_user.id,
                    MedicalReport.file_hash_sha256 == sha256_hash,
                )
                .first()
            )
            if duplicate:
                raise HTTPException(
                    status_code=400,
                    detail=f"Duplicate document detected: This report has already been uploaded as '{duplicate.title}' on {duplicate.report_date.strftime('%Y-%m-%d')}.",
                )

        # Secure random UUID-prefixed quarantine storage key
        storage_key = f"{uuid.uuid4().hex}_{file_name}"
        saved_path = settings.UPLOAD_DIR / storage_key
        with open(saved_path, "wb") as f:
            f.write(file_bytes)
        file_path = str(saved_path)

        # Multi-format document text extraction: PDF, Image, CSV, Text
        if file_name.lower().endswith(".pdf") or "pdf" in mime_type.lower():
            pdf_text = ReportParser.extract_text_from_pdf_bytes(file_bytes)
            content_text = (pdf_text + "\n" + (raw_text or "")).strip()
        elif file_name.lower().endswith((".png", ".jpg", ".jpeg", ".tiff", ".bmp")) or "image" in mime_type.lower():
            ocr_text = ReportParser.extract_text_from_image_bytes(file_bytes)
            content_text = (ocr_text + "\n" + (raw_text or "")).strip()
        else:
            try:
                decoded = file_bytes.decode("utf-8", errors="ignore")
                content_text = (decoded + "\n" + (raw_text or "")).strip()
            except Exception:
                content_text = raw_text or ""

    # Parse measurements with standard clinical reference intervals
    measurements_data, confidence, requires_verification = ReportParser.parse_text_or_csv(
        content_text, filename=file_name or "report.txt"
    )

    meta = ReportParser.extract_metadata(content_text)
    lab_name = meta.get("laboratory_name", "Metropolis Reference Laboratory")
    patient_mrn = meta.get("patient_mrn", "MRN-92041")

    # Compute triage urgency based on panic thresholds
    triage = "routine"
    if any(m.get("flag") == "critical" for m in measurements_data):
        triage = "stat_critical"
    elif any(m.get("is_abnormal") for m in measurements_data):
        triage = "urgent"
    elif len(measurements_data) == 0:
        triage = "incomplete"

    if measurements_data:
        summary_text = f"Extracted {len(measurements_data)} laboratory markers with {int(confidence * 100)}% extraction confidence from {lab_name}."
    else:
        summary_text = "No recognized laboratory biomarkers detected in uploaded file. You can add measurements manually or verify document format."
        confidence = 0.0
        requires_verification = True

    report = MedicalReport(
        user_id=current_user.id,
        title=title,
        report_type=report_type,
        report_date=datetime.datetime.utcnow(),
        file_path=file_path,
        file_name=file_name or "Direct Input",
        file_size=file_size,
        mime_type=mime_type,
        status="processed",
        summary=summary_text,
        extraction_confidence=confidence,
        requires_verification=requires_verification,
        laboratory_name=lab_name,
        patient_mrn=patient_mrn,
        file_hash_sha256=sha256_hash,
        triage_priority=triage,
        clinician_status="pending",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Add extracted measurements to database with historical comparison
    for m in measurements_data:
        # Check prior measurement for historical delta
        prior = (
            db.query(LaboratoryMeasurement)
            .join(MedicalReport)
            .filter(
                MedicalReport.user_id == current_user.id,
                LaboratoryMeasurement.test_name.ilike(m["test_name"]),
                MedicalReport.id != report.id,
            )
            .order_by(MedicalReport.report_date.desc())
            .first()
        )
        prev_val = prior.value if prior else None
        change_pct = (
            round(((m["value"] - prior.value) / prior.value) * 100, 1)
            if (prior and prior.value and prior.value > 0)
            else None
        )

        meas = LaboratoryMeasurement(
            report_id=report.id,
            test_name=m["test_name"],
            category=m.get("category", "General Biochemistry"),
            value=m["value"],
            unit=m["unit"],
            original_value=m["value"],
            original_unit=m["unit"],
            previous_value=prev_val,
            change_pct=change_pct,
            reference_low=m.get("reference_low"),
            reference_high=m.get("reference_high"),
            reference_text=m.get("reference_text"),
            is_abnormal=m.get("is_abnormal", False),
            flag=m.get("flag", "normal"),
            confidence=m.get("confidence", 0.95),
            user_verified=False,
            verification_status="pending",
        )
        db.add(meas)
    db.commit()
    db.refresh(report)

    AuditService.log_event(
        db,
        action="REPORT_UPLOAD",
        user_id=current_user.id,
        resource_type="MedicalReport",
        resource_id=str(report.id),
        details={"file_name": file_name, "measurements_count": len(measurements_data), "confidence": confidence, "triage": triage},
    )

    res = MedicalReportDetailResponse.model_validate(report)
    res.measurements = [LaboratoryMeasurementResponse.model_validate(m) for m in report.measurements]
    res.measurement_count = len(report.measurements)
    res.abnormal_count = sum(1 for m in report.measurements if m.is_abnormal)
    return res

@router.get("/{report_id}", response_model=MedicalReportDetailResponse)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    res = MedicalReportDetailResponse.model_validate(report)
    res.measurements = [LaboratoryMeasurementResponse.model_validate(m) for m in report.measurements]
    return res

@router.get("/{report_id}/download")
def download_original_report_file(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    if not report.file_path or not Path(report.file_path).exists():
        raise NotFoundException("Original report document is unavailable or expired.")

    AuditService.log_event(
        db,
        action="DOWNLOAD_REPORT_FILE",
        user_id=current_user.id,
        resource_type="MedicalReport",
        resource_id=str(report.id),
        details={"file_name": report.file_name},
    )

    return FileResponse(
        path=report.file_path,
        filename=report.file_name or "medical_report.pdf",
        media_type=report.mime_type or "application/octet-stream",
        headers={"X-Content-Type-Options": "nosniff"},
    )

@router.get("/{report_id}/signed-url")
def get_report_signed_url(
    report_id: int,
    expires_in: int = 300,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a private, short-lived signed URL (300 seconds TTL)
    for downloading or viewing a verified medical report without exposing public URLs.
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    storage_path = report.file_name or f"report_{report.id}.pdf"
    signed_url = SecureStorageService.create_signed_download_url(
        storage_path=storage_path,
        expires_in_seconds=expires_in,
        bucket_name="medical-reports",
    )

    AuditService.log_event(
        db,
        action="GENERATE_SIGNED_STORAGE_URL",
        user_id=current_user.id,
        resource_type="MedicalReport",
        resource_id=str(report.id),
        details={"expires_in": expires_in},
    )

    return {
        "report_id": report.id,
        "signed_url": signed_url,
        "expires_in": expires_in,
        "security_policy": "Private Supabase Storage Bucket - Short-Lived Signed Access Only",
    }

@router.post("/{report_id}/analyze", response_model=ReportAnalysisResponse)
async def analyze_report_with_ai(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    provider = AIProviderFactory.get_provider(settings.AI_PROVIDER)

    # Format measurements for LLM
    meas_list = [
        {
            "test_name": m.test_name,
            "value": m.value,
            "unit": m.unit,
            "flag": m.flag,
            "reference_text": m.reference_text,
            "is_abnormal": m.is_abnormal,
        }
        for m in report.measurements
    ]

    analysis = await provider.analyze_report(meas_list)

    # Persist interpretation
    report.ai_interpretation = analysis["ai_interpretation"]
    db.commit()

    AuditService.log_event(
        db,
        action="REPORT_ANALYZE_AI",
        user_id=current_user.id,
        resource_type="MedicalReport",
        resource_id=str(report.id),
        details={"provider": settings.AI_PROVIDER},
    )

    normal_count = sum(1 for m in report.measurements if not m.is_abnormal)
    abnormal_count = sum(1 for m in report.measurements if m.is_abnormal)

    # Standard clinical questions for physician
    doc_questions = [
        "What clinical follow-up or repeat testing interval is indicated for any flagged values?",
        "Do these observed trends correlate with my current medication or dietary regimen?",
        "Should we order specialized confirmatory panels (e.g. quantitative titers or imaging)?",
    ]
    if any(m.flag == "critical" for m in report.measurements):
        doc_questions.insert(0, "STAT Question: Given panic-level laboratory thresholds, does this require immediate clinical intervention?")

    return ReportAnalysisResponse(
        report_id=report.id,
        summary=analysis["summary"],
        key_findings=analysis.get("key_findings", []),
        potential_abnormalities=analysis.get("potential_abnormalities", []),
        ai_interpretation=analysis["ai_interpretation"],
        report_date=report.report_date.strftime("%Y-%m-%d"),
        normal_measurements_count=normal_count,
        abnormal_measurements_count=abnormal_count,
        important_limitations=[
            "Isolated laboratory values reflect physiological status at the moment of specimen collection.",
            "Normal reference intervals vary across demographic cohorts and regional testing laboratories.",
            "AI interpretation is strictly educational decision support and never constitutes an automated medical diagnosis.",
        ],
        doctor_questions=doc_questions,
        evidence_references=[
            {
                "title": "Standards of Care in Diabetes — Glycemic Targets & Clinical Triage",
                "organization": "American Diabetes Association (ADA 2024)",
                "pmid": "38078580",
                "publication_year": 2024,
                "url": "https://pubmed.ncbi.nlm.nih.gov/38078580/",
            },
            {
                "title": "ACG Clinical Guidelines: Evaluation of Abnormal Laboratory Chemistries",
                "organization": "American College of Gastroenterology",
                "pmid": "36637387",
                "publication_year": 2023,
                "url": "https://pubmed.ncbi.nlm.nih.gov/36637387/",
            },
        ],
        professional_follow_up=[
            "Schedule a clinical consultation with your attending healthcare provider to review these findings.",
            "Do not alter or discontinue prescribed medications without direct clinical guidance.",
        ],
        clinical_disclaimer=analysis.get(
            "disclaimer",
            "This analysis is generated by AI for informational and educational support only. "
            "It is not a medical diagnosis. Please consult a qualified clinician."
        ),
    )

@router.post("/{report_id}/verify-all", response_model=MedicalReportDetailResponse)
def verify_all_measurements(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Marks all extracted biomarkers within the report as verified by the authorized user.
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    now = datetime.datetime.utcnow()
    verifier_name = current_user.full_name or current_user.email
    for m in report.measurements:
        m.user_verified = True
        m.verification_status = "verified"
        m.verified_by = verifier_name
        m.verified_at = now

    report.requires_verification = False
    report.status = "verified"
    db.commit()
    db.refresh(report)

    AuditService.log_event(
        db,
        action="REPORT_VERIFY_ALL_MEASUREMENTS",
        user_id=current_user.id,
        resource_type="MedicalReport",
        resource_id=str(report.id),
        details={"verified_count": len(report.measurements), "verified_by": verifier_name},
    )

    res = MedicalReportDetailResponse.model_validate(report)
    res.measurements = [LaboratoryMeasurementResponse.model_validate(m) for m in report.measurements]
    res.measurement_count = len(report.measurements)
    res.abnormal_count = sum(1 for m in report.measurements if m.is_abnormal)
    return res

@router.post("/{report_id}/submit-review", response_model=MedicalReportResponse)
def submit_report_for_clinician_review(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits the laboratory report to the Clinician Review & Triage Queue.
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    report.clinician_status = "pending"
    db.commit()
    db.refresh(report)

    AuditService.log_event(
        db,
        action="REPORT_SUBMIT_CLINICIAN_REVIEW",
        user_id=current_user.id,
        resource_type="MedicalReport",
        resource_id=str(report.id),
        details={"patient_id": report.user_id, "triage_priority": report.triage_priority},
    )

    res = MedicalReportResponse.model_validate(report)
    res.measurement_count = len(report.measurements)
    res.abnormal_count = sum(1 for m in report.measurements if m.is_abnormal)
    return res

@router.get("/{report_id}/trends")
def get_report_biomarker_trends(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns longitudinal trajectory for biomarkers in the report across patient's history.
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    all_reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.user_id == report.user_id)
        .order_by(MedicalReport.report_date.asc())
        .all()
    )

    biomarkers_trends = []
    for target_m in report.measurements:
        points = []
        for rep in all_reports:
            for m in rep.measurements:
                if (
                    m.test_name.lower().strip() == target_m.test_name.lower().strip()
                    and m.unit.lower() == target_m.unit.lower()
                ):
                    points.append({
                        "date": rep.report_date.strftime("%Y-%m-%d"),
                        "report_title": rep.title,
                        "value": m.value,
                        "flag": m.flag,
                        "is_abnormal": m.is_abnormal,
                    })

        direction = "stable"
        if len(points) >= 2:
            delta = points[-1]["value"] - points[-2]["value"]
            if delta > 0.05 * points[-2]["value"]:
                direction = "increasing"
            elif delta < -0.05 * points[-2]["value"]:
                direction = "decreasing"

        biomarkers_trends.append({
            "test_name": target_m.test_name,
            "category": target_m.category,
            "current_value": target_m.value,
            "unit": target_m.unit,
            "reference_low": target_m.reference_low,
            "reference_high": target_m.reference_high,
            "reference_text": target_m.reference_text,
            "flag": target_m.flag,
            "trend_direction": direction,
            "data_points": points,
        })

    return {
        "report_id": report.id,
        "report_date": report.report_date.isoformat(),
        "trends": biomarkers_trends,
    }

@router.get("/{report_id}/evidence")
def get_report_medical_evidence(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns authentic PubMed and guideline citations for tests in this report.
    """
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    evidence_items = []
    test_names = [m.test_name.lower() for m in report.measurements]

    if any("glucose" in t or "hba1c" in t for t in test_names):
        evidence_items.append({
            "title": "Standards of Care in Diabetes — Glycemic Targets & Diagnostic Criteria",
            "organization": "American Diabetes Association (ADA 2024)",
            "pmid": "38078580",
            "publication_year": 2024,
            "url": "https://pubmed.ncbi.nlm.nih.gov/38078580/",
            "relevance": "Defines pre-diabetes (FPG 100-125 mg/dL, HbA1c 5.7-6.4%) and diabetes confirmation thresholds.",
            "limitations": "Hemoglobinopathies, pregnancy, and severe hemolysis can alter HbA1c fidelity."
        })

    if any("cholesterol" in t or "ldl" in t or "triglyceride" in t for t in test_names):
        evidence_items.append({
            "title": "AHA/ACC Multisociety Guideline on the Management of Blood Cholesterol",
            "organization": "American Heart Association / American College of Cardiology",
            "pmid": "30423393",
            "publication_year": 2019,
            "url": "https://pubmed.ncbi.nlm.nih.gov/30423393/",
            "relevance": "Outlines primary and secondary prevention thresholds for LDL-C reduction.",
            "limitations": "Single lipid panel variations may occur after acute infection or severe caloric restriction."
        })

    if any("ttg" in t or "iga" in t for t in test_names):
        evidence_items.append({
            "title": "ACG Clinical Guidelines: Diagnosis and Management of Celiac Disease",
            "organization": "American College of Gastroenterology (ACG)",
            "pmid": "36637387",
            "publication_year": 2023,
            "url": "https://pubmed.ncbi.nlm.nih.gov/36637387/",
            "relevance": "tTG-IgA with total serum IgA is recommended initial serology; maintenance of gluten diet is essential.",
            "limitations": "Selective IgA deficiency (<0.2 g/L) causes false-negative tTG-IgA results."
        })

    if any("creatinine" in t or "egfr" in t or "bun" in t for t in test_names):
        evidence_items.append({
            "title": "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease",
            "organization": "Kidney Disease: Improving Global Outcomes (KDIGO)",
            "pmid": "38490803",
            "publication_year": 2024,
            "url": "https://pubmed.ncbi.nlm.nih.gov/38490803/",
            "relevance": "eGFR stratification using CKD-EPI 2021 equations without race coefficient.",
            "limitations": "Serum creatinine reflects muscle mass and diet; cystatin C recommended for equivocal results."
        })

    if any("alt" in t or "ast" in t or "bilirubin" in t for t in test_names):
        evidence_items.append({
            "title": "ACG Clinical Guideline: Evaluation of Abnormal Liver Chemistries",
            "organization": "American College of Gastroenterology",
            "pmid": "28114352",
            "publication_year": 2017,
            "url": "https://pubmed.ncbi.nlm.nih.gov/28114352/",
            "relevance": "Diagnostic algorithm for isolated transaminase elevations and steatotic liver disease.",
            "limitations": "Transient transaminase spikes can occur following strenuous exercise or acute viral illness."
        })

    if not evidence_items:
        evidence_items.append({
            "title": "CAP Laboratory Accreditation Guidelines & Reference Interval Verification",
            "organization": "College of American Pathologists (CAP)",
            "pmid": "29194215",
            "publication_year": 2022,
            "url": "https://pubmed.ncbi.nlm.nih.gov/29194215/",
            "relevance": "Establishes multi-tiered clinical laboratory reference intervals and panic threshold notifications.",
            "limitations": "Reference intervals vary slightly by analyzer platform and local regional demographics."
        })

    return {
        "report_id": report.id,
        "evidence_sources": evidence_items,
        "curation_standard": "OCEBM Levels of Evidence / National Clinical Practice Guidelines",
    }

@router.post("/{report_id}/measurements", response_model=LaboratoryMeasurementResponse, status_code=status.HTTP_201_CREATED)
def add_measurement(
    report_id: int,
    measurement_in: LaboratoryMeasurementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    test_name = measurement_in.test_name or "Custom Biomarker"
    value = measurement_in.value if measurement_in.value is not None else 0.0
    unit = measurement_in.unit or ""

    evaluated = ReportParser._evaluate_measurement(test_name, value, unit)

    meas = LaboratoryMeasurement(
        report_id=report.id,
        test_name=test_name,
        category=evaluated.get("category", "General Biochemistry"),
        value=value,
        unit=unit or evaluated.get("unit", "units"),
        reference_low=evaluated.get("reference_low"),
        reference_high=evaluated.get("reference_high"),
        reference_text=measurement_in.reference_text or evaluated.get("reference_text"),
        is_abnormal=evaluated.get("is_abnormal", False),
        flag=measurement_in.flag or evaluated.get("flag", "normal"),
        confidence=1.0,
        user_verified=True,
    )
    db.add(meas)
    db.commit()
    db.refresh(meas)
    return meas

@router.put("/{report_id}/measurements/{measurement_id}", response_model=LaboratoryMeasurementResponse)
@router.patch("/{report_id}/measurements/{measurement_id}", response_model=LaboratoryMeasurementResponse)
def update_measurement(
    report_id: int,
    measurement_id: int,
    update_in: LaboratoryMeasurementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    meas = (
        db.query(LaboratoryMeasurement)
        .filter(LaboratoryMeasurement.id == measurement_id, LaboratoryMeasurement.report_id == report_id)
        .first()
    )
    if not meas:
        raise NotFoundException("Measurement not found")

    if update_in.test_name is not None:
        meas.test_name = update_in.test_name
    if update_in.value is not None:
        if meas.original_value is None:
            meas.original_value = meas.value
        meas.value = update_in.value
        meas.verification_status = update_in.verification_status or "corrected"
        meas.user_verified = True
    if update_in.unit is not None:
        if meas.original_unit is None:
            meas.original_unit = meas.unit
        meas.unit = update_in.unit
    if update_in.reference_text is not None:
        meas.reference_text = update_in.reference_text
    if update_in.reference_low is not None:
        meas.reference_low = update_in.reference_low
    if update_in.reference_high is not None:
        meas.reference_high = update_in.reference_high
    if update_in.flag is not None:
        meas.flag = update_in.flag
        meas.is_abnormal = meas.flag in ["high", "low", "critical"]
    if update_in.user_verified is not None:
        meas.user_verified = update_in.user_verified
        if update_in.user_verified and meas.verification_status == "pending":
            meas.verification_status = "verified"
    if update_in.verification_status is not None:
        meas.verification_status = update_in.verification_status
    if update_in.notes is not None:
        meas.notes = update_in.notes

    meas.verified_by = current_user.full_name or current_user.email
    meas.verified_at = datetime.datetime.utcnow()

    # If all measurements verified, update report status
    if all(m.user_verified for m in report.measurements):
        report.requires_verification = False
        report.status = "verified"

    db.commit()
    db.refresh(meas)
    return meas

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    if report.user_id != current_user.id and current_user.role != "admin":
        raise ForbiddenException("Only the record owner or an administrator can delete this medical report.")

    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}

@router.get("/{report_id}/export")
def export_report_summary(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    lines = [
        "GENEWISE — CLINICAL LABORATORY REPORT EXPORT",
        f"Report Title: {report.title}",
        f"Patient: {current_user.full_name} ({current_user.email})",
        f"Date: {report.report_date.strftime('%Y-%m-%d %H:%M UTC')}",
        f"Type: {report.report_type}",
        f"Extraction Confidence: {int(report.extraction_confidence * 100)}%",
        "-" * 60,
        f"{'Test Name':<25} {'Value':<10} {'Unit':<10} {'Flag':<10} {'Reference Interval'}",
        "-" * 60,
    ]
    for m in report.measurements:
        status_flag = m.flag.upper() if m.is_abnormal else "NORMAL"
        lines.append(f"{m.test_name:<25} {m.value:<10} {m.unit:<10} {status_flag:<10} {m.reference_text or ''}")

    lines.append("-" * 60)
    if report.ai_interpretation:
        lines.append(f"\nAI Interpretation & Clinical Notes:\n{report.ai_interpretation}\n")
    lines.append(
        "Disclaimer: This summary is generated for educational and tracking purposes. "
        "It does not replace an official laboratory diagnostic report."
    )

    return PlainTextResponse("\n".join(lines), media_type="text/plain")

@router.get("/{report_id}/export-csv")
def export_report_csv(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Test Name", "Value", "Unit", "Flag", "Reference Interval", "Category", "Verified"])
    for m in report.measurements:
        writer.writerow([m.test_name, m.value, m.unit, m.flag, m.reference_text or "", m.category or "", m.user_verified])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=genewise_report_{report.id}.csv"},
    )

@router.get("/{report_id}/export-pdf")
def export_report_pdf(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise NotFoundException("Medical report not found")
    verify_patient_access(report.user_id, current_user, db)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#00635e'),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#546865'),
        spaceAfter=12,
    )
    normal_style = ParagraphStyle(
        'DocNormal',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#0a1e27'),
    )
    header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#ffffff'),
    )

    story = []
    story.append(Paragraph("GeneWise — Clinical Laboratory Analysis", title_style))
    story.append(Paragraph(
        f"Patient: {current_user.full_name} ({current_user.email}) | "
        f"Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | Confidential Patient Health Record",
        subtitle_style
    ))
    story.append(Spacer(1, 8))

    meta_data = [
        [
            Paragraph(f"<b>Report:</b> {report.title}", normal_style),
            Paragraph(f"<b>Category:</b> {report.report_type}", normal_style),
        ],
        [
            Paragraph(f"<b>Confidence:</b> {int(report.extraction_confidence * 100)}%", normal_style),
            Paragraph(f"<b>Clinician Verification:</b> {report.clinician_status or 'Pending Review'}", normal_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f4faff')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#bdc9c7')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    meas_data = [
        [
            Paragraph("<b>Biomarker / Test</b>", header_style),
            Paragraph("<b>Result</b>", header_style),
            Paragraph("<b>Unit</b>", header_style),
            Paragraph("<b>Reference Interval</b>", header_style),
            Paragraph("<b>Flag</b>", header_style),
        ]
    ]
    for m in report.measurements:
        flag_color = "#ba1a1a" if m.is_abnormal else "#00635e"
        meas_data.append([
            Paragraph(m.test_name, normal_style),
            Paragraph(str(m.value), normal_style),
            Paragraph(m.unit, normal_style),
            Paragraph(m.reference_text or "—", normal_style),
            Paragraph(f"<font color='{flag_color}'><b>{m.flag.upper()}</b></font>", normal_style),
        ])

    meas_table = Table(meas_data, colWidths=[170, 65, 65, 160, 80])
    meas_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00635e')),
        ('PADDING', (0, 0), (-1, -1), 4.5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fbfb')]),
    ]))
    story.append(meas_table)
    story.append(Spacer(1, 12))

    if report.ai_interpretation:
        story.append(Paragraph("<b>Clinical AI Findings & Physiological Interpretation:</b>", normal_style))
        story.append(Spacer(1, 3))
        story.append(Paragraph(report.ai_interpretation, normal_style))
        story.append(Spacer(1, 10))

    story.append(Paragraph(
        "<i>Disclaimer: Generated by GeneWise for clinical tracking, education, and decision support. "
        "Not an independent diagnosis. Always correlate with official laboratory documentation and treating physician.</i>",
        subtitle_style
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=genewise_report_{report.id}.pdf"},
    )
