from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class LessonSummary(BaseModel):
    id: str
    chapter_id: str
    course_id: str
    lesson_number: int
    title: str
    slug: str
    reading_time_min: int = 8
    difficulty: str = "Beginner"
    order_index: int = 1
    is_completed: bool = False
    bookmarked: bool = False
    has_video: bool = True
    has_audio: bool = True
    has_lab: bool = False


class ChapterSummary(BaseModel):
    id: str
    course_id: str
    chapter_number: int
    title: str
    description: Optional[str] = None
    order_index: int = 1
    lessons: List[LessonSummary] = []
    quiz_id: Optional[str] = None
    quiz_passed: bool = False


class CourseSummary(BaseModel):
    id: str
    code: str
    title: str
    slug: str
    subtitle: Optional[str] = None
    description: str
    category: str
    difficulty: str
    duration_hours: float = 4.0
    instructor_name: str
    instructor_title: str
    instructor_avatar: Optional[str] = None
    modules_count: int = 5
    lessons_count: int = 15
    enrolled_count: int = 0
    certificate_available: bool = True
    acmg_alignment: Optional[str] = None
    thumbnail_url: Optional[str] = None
    user_enrolled: bool = False
    user_progress_percent: float = 0.0
    user_completed: bool = False


class CourseDetail(CourseSummary):
    chapters: List[ChapterSummary] = []
    syllabus_overview: Optional[str] = None
    prerequisites: Optional[str] = None
    target_audience: Optional[str] = None


class LessonDetail(BaseModel):
    id: str
    chapter_id: str
    course_id: str
    lesson_number: int
    title: str
    slug: str
    reading_time_min: int = 8
    difficulty: str = "Beginner"
    objectives: List[str] = []
    content_markdown: str
    key_takeaways: List[str] = []
    clinical_pearls: List[str] = []
    pmid_references: List[str] = []
    citations: List[Dict[str, Any]] = []
    
    # Video details
    video_title: Optional[str] = None
    video_url: Optional[str] = None
    video_duration_sec: int = 0
    video_chapters: List[Dict[str, Any]] = []
    transcript_en: Optional[str] = None
    transcript_hi: Optional[str] = None
    
    # Audio details
    audio_url: Optional[str] = None
    audio_duration_sec: int = 0
    audio_transcript: Optional[str] = None
    
    # Lab & animation details
    animation_type: Optional[str] = None
    virtual_lab_id: Optional[str] = None
    downloadable_materials: List[Dict[str, Any]] = []
    
    # User status
    is_completed: bool = False
    bookmarked: bool = False
    user_notes: Optional[str] = None


class CourseEnrollRequest(BaseModel):
    course_id: str


class LessonProgressUpdate(BaseModel):
    is_completed: Optional[bool] = None
    time_spent_sec: Optional[int] = None
    bookmarked: Optional[bool] = None
    notes: Optional[str] = None


class QuizQuestionItem(BaseModel):
    id: int
    question_text: str
    question_type: str = "multiple_choice"
    options: List[str]
    order_index: int = 1


class QuizDetail(BaseModel):
    id: str
    course_id: str
    chapter_id: str
    title: str
    description: Optional[str] = None
    passing_score_pct: float = 70.0
    time_limit_min: int = 15
    questions: List[QuizQuestionItem] = []
    is_mandatory: bool = True
    user_best_score: Optional[float] = None
    user_passed: bool = False


class QuizSubmitRequest(BaseModel):
    answers: Dict[Union[int, str], Any]  # {question_id: selected_option}
    time_spent_sec: Optional[int] = 0


class QuizSubmitResponse(BaseModel):
    quiz_id: str
    score_pct: float
    passed: bool
    total_questions: int
    correct_count: int
    passing_threshold_pct: float = 70.0
    explanations: List[Dict[str, Any]] = []  # [{question_id, correct, user_answer, correct_answer, explanation, clinical_rationale}]


class ExamSubmitRequest(BaseModel):
    answers: Dict[Union[int, str], Any]
    time_spent_sec: Optional[int] = 0


class ExamSubmitResponse(BaseModel):
    exam_id: str
    course_id: str
    score_pct: float
    passed: bool
    total_questions: int
    correct_count: int
    passing_threshold_pct: float = 70.0
    can_generate_certificate: bool
    certificate_id: Optional[str] = None
    explanations: List[Dict[str, Any]] = []


class CertificateResponse(BaseModel):
    certificate_id: str
    learner_name: str
    course_title: str
    course_category: str
    completion_date: str
    final_score_pct: float
    duration_hours: float
    issuer_name: str
    issuer_title: str
    signature_digest: str
    verification_url: str
    qr_code_data: str
    status: str = "valid"
    revocation_reason: Optional[str] = None


class CertificateVerificationResponse(BaseModel):
    certificate_id: str
    status: str  # "valid", "revoked", "invalid"
    learner_name: Optional[str] = None
    course_title: Optional[str] = None
    completion_date: Optional[str] = None
    issuer_name: Optional[str] = None
    verified: bool = True
    message: str


class VirtualLabItem(BaseModel):
    id: str
    code: str
    title: str
    category: str
    description: str
    learning_objectives: List[str] = []
    instructions: str
    simulation_type: str
    sample_data: Dict[str, Any] = {}
    is_completed: bool = False


class LabSubmitRequest(BaseModel):
    result_data: Dict[str, Any] = {}
    time_spent_sec: int = 0


class AcademyDashboardResponse(BaseModel):
    total_enrolled: int = 0
    in_progress_count: int = 0
    completed_count: int = 0
    certificates_count: int = 0
    total_learning_hours: float = 0.0
    average_score_pct: float = 0.0
    learning_streak_days: int = 1
    active_courses: List[CourseSummary] = []
    featured_courses: List[CourseSummary] = []
    certificates: List[CertificateResponse] = []
    virtual_labs: List[VirtualLabItem] = []


class AdminRevokeCertificateRequest(BaseModel):
    revocation_reason: str
    reviewer_name: str
