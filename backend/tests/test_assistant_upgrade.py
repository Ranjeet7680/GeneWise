"""
MediPredict AI — Advanced AI Medical Assistant Upgrade Test Suite
Validates Symptom Checker Triage, Medication Education, Authorized Health Context,
Specialist Referral Summaries, Multilingual Voice, and Privacy Architecture v2.0 Controls.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.models import (
    FamilyGroup,
    FamilyHealthConditionModel,
    FamilyMemberModel,
    GeneticVariant,
    HealthMeasurement,
    LaboratoryMeasurement,
    MedicalReport,
    User,
    WearableMeasurement,
)
from app.services.ai.medication_service import MedicationEducationService
from app.services.ai.symptom_checker import SymptomCheckerService
from app.services.voice_service import voice_service


def test_symptom_checker_emergency_red_flags():
    """Validates that acute life-threatening symptoms trigger EMERGENCY_SOS triage."""
    # 1. Acute coronary syndrome
    res_cardio = SymptomCheckerService.evaluate_symptoms(
        primary_symptom="Severe crushing chest pain radiating to left arm with cold sweats",
        duration="30 minutes",
        severity=9,
    )
    assert res_cardio["triage_level"] == "EMERGENCY_SOS"
    assert len(res_cardio["red_flags_detected"]) > 0
    assert "112" in res_cardio["emergency_contacts"].values() or "112" in str(res_cardio["emergency_contacts"])
    assert "does not diagnose" in res_cardio["statutory_disclaimer"].lower()

    # 2. Acute stroke FAST protocol
    res_stroke = SymptomCheckerService.evaluate_symptoms(
        primary_symptom="Sudden face drooping and left arm weakness with slurred speech",
        duration="15 minutes",
        severity=10,
    )
    assert res_stroke["triage_level"] == "EMERGENCY_SOS"
    assert any("Stroke" in rf or "FAST" in rf for rf in res_stroke["red_flags_detected"])


def test_symptom_checker_urgency_stratification_and_guidelines():
    """Validates non-emergency triage stratification, guideline citations, and physician questions."""
    # High severity non-red-flag -> URGENT_EVALUATION
    res_urgent = SymptomCheckerService.evaluate_symptoms(
        primary_symptom="Severe throbbing unilateral headache with photophobia",
        duration="2 days",
        severity=8,
        associated_symptoms=["Nausea", "Sensitivity to light"],
    )
    assert res_urgent["triage_level"] == "URGENT_EVALUATION"
    assert len(res_urgent["suggested_doctor_questions"]) >= 2
    assert len(res_urgent["evidence_sources"]) >= 1
    assert "pmid" in res_urgent["evidence_sources"][0]

    # Mild severity -> SELF_CARE_MONITORING
    res_mild = SymptomCheckerService.evaluate_symptoms(
        primary_symptom="Mild dry throat and occasional sneeze",
        duration="1 day",
        severity=2,
    )
    assert res_mild["triage_level"] == "SELF_CARE_MONITORING"
    assert len(res_mild["self_care_precautions"]) >= 1


def test_medication_education_monographs():
    """Validates evidence-based pharmacology reference monographs and interaction checks."""
    # 1. Metformin lookup
    met_info = MedicationEducationService.get_medication_education("Metformin")
    assert "Metformin Hydrochloride" in met_info["generic_name"]
    assert "Biguanide" in met_info["drug_class"]
    assert any("Lactic Acidosis" in warn for warn in met_info["serious_side_effects_warning"])
    assert any("eGFR" in prec for prec in met_info["precautions_and_warnings"])
    assert "does not prescribe" in met_info["non_prescribing_disclaimer"].lower()

    # 2. Atorvastatin interaction detection
    atorva_info = MedicationEducationService.get_medication_education(
        "Lipitor",
        current_conditions=["Hyperlipidemia"],
        other_medications=["Clarithromycin 500mg"],
    )
    assert "Atorvastatin" in atorva_info["generic_name"]
    assert any("Rhabdomyolysis" in warn for warn in atorva_info["serious_side_effects_warning"])
    assert any("clarithromycin" in inter["drug"].lower() for inter in atorva_info["potential_interactions"])

    # 3. Pregnancy contraindication alert
    lisinopril_info = MedicationEducationService.get_medication_education(
        "Lisinopril",
        current_conditions=["Hypertension", "Pregnancy first trimester"],
    )
    assert any("Pregnancy" in prec for prec in lisinopril_info["precautions_and_warnings"])


def test_multilingual_voice_service_detection():
    """Validates real-time speech and script detection for the 7 core languages + Hinglish."""
    # Hindi
    lang_hi, conf_hi = voice_service.detect_language("मुझे सीने में हल्का दर्द महसूस हो रहा है")
    assert lang_hi == "hi-IN"
    assert conf_hi >= 0.7

    # Bengali
    lang_bn, conf_bn = voice_service.detect_language("আমার মাথা খুব ঘুরছে এবং বমি ভাব হচ্ছে")
    assert lang_bn == "bn-IN"
    assert conf_bn >= 0.7

    # Tamil
    lang_ta, conf_ta = voice_service.detect_language("எனக்கு நெஞ்சு வலி மற்றும் மூச்சுத்திணறல் உள்ளது")
    assert lang_ta == "ta-IN"
    assert conf_ta >= 0.7

    # Telugu
    lang_te, conf_te = voice_service.detect_language("నాకు ఛాతీలో నొప్పి మరియు ఆయాసంగా ఉంది")
    assert lang_te == "te-IN"
    assert conf_te >= 0.7

    # Gujarati
    lang_gu, conf_gu = voice_service.detect_language("મને છાતીમાં દુખાવો થાય છે")
    assert lang_gu == "gu-IN"
    assert conf_gu >= 0.7

    # Code-mixed Hinglish
    lang_hinglish, _ = voice_service.detect_language("Mujhe subah se chest pain ho raha hai aur breathing problem hai")
    assert lang_hinglish == "hi-IN"

    # English
    lang_en, conf_en = voice_service.detect_language("What are the side effects of Metformin 500mg?")
    assert lang_en == "en-IN"


def test_api_symptom_check_endpoint(client: TestClient, auth_headers: dict):
    """Tests POST /api/v1/assistant/symptom-check API route."""
    payload = {
        "primary_symptom": "Acute crushing retrosternal chest pain with diaphoresis",
        "duration": "1 hour",
        "severity": 9,
        "associated_symptoms": ["Shortness of breath", "Sweating"],
        "relevant_medical_history": ["Hypertension"],
        "current_medications": ["Amlodipine 5mg"],
    }
    response = client.post("/api/v1/assistant/symptom-check", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["triage_level"] == "EMERGENCY_SOS"
    assert len(data["red_flags_detected"]) > 0
    assert "statutory_disclaimer" in data


def test_api_health_context_endpoint(client: TestClient, auth_headers: dict, db_session: Session):
    """Tests GET /api/v1/assistant/health-context API route with data minimization."""
    patient_user = db_session.query(User).filter(User.email == "demo@medipredict.ai").first()

    # Seed a recent medical report
    report = MedicalReport(
        user_id=patient_user.id,
        title="Comprehensive Metabolic Panel",
        report_type="Biochemical",
    )
    db_session.add(report)
    db_session.commit()

    meas = LaboratoryMeasurement(
        report_id=report.id,
        test_name="ALT (Alanine Aminotransferase)",
        value=64.0,
        unit="U/L",
        is_abnormal=True,
        flag="high",
    )
    db_session.add(meas)

    # Seed vital
    vital = HealthMeasurement(
        user_id=patient_user.id,
        metric_type="blood_pressure_systolic",
        value=124.0,
        unit="mmHg",
    )
    db_session.add(vital)
    db_session.commit()

    response = client.get("/api/v1/assistant/health-context", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == patient_user.id
    assert "consent_status" in data
    assert len(data["recent_reports"]) >= 1
    assert "data_minimization_note" in data


def test_api_medication_education_endpoint(client: TestClient, auth_headers: dict):
    """Tests POST /api/v1/assistant/medication-education API route."""
    payload = {
        "medication_name": "Atorvastatin",
        "dosage": "20mg",
        "current_conditions": ["Elevated LDL-C"],
        "other_medications": ["Metformin 500mg"],
    }
    response = client.post("/api/v1/assistant/medication-education", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "Atorvastatin" in data["generic_name"]
    assert "HMG-CoA" in data["drug_class"]
    assert len(data["primary_uses"]) >= 1
    assert "non_prescribing_disclaimer" in data


def test_api_specialist_referral_summary_endpoint(
    client: TestClient,
    auth_headers: dict,
    db_session: Session
):
    """Tests POST /api/v1/assistant/referral-summary with consent verification."""
    patient_user = db_session.query(User).filter(User.email == "demo@medipredict.ai").first()

    # Seed family condition
    grp = FamilyGroup(user_id=patient_user.id, family_name="Test Pedigree")
    db_session.add(grp)
    db_session.commit()

    fam = FamilyMemberModel(
        id="test_mgf_1",
        group_id=grp.id,
        user_id=patient_user.id,
        name="Arthur",
        relationship_to_proband="Maternal Grandfather",
        branch="maternal",
    )
    db_session.add(fam)
    db_session.commit()
    cond = FamilyHealthConditionModel(member_id="test_mgf_1", condition_name="Coronary Artery Disease")
    db_session.add(cond)
    db_session.commit()

    # 1. Fails without consent
    res_no_consent = client.post(
        "/api/v1/assistant/referral-summary",
        json={
            "specialty_requested": "Cardiogenetics",
            "referral_reason": "Premature CAD family history evaluation",
            "consent_granted": False,
        },
        headers=auth_headers,
    )
    assert res_no_consent.status_code == 403

    # 2. Succeeds with affirmative consent
    res_consent = client.post(
        "/api/v1/assistant/referral-summary",
        json={
            "specialty_requested": "Cardiogenetics",
            "referral_reason": "Premature CAD family history evaluation",
            "include_family_tree": True,
            "consent_granted": True,
        },
        headers=auth_headers,
    )
    assert res_consent.status_code == 200
    data = res_consent.json()
    assert "CONSENT-" in data["consent_audit_token"]
    assert len(data["prepared_clinical_discussion_points"]) >= 1
    assert any("Coronary Artery Disease" in f for f in data["relevant_family_and_genetic_findings"])
