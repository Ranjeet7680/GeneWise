import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.models.models import User

@pytest.fixture()
def auth_headers(db_session):
    user = db_session.query(User).filter(User.email == "demo@medipredict.ai").first()
    if not user:
        user = db_session.query(User).first()
    token = create_access_token(subject=str(user.id))
    return {"Authorization": f"Bearer {token}"}

def test_family_genetics_overview(client, auth_headers):
    response = client.get("/api/v1/family-genetics/overview", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "family_members_count" in data
    assert "family_history_completeness_pct" in data
    assert "disclaimer" in data
    assert "MediPredict AI" in data["disclaimer"]

def test_family_tree_crud(client, auth_headers):
    # 1. Get Tree
    res = client.get("/api/v1/family-genetics/tree", headers=auth_headers)
    assert res.status_code == 200
    tree_data = res.json()
    assert "members" in tree_data
    assert len(tree_data["members"]) >= 7

    # 2. Add Relative
    add_payload = {
        "name": "Uncle David",
        "relationship_to_proband": "Paternal Uncle",
        "generation": 2,
        "branch": "Paternal",
        "gender": "male",
        "biological_relationship": True,
        "current_age": "55",
        "history_status": "known",
        "conditions": [
            {
                "condition_name": "Hypercholesterolemia",
                "category": "Cardiovascular",
                "age_at_diagnosis": "45",
                "is_genetic": True,
                "suspected_inheritance": "Autosomal Dominant",
                "verification_level": "Medical Records"
            }
        ]
    }
    create_res = client.post("/api/v1/family-genetics/members", json=add_payload, headers=auth_headers)
    assert create_res.status_code == 201
    member = create_res.json()
    member_id = member["id"]
    assert member["relationship_to_proband"] == "Paternal Uncle"
    assert len(member["conditions"]) == 1

    # 3. Update Relative
    update_payload = {"current_age": "56", "clinical_notes": "Followed up with preventive cardiology"}
    update_res = client.put(f"/api/v1/family-genetics/members/{member_id}", json=update_payload, headers=auth_headers)
    assert update_res.status_code == 200
    assert update_res.json()["current_age"] == "56"

    # 4. Export Summary
    export_res = client.get("/api/v1/family-genetics/export", headers=auth_headers)
    assert export_res.status_code == 200
    assert "exported_at" in export_res.json()

    # 5. Delete Relative
    del_res = client.delete(f"/api/v1/family-genetics/members/{member_id}", headers=auth_headers)
    assert del_res.status_code == 204

def test_risk_intelligence_engine(client, auth_headers):
    res = client.post("/api/v1/family-genetics/risk-analysis", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "educational_category" in data
    assert data["educational_category"] in [
        "Insufficient information",
        "No clear pattern identified",
        "Further discussion may be useful",
        "Professional genetic evaluation suggested"
    ]
    assert "suggested_clinician_questions" in data
    assert len(data["suggested_clinician_questions"]) > 0
    assert "evidence_references" in data
    assert "disclaimer" in data

def test_carrier_screening_catalog(client, auth_headers):
    res = client.get("/api/v1/family-genetics/carrier-screening", headers=auth_headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) >= 4
    names = [i["condition_name"] for i in items]
    assert any("Thalassemia" in n for n in names)
    assert any("Sickle" in n for n in names)
    assert any("Cystic Fibrosis" in n for n in names)
    assert any("Spinal Muscular Atrophy" in n for n in names)

def test_preconception_planning(client, auth_headers):
    # 1. Get Plan
    res = client.get("/api/v1/family-genetics/preconception", headers=auth_headers)
    assert res.status_code == 200
    plan = res.json()
    assert "target_timeline" in plan

    # 2. Update Plan
    update_data = {
        "target_timeline": "Within 3-6 months",
        "carrier_screening_discussed": True,
        "medications_reviewed": True
    }
    put_res = client.put("/api/v1/family-genetics/preconception", json=update_data, headers=auth_headers)
    assert put_res.status_code == 200
    assert put_res.json()["carrier_screening_discussed"] is True

    # 3. Export Summary
    exp_res = client.get("/api/v1/family-genetics/preconception/export", headers=auth_headers)
    assert exp_res.status_code == 200
    assert "timeline" in exp_res.json()

def test_specialist_referral_workflow(client, auth_headers):
    # 1. Get Counsellor Directory
    counsellors_res = client.get("/api/v1/family-genetics/counsellors", headers=auth_headers)
    assert counsellors_res.status_code == 200
    counsellors = counsellors_res.json()
    assert len(counsellors) >= 1
    c_id = counsellors[0]["id"]

    # 2. Attempt Referral Without Consent (Must fail 422 or 400)
    invalid_payload = {
        "counsellor_id": c_id,
        "referral_reason": "Preconception carrier screening review",
        "consent_granted": False
    }
    fail_res = client.post("/api/v1/family-genetics/referrals", json=invalid_payload, headers=auth_headers)
    assert fail_res.status_code in [400, 422]

    # 3. Valid Referral with Explicit Consent
    valid_payload = {
        "counsellor_id": c_id,
        "referral_reason": "Preconception carrier screening review",
        "consent_granted": True,
        "include_family_tree": True,
        "include_genetic_tests": True,
        "notes_for_specialist": "Patient and partner request carrier screening review."
    }
    success_res = client.post("/api/v1/family-genetics/referrals", json=valid_payload, headers=auth_headers)
    assert success_res.status_code == 201
    ref = success_res.json()
    assert ref["consent_granted"] is True
    assert ref["status"] == "Requested"

    # 4. List Referrals
    list_res = client.get("/api/v1/family-genetics/referrals", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

def test_ai_genetic_assistant(client, auth_headers):
    payload = {
        "query": "Explain what autosomal dominant inheritance means and how it differs from recessive.",
        "language": "en-US",
        "include_pedigree_context": True
    }
    res = client.post("/api/v1/family-genetics/assistant/query", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "family_history_observations" in data
    assert "possible_inheritance_patterns" in data
    assert "educational_risk_category" in data
    assert "evidence" in data
    assert "uncertainties" in data
    assert "screening_discussion_options" in data
    assert "professional_follow_up" in data
    assert "medical_disclaimer" in data

def test_consent_governance(client, auth_headers):
    # 1. Get Consents
    get_res = client.get("/api/v1/family-genetics/consent", headers=auth_headers)
    assert get_res.status_code == 200
    assert "consents" in get_res.json()

    # 2. Toggle Consent
    toggle_payload = {"consent_type": "partner_data_sharing", "granted": True}
    post_res = client.post("/api/v1/family-genetics/consent", json=toggle_payload, headers=auth_headers)
    assert post_res.status_code == 200
    consents = post_res.json()["consents"]
    partner_consent = next((c for c in consents if c["consent_type"] == "partner_data_sharing"), None)
    assert partner_consent is not None
    assert partner_consent["granted"] is True

def test_evidence_catalog(client, auth_headers):
    res = client.get("/api/v1/family-genetics/evidence", headers=auth_headers)
    assert res.status_code == 200
    assert "evidence_sources" in res.json()
    sources = res.json()["evidence_sources"]
    assert len(sources) >= 3
