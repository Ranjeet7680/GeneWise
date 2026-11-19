import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_optional_user, require_roles
from app.db.session import get_db
from app.models.models import User
from app.schemas.academy import (
    AcademyDashboardResponse,
    AdminRevokeCertificateRequest,
    CertificateResponse,
    CertificateVerificationResponse,
    CourseDetail,
    CourseSummary,
    ExamSubmitRequest,
    ExamSubmitResponse,
    LessonDetail,
    QuizDetail,
    QuizSubmitRequest,
    QuizSubmitResponse,
    VirtualLabItem,
)
from app.services.academy_service import academy_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/academy", tags=["Genetics Learning Academy"])


@router.get("/courses", response_model=List[CourseSummary])
def list_courses(
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    search: Optional[str] = Query(None, description="Search courses"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve comprehensive genetics academy course catalog with optional user progress tracking."""
    user_id = current_user.id if current_user else None
    return academy_service.list_courses(
        db=db,
        user_id=user_id,
        category=category,
        difficulty=difficulty,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/courses/{course_id}", response_model=CourseDetail)
def get_course_detail(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve full course syllabus, chapters, lessons list, and exam status."""
    user_id = current_user.id if current_user else None
    try:
        return academy_service.get_course_detail(db=db, course_id=course_id, user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/courses/{course_id}/enroll")
def enroll_in_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Enroll the authenticated learner in a genetics learning course."""
    try:
        return academy_service.enroll_in_course(db=db, course_id=course_id, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/lessons/{lesson_id}", response_model=LessonDetail)
def get_lesson_detail(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve lesson multimedia content, scientific explanation, clinical pearls, citations, and navigation."""
    user_id = current_user.id if current_user else None
    try:
        return academy_service.get_lesson_detail(db=db, lesson_id=lesson_id, user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/lessons/{lesson_id}/progress")
def update_lesson_progress(
    lesson_id: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record lesson completion, reading/watch time, personal study notes, or bookmark state."""
    try:
        return academy_service.update_lesson_progress(
            db=db,
            lesson_id=lesson_id,
            user_id=current_user.id,
            is_completed=payload.get("is_completed", True),
            time_spent_sec=payload.get("time_spent_sec", 60),
            notes=payload.get("notes"),
            is_bookmarked=payload.get("is_bookmarked", False),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/quizzes/{quiz_id}", response_model=QuizDetail)
def get_quiz_detail(
    quiz_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Retrieve module quiz questions, passing threshold, and prior user attempt score."""
    user_id = current_user.id if current_user else None
    try:
        return academy_service.get_quiz_detail(db=db, quiz_id=quiz_id, user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/quizzes/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: str,
    request: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grade module quiz, calculate score, and return in-depth clinical rationales."""
    try:
        return academy_service.submit_quiz(
            db=db,
            quiz_id=quiz_id,
            user_id=current_user.id,
            answers=request.answers,
            time_spent_sec=request.time_spent_sec,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/courses/{course_id}/exam/submit", response_model=ExamSubmitResponse)
def submit_final_exam(
    course_id: str,
    request: ExamSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grade comprehensive final examination. If score >= passing threshold (70%), automatically issues official Certificate."""
    try:
        learner_name = current_user.full_name or current_user.email.split("@")[0].capitalize()
        return academy_service.submit_final_exam(
            db=db,
            course_id=course_id,
            user_id=current_user.id,
            answers=request.answers,
            time_spent_sec=request.time_spent_sec,
            learner_name=learner_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/certificates/{certificate_id}", response_model=CertificateResponse)
def get_certificate(
    certificate_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve official certificate details, cryptographic signature digest, and verification metadata."""
    try:
        return academy_service.get_certificate(db=db, certificate_id=certificate_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/certificates/verify/{certificate_id}", response_model=CertificateVerificationResponse)
def verify_certificate_public(
    certificate_id: str,
    db: Session = Depends(get_db),
):
    """Public certificate verification endpoint. Safely returns validation status without exposing student PII."""
    return academy_service.verify_certificate_public(db=db, certificate_id=certificate_id)


@router.post("/admin/certificates/{certificate_id}/revoke")
def admin_revoke_certificate(
    certificate_id: str,
    payload: AdminRevokeCertificateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "clinician"])),
):
    """Administrative endpoint to revoke an issued certificate with immutable audit log hashing."""
    try:
        reviewer_name = current_user.full_name or current_user.email
        return academy_service.admin_revoke_certificate(
            db=db,
            certificate_id=certificate_id,
            reviewer_name=reviewer_name,
            reason=payload.revocation_reason,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/labs", response_model=List[VirtualLabItem])
def list_virtual_labs(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """List 10 interactive virtual genetics laboratories with completion status."""
    user_id = current_user.id if current_user else None
    return academy_service.list_virtual_labs(db=db, user_id=user_id)


@router.post("/labs/{lab_id}/submit")
def submit_lab_attempt(
    lab_id: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record completion of a virtual lab simulation experiment."""
    try:
        return academy_service.submit_lab_attempt(
            db=db,
            lab_id=lab_id,
            user_id=current_user.id,
            result_data=payload.get("result_data", {}),
            time_spent_sec=payload.get("time_spent_sec", 120),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/dashboard", response_model=AcademyDashboardResponse)
def get_learner_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve personalized academy metrics, enrolled progress, issued certificates, and virtual lab milestones."""
    return academy_service.get_learner_dashboard(db=db, user_id=current_user.id)
