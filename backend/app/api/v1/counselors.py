from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user, get_optional_user, get_db
from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.models import User
from app.models.counselors import GeneticCounselorModel
from app.schemas.counselors import (
    CounselorResponse,
    CounselorDetailResponse,
    AppointmentRequestCreate,
    AppointmentRequestResponse,
    AppointmentStatusUpdate,
    DoctorPrepRequest,
    DoctorPrepResponse,
    CounselorMatchRequest,
    AdminVerifyCredentialRequest,
    AdminCreateCounselorRequest,
)
from app.services.counselor_service import CounselorService

router = APIRouter(prefix="/counselors", tags=["Genetic Counselors Directory & Clinical Support"])

def verify_admin(user: User):
    if user.role != "admin":
        raise ForbiddenException("Administrator privileges required for this credentialing action.")

@router.get("", response_model=List[CounselorResponse])
def list_counselors(
    search: Optional[str] = Query(None, description="Search by name, hospital, gene loci, or registration #"),
    specialty: Optional[str] = Query(None, description="Filter by clinical subspecialty"),
    country: Optional[str] = Query(None, description="Filter by country"),
    location: Optional[str] = Query(None, description="Filter by city, state, or region"),
    telehealth: Optional[bool] = Query(None, description="Telehealth availability filter"),
    sort_by: str = Query("relevance", description="Sort by relevance, experience, location, or telehealth"),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Search and filter licensed clinical genetic counselors across verified directories.
    Supports gene loci search (e.g. BRCA1, CFTR, LDLR, FBN1), specialty, and telehealth.
    """
    user_id = current_user.id if current_user else None
    telehealth_only = bool(telehealth) if telehealth is not None else False
    results, _ = CounselorService.search_counselors(
        db=db,
        query=search,
        specialty=specialty,
        country=country,
        location=location,
        telehealth_only=telehealth_only,
        sort_by=sort_by,
        current_user_id=user_id,
        limit=limit,
        offset=offset,
    )
    return results

@router.get("/saved", response_model=List[CounselorDetailResponse])
def get_my_saved_counselors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists counselors bookmarked by the authenticated user."""
    return CounselorService.list_saved_counselors(db, current_user.id)

@router.get("/appointments/my", response_model=List[AppointmentRequestResponse])
def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all active and historical appointment booking requests for current patient."""
    return CounselorService.list_user_appointments(db, current_user.id)

@router.post("/doctor-prep", response_model=DoctorPrepResponse)
def generate_doctor_prep_brief(
    req: DoctorPrepRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    AI Doctor Preparation Wizard:
    Synthesizes consultation purpose, family health pedigree, and attached reports into an educational clinical brief.
    """
    return CounselorService.generate_doctor_prep_brief(db, current_user, req)

@router.post("/match", response_model=List[CounselorResponse])
def match_counselors_by_profile(
    req: CounselorMatchRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Smart Counselor Matching Engine:
    Recommends verified counselors matching patient's genes, reported conditions, and location.
    """
    user_id = current_user.id if current_user else None
    query_str = " ".join(req.gene_loci + req.conditions)
    results, _ = CounselorService.search_counselors(
        db=db,
        query=query_str if query_str.strip() else None,
        specialty=req.specialty,
        country=req.country,
        location=req.location,
        telehealth_only=req.telehealth_only,
        current_user_id=user_id,
        limit=10,
    )
    return results

@router.get("/{counselor_id}", response_model=CounselorDetailResponse)
def get_counselor_profile(
    counselor_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Retrieves detailed professional profile, verified credentials, and services for a counselor."""
    user_id = current_user.id if current_user else None
    c = CounselorService.get_counselor_detail(db, counselor_id, user_id)
    if not c:
        raise NotFoundException(f"Counselor '{counselor_id}' not found.")
    return c

@router.post("/{counselor_id}/save")
def toggle_save_counselor(
    counselor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bookmarks or unbookmarks a counselor to patient's private saved list."""
    is_saved = CounselorService.toggle_saved_counselor(db, counselor_id, current_user.id)
    return {
        "counselor_id": counselor_id,
        "is_saved": is_saved,
        "message": "Counselor saved to your clinical support directory." if is_saved else "Counselor removed from saved list.",
    }

@router.post("/{counselor_id}/appointments", response_model=AppointmentRequestResponse, status_code=status.HTTP_201_CREATED)
def book_counselor_appointment(
    counselor_id: str,
    appointment_in: AppointmentRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Requests a formal consultation appointment with preferred date, time slot, and protected video room link.
    """
    appointment_in.counsellor_id = counselor_id
    try:
        return CounselorService.create_appointment_request(db, current_user, appointment_in)
    except ValueError as e:
        raise NotFoundException(str(e))

@router.patch("/appointments/{appointment_id}")
def update_appointment(
    appointment_id: str,
    update_in: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reschedules or cancels an existing appointment request."""
    try:
        return CounselorService.update_appointment_status(
            db=db,
            appointment_id=appointment_id,
            user_id=current_user.id,
            status=update_in.status,
            reason=update_in.reason,
        )
    except PermissionError as e:
        raise ForbiddenException(str(e))
    except ValueError as e:
        raise NotFoundException(str(e))

# ==============================================================================
# ADMINISTRATOR CREDENTIALING & DIRECTORY MANAGEMENT
# ==============================================================================

@router.post("/admin/{counselor_id}/verify")
def admin_verify_credential(
    counselor_id: str,
    req: AdminVerifyCredentialRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Administrator credentialing endpoint to approve, reject, or expire institutional credentials."""
    verify_admin(current_user)
    try:
        return CounselorService.admin_verify_counselor_credential(
            db=db,
            counselor_id=counselor_id,
            admin_user=current_user,
            req=req,
        )
    except ValueError as e:
        raise NotFoundException(str(e))

@router.post("/admin/create", response_model=CounselorDetailResponse, status_code=status.HTTP_201_CREATED)
def admin_create_counselor(
    req: AdminCreateCounselorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Administrator endpoint to create a new verified counselor directory entry."""
    verify_admin(current_user)
    c = GeneticCounselorModel(
        full_name=req.full_name,
        title=req.title,
        professional_title=req.professional_title,
        primary_specialty=req.primary_specialty,
        subspecialties=req.subspecialties,
        credentials_display=f"{req.certification_org} · Reg #{req.registration_number}",
        qualification=req.qualification,
        certification_org=req.certification_org,
        registration_number=req.registration_number,
        verification_status=req.verification_status,
        institution=req.institution,
        city=req.city,
        state_province=req.state_province,
        country=req.country,
        practice_location=req.practice_location,
        languages=req.languages,
        telehealth_available=req.telehealth_available,
        consultation_availability=req.consultation_availability,
        experience_years=req.experience_years,
        fee_structure=req.fee_structure,
        bio=req.bio,
        target_loci=req.target_loci,
        target_conditions=req.target_conditions,
        services_offered=req.services_offered,
        is_active=True,
        is_demo_provider=True,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return CounselorService.get_counselor_detail(db, c.id, current_user.id)
