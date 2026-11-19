import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.models.models import User
from app.core.security import get_password_hash

@pytest.fixture
def patient_headers(client, db_session):
    patient = db_session.query(User).filter(User.email == "patient_counselor@medipredict.ai").first()
    if not patient:
        patient = User(
            id=201,
            email="patient_counselor@medipredict.ai",
            hashed_password=get_password_hash("PatientPass123!"),
            full_name="Ananya Desai",
            role="patient",
            is_active=True,
            is_verified=True,
        )
        db_session.add(patient)
        db_session.commit()

    res = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": "patient_counselor@medipredict.ai", "password": "PatientPass123!"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers(client, db_session):
    admin = db_session.query(User).filter(User.email == "admin_counselor@medipredict.ai").first()
    if not admin:
        admin = User(
            id=202,
            email="admin_counselor@medipredict.ai",
            hashed_password=get_password_hash("AdminPass123!"),
            full_name="System Administrator",
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db_session.add(admin)
        db_session.commit()

    res = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": "admin_counselor@medipredict.ai", "password": "AdminPass123!"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_list_counselors_and_seed_data(client):
    """Ensure directory is populated with reference licensed counselors."""
    res = client.get(f"{settings.API_V1_STR}/counselors")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 7

    names = [c["name"] for c in data]
    assert "Dr. Maya Lin, MS, CGC" in names
    assert "Dr. Aaron Vance, MS, CGC" in names
    assert "Dr. Sarah Al-Mansoor, PhD, CGC" in names
    assert "Dr. Elena Rostova, MS, CGC" in names
    assert "Dr. Priya Sharma, MS, CGC" in names

def test_search_counselors_by_gene_loci(client):
    """Search by gene loci (FBN1, BRCA1, CFTR)."""
    # 1. Search FBN1 (Cardiogenetics / Marfan)
    res_fbn1 = client.get(f"{settings.API_V1_STR}/counselors?search=FBN1")
    assert res_fbn1.status_code == 200
    fbn1_data = res_fbn1.json()
    assert len(fbn1_data) >= 1
    assert any("Maya Lin" in c["name"] for c in fbn1_data)

    # 2. Search BRCA1 (Oncogenetics / HBOC)
    res_brca = client.get(f"{settings.API_V1_STR}/counselors?search=BRCA1")
    assert res_brca.status_code == 200
    brca_data = res_brca.json()
    assert any("Elena Rostova" in c["name"] for c in brca_data)

    # 3. Search CFTR (Cystic Fibrosis / Rare Disease)
    res_cftr = client.get(f"{settings.API_V1_STR}/counselors?search=CFTR")
    assert res_cftr.status_code == 200
    cftr_data = res_cftr.json()
    assert any("Aaron Vance" in c["name"] for c in cftr_data)

def test_filter_counselors_by_specialty_and_telehealth(client):
    """Filter by specialty and telehealth availability."""
    res = client.get(f"{settings.API_V1_STR}/counselors?specialty=Cardiogenetics&telehealth=true")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2
    for c in data:
        assert "Cardiogenetics" in c["specialty"] or "Cardiogenetics" in c["subspecialties"]
        assert c["telehealth"] is True

def test_filter_counselors_by_country(client):
    """Filter by country (United States vs India)."""
    res_in = client.get(f"{settings.API_V1_STR}/counselors?country=India")
    assert res_in.status_code == 200
    data_in = res_in.json()
    assert len(data_in) >= 2
    for c in data_in:
        assert c["country"] == "India"
        assert "BGCI" in c["credentials"] or "MCI" in c["credentials"]

def test_get_counselor_detail_profile(client):
    """Retrieve full professional profile with credentials list and services."""
    res = client.get(f"{settings.API_V1_STR}/counselors/cgc-01-lin")
    assert res.status_code == 200
    c = res.json()
    assert c["name"] == "Dr. Maya Lin, MS, CGC"
    assert c["certification_org"] == "American Board of Genetic Counseling (ABGC)"
    assert len(c["credentials_list"]) >= 1
    assert "3-Generation Pedigree Review" in c["services_offered"]
    assert len(c["consultation_modes"]) >= 2

def test_save_and_unsave_counselor(client, patient_headers):
    """Toggle bookmarking a counselor."""
    c_id = "cgc-01-lin"

    # Save
    res_save = client.post(f"{settings.API_V1_STR}/counselors/{c_id}/save", headers=patient_headers)
    assert res_save.status_code == 200
    assert res_save.json()["is_saved"] is True

    # List saved
    res_saved = client.get(f"{settings.API_V1_STR}/counselors/saved", headers=patient_headers)
    assert res_saved.status_code == 200
    saved_items = res_saved.json()
    assert any(c["id"] == c_id for c in saved_items)

    # Unsave
    res_unsave = client.post(f"{settings.API_V1_STR}/counselors/{c_id}/save", headers=patient_headers)
    assert res_unsave.status_code == 200
    assert res_unsave.json()["is_saved"] is False

def test_create_appointment_request_with_telehealth(client, patient_headers):
    """Book consultation appointment and verify protected telehealth link and HMAC token."""
    payload = {
        "counsellor_id": "cgc-01-lin",
        "patient_name": "Ananya Desai",
        "patient_email": "patient_counselor@medipredict.ai",
        "patient_phone": "+1-415-555-0199",
        "consultation_purpose": "Family history of early thoracic aortic dissection (FBN1 / Marfan evaluation)",
        "preferred_date": "2026-12-05",
        "preferred_time_slot": "10:30 AM",
        "time_zone": "America/Los_Angeles",
        "consultation_format": "telehealth",
        "consent_data_sharing": True,
        "intake_notes": "Maternal uncle diagnosed with aortic root aneurysm at age 42.",
    }
    res = client.post(f"{settings.API_V1_STR}/counselors/cgc-01-lin/appointments", headers=patient_headers, json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["counsellor_name"] == "Dr. Maya Lin, MS, CGC"
    assert data["status"] == "pending"
    assert data["telehealth_link"].startswith("https://meet.genewise.ai/telehealth/cgc-")
    assert data["audit_token"].startswith("APT-CONF-")
    assert len(data["pre_consultation_instructions"]) >= 3

    # Check user can list appointment
    my_res = client.get(f"{settings.API_V1_STR}/counselors/appointments/my", headers=patient_headers)
    assert my_res.status_code == 200
    my_apts = my_res.json()
    assert len(my_apts) >= 1
    apt_id = data["id"]
    assert any(a["id"] == apt_id for a in my_apts)

    # Reschedule appointment
    patch_res = client.patch(
        f"{settings.API_V1_STR}/counselors/appointments/{apt_id}",
        headers=patient_headers,
        json={"status": "rescheduled", "reason": "Patient conflict with work schedule"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "rescheduled"

def test_doctor_prep_wizard_brief_generation(client, patient_headers):
    """Test AI Doctor Preparation Wizard generating clinical consultation brief."""
    prep_payload = {
        "consultation_purpose": "Hereditary Breast & Ovarian Cancer Risk Discussion",
        "selected_goals": ["Family history review", "Genetic testing options", "Cascade screening for daughter"],
        "family_conditions": [
            {"relative": "Mother", "branch": "Maternal", "condition": "Breast Cancer", "age_at_diagnosis": 44},
            {"relative": "Maternal Aunt", "branch": "Maternal", "condition": "Ovarian Cancer", "age_at_diagnosis": 51},
        ],
        "relevant_genes": ["BRCA1", "BRCA2"],
        "include_saved_pedigree": False,
        "patient_notes": "Seeking guidance on alternating MRI/mammography protocol and genetic sequencing panel.",
    }
    res = client.post(f"{settings.API_V1_STR}/counselors/doctor-prep", headers=patient_headers, json=prep_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["suggested_counselor_specialty"] == "Oncogenetics"
    assert len(data["questions_to_ask"]) >= 4
    assert len(data["documents_to_bring"]) >= 4
    assert len(data["screening_topics"]) >= 2
    assert "disclaimer" in data

def test_admin_credential_verification_workflow(client, admin_headers):
    """Admin approves or modifies credential status and generates tamper-resistant audit hash."""
    c_id = "cgc-02-vance"
    res = client.post(
        f"{settings.API_V1_STR}/counselors/admin/{c_id}/verify",
        headers=admin_headers,
        json={
            "status": "verified",
            "reviewer_name": "Dr. Sarah Jenkins, MD, Chief Credentialing Officer",
            "review_notes": "ABGC 2024 recertification documentation and primary source hospital verification confirmed.",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["new_status"] == "verified"
    assert len(data["audit_hash"]) == 64

def test_patient_forbidden_from_admin_credential_actions(client, patient_headers):
    """Ensure non-admin patient cannot modify counselor credentials (403 Forbidden)."""
    res = client.post(
        f"{settings.API_V1_STR}/counselors/admin/cgc-01-lin/verify",
        headers=patient_headers,
        json={"status": "verified", "reviewer_name": "Fraud Reviewer", "review_notes": "Fake"},
    )
    assert res.status_code == 403
