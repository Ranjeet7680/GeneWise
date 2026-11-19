import io
import pytest
from app.models.models import User
from app.core.security import get_password_hash

@pytest.fixture
def patient_headers(client, db_session):
    user = db_session.query(User).filter(User.email == "patient_lab_test@medipredict.ai").first()
    if not user:
        user = User(
            email="patient_lab_test@medipredict.ai",
            hashed_password=get_password_hash("MedicalAI2026!"),
            full_name="Rajesh Kumar",
            role="patient",
            is_active=True,
            is_verified=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "patient_lab_test@medipredict.ai", "password": "MedicalAI2026!"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def clinician_headers(client, db_session):
    clinician = db_session.query(User).filter(User.email == "dr_rostova_test@medipredict.ai").first()
    if not clinician:
        clinician = User(
            email="dr_rostova_test@medipredict.ai",
            hashed_password=get_password_hash("MedicalAI2026!"),
            full_name="Dr. Elena Rostova",
            role="clinician",
            is_active=True,
            is_verified=True,
        )
        db_session.add(clinician)
        db_session.commit()
        db_session.refresh(clinician)

    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "dr_rostova_test@medipredict.ai", "password": "MedicalAI2026!"},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_file_upload_validation_rejects_empty_file(client, patient_headers):
    """Ensure upload rejects empty 0-byte files with 400."""
    response = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "Empty File Test", "report_type": "Biochemical"},
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_file_upload_and_biomarker_extraction(client, patient_headers):
    """Upload laboratory report text and extract biomarkers."""
    sample_text = (
        "Quest Diagnostics\n"
        "Patient MRN: MRN-92041\n"
        "Tissue Transglutaminase IgA (anti-tTG IgA): 68.4 U/mL (Ref: < 10.0 U/mL)\n"
        "Total Serum IgA: 2.8 g/L (Ref: 0.8 - 3.0 g/L)\n"
        "Deamidated Gliadin Peptide IgG: 45.2 U/mL (Ref: < 15.0 U/mL)\n"
        "Deamidated Gliadin Peptide IgA: 39.8 U/mL (Ref: < 15.0 U/mL)\n"
    )
    response = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={
            "title": "Celiac Disease Serology & Autoantibody Panel",
            "report_type": "Celiac Serology & Immunoglobulins",
            "raw_text": sample_text
        }
    )
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["title"] == "Celiac Disease Serology & Autoantibody Panel"
    assert "Quest Diagnostics" in data["laboratory_name"]
    assert data["patient_mrn"] == "MRN-92041"
    assert data["measurement_count"] == 4
    assert len(data["measurements"]) == 4

    # Verify anti-tTG IgA is flagged as critical
    ttg = next((m for m in data["measurements"] if "tTG" in m["test_name"] or "Transglutaminase" in m["test_name"]), None)
    assert ttg is not None
    assert ttg["value"] == 68.4
    assert ttg["flag"] in ["critical", "high"]
    assert ttg["verification_status"] == "pending"

def test_reject_duplicate_file_upload(client, patient_headers):
    """Rejects duplicate upload having exact same SHA-256 hash."""
    file_bytes = b"%PDF-1.4 Mock unique test report content 20261118\n%%EOF"
    r1 = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "Unique PDF Upload", "report_type": "Hematology"},
        files={"file": ("lab_report.pdf", file_bytes, "application/pdf")}
    )
    assert r1.status_code in [200, 201]

    r2 = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "Duplicate PDF Upload", "report_type": "Hematology"},
        files={"file": ("lab_report.pdf", file_bytes, "application/pdf")}
    )
    assert r2.status_code == 400
    assert "duplicate" in r2.json()["detail"].lower()

def test_measurement_verification_and_correction_workflow(client, patient_headers):
    """Verify editing measurement preserves original_value and updates status."""
    sample_text = "Fasting Blood Glucose: 118 mg/dL\nALT: 64 U/L\n"
    res = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "CMP Metabolic Panel", "report_type": "Biochemical", "raw_text": sample_text}
    )
    assert res.status_code in [200, 201]
    report_id = res.json()["id"]
    meas_id = res.json()["measurements"][0]["id"]

    # Edit the measurement value
    patch_res = client.patch(
        f"/api/v1/reports/{report_id}/measurements/{meas_id}",
        headers=patient_headers,
        json={"value": 115.0, "notes": "Corrected calibration offset"}
    )
    assert patch_res.status_code == 200
    patched = patch_res.json()
    assert patched["value"] == 115.0
    assert patched["original_value"] == 118.0
    assert patched["verification_status"] == "corrected"
    assert patched["verified_by"] is not None

def test_verify_all_measurements(client, patient_headers):
    """Verify all measurements in report."""
    sample_text = "Fasting Blood Glucose: 102 mg/dL\nHbA1c: 5.7 %\n"
    res = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "Glycemic Check", "report_type": "Biochemical", "raw_text": sample_text}
    )
    report_id = res.json()["id"]

    verify_all_res = client.post(
        f"/api/v1/reports/{report_id}/verify-all",
        headers=patient_headers
    )
    assert verify_all_res.status_code == 200
    data = verify_all_res.json()
    assert data["status"] == "verified"
    assert data["requires_verification"] is False
    for m in data["measurements"]:
        assert m["verification_status"] == "verified"

