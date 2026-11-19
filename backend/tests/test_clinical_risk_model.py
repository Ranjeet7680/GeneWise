import pytest
from app.services.risk_models.celiac_service import CeliacRiskService


def test_celiac_risk_baseline_prediction(client, auth_headers):
    payload = {
        "age": 26,
        "gender": "Female",
        "diabetes": "No",
        "diabetes_type": "None",
        "diarrhoea": "inflammatory",
        "abdominal_pain": "yes",
        "short_stature": "no",
        "sticky_stool": "yes",
        "weight_loss": "yes",
        "iga": 2.8,
        "igg": 13.9,
        "igm": 1.1,
    }
    resp = client.post("/api/v1/ml/predict-risk", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "estimated_risk_probability" in data
    assert 0.0 <= data["estimated_risk_probability"] <= 1.0
    assert data["risk_level"] in ["Low Risk", "Moderate / Equivocal", "Elevated Risk", "High Probability"]
    assert len(data["confidence_interval"]) == 2
    assert data["confidence_interval"][0] <= data["confidence_interval"][1]
    
    # Verify Data Completeness
    assert "data_completeness" in data
    assert data["data_completeness"]["is_sufficient"] is True
    assert data["data_completeness"]["score_pct"] > 70.0
    
    # Verify SHAP explanations
    assert "shap_explanations" in data
    assert len(data["shap_explanations"]) > 0
    for shap_item in data["shap_explanations"]:
        assert "display_name" in shap_item
        assert "shap_value" in shap_item
        assert shap_item["direction"] in ["positive", "negative"]
        assert "reference_cohort_mean" in shap_item
        
    # Verify Model Transparency
    assert "model_transparency" in data
    assert data["model_transparency"]["sample_size"] == 2206
    assert data["model_transparency"]["roc_auc"] == 0.9424
    assert "calibration_status" in data["model_transparency"]
    
    # Verify Evidence Citations
    assert "evidence_citations" in data
    assert len(data["evidence_citations"]) >= 2
    assert any("36637387" in str(c.get("pmid")) for c in data["evidence_citations"])


def test_celiac_risk_advanced_inputs_high_ttg(client, auth_headers):
    payload = {
        "age": 32,
        "gender": "Female",
        "diabetes": "Yes",
        "diabetes_type": "Type 1",
        "diarrhoea": "fatty",
        "abdominal_pain": "yes",
        "short_stature": "no",
        "sticky_stool": "yes",
        "weight_loss": "yes",
        "iga": 2.5,
        "igg": 12.0,
        "igm": 1.1,
        "anti_ttg_iga": 125.0,  # >= 10x ULN
        "total_iga": 2.4,
        "family_history_celiac": "first_degree",
    }
    resp = client.post("/api/v1/ml/predict-risk", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["estimated_risk_probability"] >= 0.85
    assert data["risk_level"] in ["Elevated Risk", "High Probability"]
    
    # Check clinical recommendations mention 10x ULN and confirmatory EMA
    rec_text = " ".join(data["recommended_clinical_followup"])
    assert "10x ULN" in rec_text or "Endomysial" in rec_text or "ACG" in rec_text


def test_celiac_risk_selective_iga_deficiency_alert(client, auth_headers):
    payload = {
        "age": 40,
        "gender": "Male",
        "diabetes": "No",
        "diarrhoea": "watery",
        "abdominal_pain": "yes",
        "sticky_stool": "no",
        "weight_loss": "no",
        "iga": 0.10,
        "igg": 10.5,
        "igm": 1.0,
        "total_iga": 0.12,  # < 0.2 g/L -> selective IgA deficiency
        "anti_ttg_iga": 3.0,  # Falsely low
    }
    resp = client.post("/api/v1/ml/predict-risk", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    
    # Must flag selective IgA deficiency in contributing factors and recommendations
    factors_text = " ".join(data["contributing_factors"])
    rec_text = " ".join(data["recommended_clinical_followup"])
    assert "Selective IgA deficiency" in factors_text or "Selective IgA" in rec_text
    assert "FALSE-NEGATIVE" in rec_text or "IgG-based" in rec_text


def test_celiac_risk_hla_negative_virtual_ruleout(client, auth_headers):
    payload = {
        "age": 28,
        "gender": "Female",
        "diabetes": "No",
        "diarrhoea": "inflammatory",
        "abdominal_pain": "yes",
        "sticky_stool": "yes",
        "weight_loss": "no",
        "iga": 2.1,
        "igg": 11.0,
        "igm": 0.9,
        "genetic_testing_hla": "negative_both",  # Both negative
    }
    resp = client.post("/api/v1/ml/predict-risk", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["estimated_risk_probability"] <= 0.05
    factors_text = " ".join(data["contributing_factors"])
    assert "Negative Predictive Value" in factors_text or "HLA-DQ2.5 and HLA-DQ8 are both absent" in factors_text


def test_celiac_risk_insufficient_information_not_marked_low_risk(client, auth_headers):
    # Pass empty or flagged missing data
    payload = {
        "age": 30,
        "gender": "Female",
        "diabetes": "No",
        "missing_critical_data": True,
        "iga": 0.0,
        "igg": 0.0,
        "igm": 0.0,
    }
    resp = client.post("/api/v1/ml/predict-risk", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_level"] == "Insufficient Information"
    assert data["data_completeness"]["is_sufficient"] is False
    assert "NOT evaluated as a low-risk result" in data["data_completeness"]["status_message"]


def test_celiac_model_transparency_endpoint(client, auth_headers):
    resp = client.get("/api/v1/ml/models/celiac", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "model_transparency" in data
    assert "evidence_citations" in data
    trans = data["model_transparency"]
    assert trans["sample_size"] == 2206
    assert trans["roc_auc"] == 0.9424
    assert trans["sensitivity"] > 95.0
    assert trans["precision"] > 90.0
    assert "Platt Scaling" in trans["calibration_status"]
    assert "clinical_causation_notice" in trans


def test_clinician_model_review_sign_off_audit(client, auth_headers):
    review_payload = {
        "review_status": "approved",
        "clinician_notes": "Reviewed tTG-IgA titers (125 U/mL) and normal total serum IgA. Patient advised to maintain dietary gluten pending duodenal endoscopy.",
        "reviewer_name": "Dr. Elena Rostova, MD (Gastroenterology)",
        "escalation_department": "Gastroenterology",
        "corrected_inputs": {"anti_ttg_iga": 125.0},
    }
    resp = client.post("/api/v1/ml/review", json=review_payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["review_status"] == "approved"
    assert "AUDIT-REV-" in data["audit_token"]
    assert data["reviewer_name"] == "Dr. Elena Rostova, MD (Gastroenterology)"
    assert data["escalation_department"] == "Gastroenterology"


def test_unauthenticated_ml_predict_blocked(client):
    resp = client.post("/api/v1/ml/predict-risk", json={"age": 25, "gender": "Female", "iga": 2.0, "igg": 10.0, "igm": 1.0})
    assert resp.status_code == 401
