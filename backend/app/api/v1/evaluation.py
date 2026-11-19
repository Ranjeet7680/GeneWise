from fastapi import APIRouter, Depends
from typing import Any, Dict
from app.api.v1.deps import get_current_user
from app.models.models import User
from app.evaluation.evaluator import AIEvaluationEngine

router = APIRouter(prefix="/evaluation", tags=["AI Clinical Safety Evaluation"])

evaluator = AIEvaluationEngine()

@router.get("/benchmark", response_model=Dict[str, Any])
def get_benchmark_results(current_user: User = Depends(get_current_user)):
    """
    Returns the latest synthetic benchmark evaluation results.
    """
    return evaluator.run_full_evaluation()

@router.post("/run", response_model=Dict[str, Any])
def execute_benchmark_run(current_user: User = Depends(get_current_user)):
    """
    Executes a fresh evaluation across all 5 benchmark categories.
    """
    return evaluator.run_full_evaluation()

@router.get("/dataset-summary", response_model=Dict[str, Any])
def get_dataset_summary(current_user: User = Depends(get_current_user)):
    """
    Returns summary of synthetic evaluation dataset test cases.
    """
    categories = {}
    for item in evaluator.dataset:
        cat = item["category"]
        categories[cat] = categories.get(cat, 0) + 1

    return {
        "total_test_cases": len(evaluator.dataset),
        "category_distribution": categories,
        "engine_version": evaluator.version,
    }