def test_longitudinal_trends_and_evidence(client, patient_headers):
    """Verify trends endpoint and PubMed evidence grounding."""
    sample_text = (
        "Tissue Transglutaminase IgA: 65.0 U/mL\n"
        "Fasting Blood Glucose: 110 mg/dL\n"
        "Total Cholesterol: 215 mg/dL\n"
        "Serum Creatinine: 1.1 mg/dL\n"
    )
    res = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "Multi-Panel Biomarker Review", "report_type": "Metabolic & Serology", "raw_text": sample_text}
    )
    assert res.status_code in [200, 201]
    report_id = res.json()["id"]

    # Trends
    trend_res = client.get(f"/api/v1/reports/{report_id}/trends", headers=patient_headers)
    assert trend_res.status_code == 200
    assert "trends" in trend_res.json()

    # Evidence
    ev_res = client.get(f"/api/v1/reports/{report_id}/evidence", headers=patient_headers)
    assert ev_res.status_code == 200
    evidence = ev_res.json()["evidence_sources"]
    assert len(evidence) >= 4
    pmids = [e["pmid"] for e in evidence]
    assert "36637387" in pmids  # ACG Celiac Guidelines
    assert "38078580" in pmids  # ADA Diabetes Standards

def test_clinician_queue_dynamic_biomarker_count_and_signoff(client, clinician_headers, patient_headers):
    """
    CRUCIAL TEST:
    Verifies that clinician queue returns accurate dynamic biomarker counts (measurement_count == len(measurements)).
    Verifies that formal sign-off generates HMAC-SHA256 audit token and sets status to approved.
    """
    sample_text = (
        "Anti-tTG IgA: 72.0 U/mL\n"
        "Total IgA: 2.7 g/L\n"
        "DGP IgG: 48.0 U/mL\n"
        "DGP IgA: 40.0 U/mL\n"
    )
    upload_res = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "STAT Celiac Panel", "report_type": "Celiac Serology", "raw_text": sample_text}
    )
    assert upload_res.status_code in [200, 201]
    report_id = upload_res.json()["id"]

    # Submit to clinician queue
    sub_res = client.post(f"/api/v1/reports/{report_id}/submit-review", headers=patient_headers)
    assert sub_res.status_code == 200

    # Clinician lists reports in queue
    queue_res = client.get("/api/v1/clinician/reports", headers=clinician_headers)
    assert queue_res.status_code == 200
    reports = queue_res.json()
    case = next((r for r in reports if r["id"] == report_id), None)
    assert case is not None
    # Crucial assertion: dynamic count matches actual measurements length!
    assert case["measurement_count"] == 4
    assert len(case["measurements"]) == 4
    assert case["measurement_count"] > 0  # NEVER 0!

    # Formal electronic sign-off
    signoff_res = client.post(
        f"/api/v1/clinician/reports/{report_id}/signoff",
        headers=clinician_headers,
        json={
            "decision": "approved",
            "clinician_notes": "Anti-tTG IgA markedly elevated. Advise gastroenterology consultation for confirmatory biopsy.",
            "attending_physician": "Dr. Elena Rostova, MD",
            "department": "Gastroenterology"
        }
    )
    assert signoff_res.status_code == 200
    signoff_data = signoff_res.json()
    assert signoff_data["status"] == "success"
    assert signoff_data["decision"] == "approved"
    assert signoff_data["audit_token"].startswith("AUDIT-REV-")
    assert "statutory_disclaimer" in signoff_data

def test_clinician_specialist_escalation(client, clinician_headers, patient_headers):
    """Test specialist escalation workflow."""
    sample_text = "Fasting Glucose: 210 mg/dL\nHbA1c: 9.8 %\n"
    upload_res = client.post(
        "/api/v1/reports/upload",
        headers=patient_headers,
        data={"title": "Hyperglycemia Crisis Panel", "report_type": "Endocrinology", "raw_text": sample_text}
    )
    assert upload_res.status_code in [200, 201]
    report_id = upload_res.json()["id"]

    escalate_res = client.post(
        f"/api/v1/clinician/reports/{report_id}/escalate",
        headers=clinician_headers,
        json={
            "department": "Endocrinology & Diabetes Clinic",
            "reason": "Severe uncontrolled hyperglycemia meeting immediate insulin titration criteria",
            "notes": "Urgent endocrinology referral requested."
        }
    )
    assert escalate_res.status_code == 200
    esc_data = escalate_res.json()
    assert esc_data["clinician_status"] == "escalated"
    assert esc_data["escalation_department"] == "Endocrinology & Diabetes Clinic"
    assert esc_data["audit_token"].startswith("ESCALATE-REF-")

def test_patient_rbac_forbidden_from_signoff(client, patient_headers):
    """Ensure regular patient cannot sign off clinical reports (403 Forbidden)."""
    response = client.post(
        "/api/v1/clinician/reports/1/signoff",
        headers=patient_headers,
        json={"decision": "approved", "clinician_notes": "Patient self-signoff"}
    )
    assert response.status_code in [403, 401]
