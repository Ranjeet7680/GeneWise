import datetime
import pytest
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.models.models import User


@pytest.fixture
def student_auth_headers(db_session):
    student = db_session.query(User).filter(User.email == "student_academy@medipredict.ai").first()
    if not student:
        student = User(
            id=301,
            email="student_academy@medipredict.ai",
            hashed_password=get_password_hash("StudentPass123!"),
            full_name="Priya Sharma",
            role="patient",
            is_active=True,
            is_verified=True,
        )
        db_session.add(student)
        db_session.commit()

    token = create_access_token(
        subject="301",
        expires_delta=datetime.timedelta(hours=2),
        extra_claims={"email": "student_academy@medipredict.ai", "role": "patient", "type": "access"},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(db_session):
    admin = db_session.query(User).filter(User.email == "admin_academy@medipredict.ai").first()
    if not admin:
        admin = User(
            id=302,
            email="admin_academy@medipredict.ai",
            hashed_password=get_password_hash("AdminPass123!"),
            full_name="Dr. Elena Rostova",
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db_session.add(admin)
        db_session.commit()

    token = create_access_token(
        subject="302",
        expires_delta=datetime.timedelta(hours=2),
        extra_claims={"email": "admin_academy@medipredict.ai", "role": "admin", "type": "access"},
    )
    return {"Authorization": f"Bearer {token}"}


def test_list_courses_and_filtering(client, student_auth_headers):
    # 1. Fetch all courses
    resp = client.get(f"{settings.API_V1_STR}/academy/courses", headers=student_auth_headers)
    assert resp.status_code == 200
    courses = resp.json()
    assert len(courses) >= 12
    course_codes = [c["code"] for c in courses]
    assert "GEN-101" in course_codes
    assert "GEN-102" in course_codes
    assert "GEN-103" in course_codes

    # 2. Filter by category
    resp_cat = client.get(
        f"{settings.API_V1_STR}/academy/courses?category=Inheritance Models",
        headers=student_auth_headers,
    )
    assert resp_cat.status_code == 200
    cat_courses = resp_cat.json()
    assert len(cat_courses) >= 1
    for c in cat_courses:
        assert "Inheritance" in c["category"]

    # 3. Filter by search query
    resp_search = client.get(
        f"{settings.API_V1_STR}/academy/courses?search=Mendel",
        headers=student_auth_headers,
    )
    assert resp_search.status_code == 200
    search_courses = resp_search.json()
    assert len(search_courses) >= 1


def test_get_course_detail_and_structure(client, student_auth_headers):
    resp = client.get(
        f"{settings.API_V1_STR}/academy/courses/course-01-genetics-fundamentals",
        headers=student_auth_headers,
    )
    assert resp.status_code == 200
    course = resp.json()
    assert course["id"] == "course-01-genetics-fundamentals"
    assert course["code"] == "GEN-101"
    assert len(course["chapters"]) >= 5
    first_chapter = course["chapters"][0]
    assert len(first_chapter["lessons"]) >= 1
    assert first_chapter["lessons"][0]["id"] == "c1-ch1-l1"


def test_enroll_in_course(client, student_auth_headers):
    resp = client.post(
        f"{settings.API_V1_STR}/academy/courses/course-01-genetics-fundamentals/enroll",
        headers=student_auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["course_id"] == "course-01-genetics-fundamentals"
    assert data["status"] in ["enrolled", "in_progress", "active"]


def test_get_lesson_detail(client, student_auth_headers):
    resp = client.get(
        f"{settings.API_V1_STR}/academy/lessons/c1-ch1-l1",
        headers=student_auth_headers,
    )
    assert resp.status_code == 200
    lesson = resp.json()
    assert lesson["id"] == "c1-ch1-l1"
    assert "3.2 billion base pairs" in lesson["content_markdown"]
    assert len(lesson["objectives"]) >= 2
    assert len(lesson["key_takeaways"]) >= 1
    assert len(lesson["clinical_pearls"]) >= 1
    assert len(lesson["citations"]) >= 1
    assert "11237011" in lesson["citations"][0]["pmid"] or "11181995" in lesson["citations"][0]["pmid"]


def test_update_lesson_progress(client, student_auth_headers):
    payload = {
        "is_completed": True,
        "time_spent_sec": 300,
        "notes": "Reviewed nuclear vs mitochondrial DNA differences for exam.",
        "is_bookmarked": True,
    }
    resp = client.post(
        f"{settings.API_V1_STR}/academy/lessons/c1-ch1-l1/progress",
        json=payload,
        headers=student_auth_headers,
    )
    assert resp.status_code == 200
    res = resp.json()
    assert res["is_completed"] is True
    assert res["progress_percent"] > 0


def test_get_quiz_detail(client, student_auth_headers):
    resp = client.get(
        f"{settings.API_V1_STR}/academy/quizzes/quiz-c1-ch1",
        headers=student_auth_headers,
    )
    assert resp.status_code == 200
    quiz = resp.json()
    assert quiz["id"] == "quiz-c1-ch1"
    assert len(quiz["questions"]) >= 3
    # Ensure options are present
    for q in quiz["questions"]:
        assert len(q["options"]) >= 2


def test_submit_quiz_grading(client, student_auth_headers):
    # Fetch quiz to see questions
    quiz_resp = client.get(
        f"{settings.API_V1_STR}/academy/quizzes/quiz-c1-ch1",
        headers=student_auth_headers,
    )
    quiz_data = quiz_resp.json()
    q_ids = [q["id"] for q in quiz_data["questions"]]

    # Submit answers
    payload = {
        "answers": {qid: "B" for qid in q_ids},
        "time_spent_sec": 120,
    }
    resp = client.post(
        f"{settings.API_V1_STR}/academy/quizzes/quiz-c1-ch1/submit",
        json=payload,
        headers=student_auth_headers,
    )
    assert resp.status_code == 200
    result = resp.json()
    assert "score_pct" in result
    assert "passed" in result
    assert len(result["explanations"]) >= 1
    assert "is_correct" in result["explanations"][0]


def test_submit_final_exam_and_certificate_issuance(client, student_auth_headers):
    # Submit exam answers matching quiz keys for 100% score
    payload = {
        "answers": {1: "3.2 billion base pairs", 2: "Strictly maternal inheritance", 3: "False"},
        "time_spent_sec": 450,
    }
    resp = client.post(
        f"{settings.API_V1_STR}/academy/courses/course-01-genetics-fundamentals/exam/submit",
        json=payload,
        headers=student_auth_headers,
    )
    assert resp.status_code == 200
    exam_res = resp.json()
    assert "score_pct" in exam_res
    assert exam_res["passed"] is True
    assert exam_res["can_generate_certificate"] is True
    assert exam_res["certificate_id"] is not None

    cert_id = exam_res["certificate_id"]
    assert cert_id.startswith("GW-CERT-2026-")

    cert_resp = client.get(f"{settings.API_V1_STR}/academy/certificates/{cert_id}")
    assert cert_resp.status_code == 200
    cert = cert_resp.json()
    assert cert["certificate_id"] == cert_id
    assert cert["learner_name"] == "Priya Sharma"
    assert cert["status"] == "valid"
    assert cert["signature_digest"] is not None
    assert "/verify-certificate" in cert["verification_url"]


def test_public_certificate_verification(client):
    # Verify non-existent certificate
    resp_invalid = client.get(f"{settings.API_V1_STR}/academy/certificates/verify/GW-INVALID-999")
    assert resp_invalid.status_code == 200
    data = resp_invalid.json()
    assert data["status"] == "invalid"
    assert data["verified"] is False


def test_admin_revoke_certificate(client, student_auth_headers, admin_auth_headers):
    # Submit exam to generate certificate
    payload = {
        "answers": {1: "3.2 billion base pairs", 2: "Strictly maternal inheritance", 3: "False"},
        "time_spent_sec": 400,
    }
    exam_resp = client.post(
        f"{settings.API_V1_STR}/academy/courses/course-01-genetics-fundamentals/exam/submit",
        json=payload,
        headers=student_auth_headers,
    )
    cert_id = exam_resp.json().get("certificate_id")

    assert cert_id is not None
    revoke_payload = {
        "revocation_reason": "Academic dishonesty flagged during integrity audit",
        "reviewer_name": "Dr. Elena Rostova",
    }
    rev_resp = client.post(
        f"{settings.API_V1_STR}/academy/admin/certificates/{cert_id}/revoke",
        json=revoke_payload,
        headers=admin_auth_headers,
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["status"] == "revoked"
    assert rev_resp.json()["audit_hash"] is not None

    # Public verification now reflects revoked status
    verify_resp = client.get(f"{settings.API_V1_STR}/academy/certificates/verify/{cert_id}")
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["status"] == "revoked"
    assert verify_data["verified"] is False
    assert "Academic dishonesty" in verify_data["message"]


def test_virtual_labs_listing_and_submission(client, student_auth_headers):
    # List labs
    resp = client.get(f"{settings.API_V1_STR}/academy/labs", headers=student_auth_headers)
    assert resp.status_code == 200
    labs = resp.json()
    assert len(labs) == 10
    lab_codes = [l["code"] for l in labs]
    assert "LAB-DNA-01" in lab_codes
    assert "LAB-PUN-02" in lab_codes
    assert "LAB-VAR-05" in lab_codes

    # Submit attempt for Punnett Square Lab
    lab_payload = {
        "result_data": {
            "paternal_genotype": "Aa",
            "maternal_genotype": "Aa",
            "offspring_ratios": {"AA": 0.25, "Aa": 0.50, "aa": 0.25},
            "affected_risk": 0.25,
        },
        "time_spent_sec": 180,
    }
    submit_resp = client.post(
        f"{settings.API_V1_STR}/academy/labs/lab-02-punnett-squares/submit",
        json=lab_payload,
        headers=student_auth_headers,
    )
    assert submit_resp.status_code == 200
    assert submit_resp.json()["is_completed"] is True


def test_learner_dashboard_aggregation(client, student_auth_headers):
    resp = client.get(f"{settings.API_V1_STR}/academy/dashboard", headers=student_auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_enrolled"] >= 1
    assert data["learning_streak_days"] >= 1
    assert len(data["virtual_labs"]) >= 1
