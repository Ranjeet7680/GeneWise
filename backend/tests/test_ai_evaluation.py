import pytest
from fastapi.testclient import TestClient
from app.evaluation.evaluator import AIEvaluationEngine
from app.services.agents.supervisor import AgentSupervisor

def test_evaluator_runs_all_categories():
    evaluator = AIEvaluationEngine()
    results = evaluator.run_full_evaluation()

    assert results["overall_ai_benchmark_score"] == 100.0
    assert results["hallucination_rate"] == 0.0
    assert results["passed_benchmark_cases"] == results["total_benchmark_cases"]
    assert len(results["test_results"]) >= 10

    # Verify all 5 categories evaluated
    cats = results["category_metrics"]
    assert "citation_accuracy" in cats
    assert "multilingual_fidelity" in cats
    assert "pedigree_interpretation" in cats
    assert "uncertainty_calibration" in cats
    assert "fairness_and_safety" in cats

    for cat_name, metrics in cats.items():
        assert metrics["score_percentage"] == 100.0
        assert metrics["status"] == "HEALTHY"

def test_evaluator_api_endpoints(client: TestClient, auth_headers: dict):
    # Test GET benchmark
    resp1 = client.get("/api/v1/evaluation/benchmark", headers=auth_headers)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["overall_ai_benchmark_score"] >= 95.0
    assert "category_metrics" in data1

    # Test POST run
    resp2 = client.post("/api/v1/evaluation/run", headers=auth_headers)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["total_benchmark_cases"] > 0

    # Test GET dataset summary
    resp3 = client.get("/api/v1/evaluation/dataset-summary", headers=auth_headers)
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert data3["total_test_cases"] > 0
    assert "citation_accuracy" in data3["category_distribution"]

def test_explainable_ai_endpoint(client: TestClient, auth_headers: dict):
    payload = {
        "title": "Beta Thalassemia Carrier Trait Risk Evaluation",
        "insight_type": "genetics_carrier_screening",
        "clinical_logic": "Autosomal Recessive inheritance verified; proband is an asymptomatic carrier.",
        "missing_data_points": ["Partner carrier screening test status pending"],
        "next_steps": ["Recommend partner Complete Blood Count and Hemoglobin HPLC"]
    }
    resp = client.post("/api/v1/family-genetics/explain", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "explainability_dimensions" in data
    dims = data["explainability_dimensions"]
    assert "1_information_analyzed" in dims
    assert "2_relevant_family_history" in dims
    assert "3_clinical_logic_rationale" in dims
    assert "4_supporting_evidence_citations" in dims
    assert "5_uncertainties_and_limitations" in dims
    assert "6_suggested_professional_followup" in dims

    # Verify citation structure has outdated check
    cites = dims["4_supporting_evidence_citations"]
    assert len(cites) > 0
    assert "consensus_status" in cites[0]

def test_questionnaire_endpoints(client: TestClient, auth_headers: dict):
    # 1. Fetch questionnaire
    resp1 = client.get("/api/v1/family-genetics/questionnaire", headers=auth_headers)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert len(data1["sections"]) >= 4

    # 2. Submit answers
    answers = {
        "q_ancestry": True,
        "q_consanguinity": False,
        "q_teratogens": False,
        "q_folic_acid": True,
        "q_past_testing": True
    }
    resp2 = client.post("/api/v1/family-genetics/questionnaire/submit", json=answers, headers=auth_headers)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["status"] == "success"
    assert data2["completed_answers_count"] >= 5

@pytest.mark.anyio
async def test_supervisor_delegates_to_genetics_agent():
    supervisor = AgentSupervisor()
    task = "Analyze our family history of Beta Thalassemia trait and evaluate carrier inheritance pattern."
    result = await supervisor.run(task=task, context={"user_id": 1})

    assert result["status"] == "completed"
    assert "Genetic Intelligence & Pedigree Agent" in result["delegated_agents"]
    assert result["human_review_required"] is True
    assert "Beta Thalassemia" in result["summary"]
