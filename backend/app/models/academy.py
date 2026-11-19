import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class CourseModel(Base):
    __tablename__ = "academy_courses"

    id = Column(String(100), primary_key=True, index=True)  # e.g. "course-01-genetics-fundamentals"
    code = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "GEN-101"
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    subtitle = Column(String(500), nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Fundamentals, Inheritance Models, etc.
    difficulty = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced, Applied
    duration_hours = Column(Float, default=4.0)
    instructor_name = Column(String(255), default="Dr. Elena Rostova, MS, CGC")
    instructor_title = Column(String(255), default="Lead Clinical Genomicist & ACMG Fellow")
    instructor_avatar = Column(String(500), default="/images/counselors/elena-rostova.jpg")
    modules_count = Column(Integer, default=5)
    lessons_count = Column(Integer, default=15)
    enrolled_count = Column(Integer, default=0)
    certificate_available = Column(Boolean, default=True)
    acmg_alignment = Column(String(255), default="ACMG Tier 1 & NSGC Core Curriculum")
    thumbnail_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True)
    order_index = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    chapters = relationship("CourseChapterModel", back_populates="course", cascade="all, delete-orphan", order_by="CourseChapterModel.order_index")
    lessons = relationship("CourseLessonModel", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("CourseEnrollmentModel", back_populates="course", cascade="all, delete-orphan")
    quizzes = relationship("ModuleQuizModel", back_populates="course", cascade="all, delete-orphan")
    certificates = relationship("CertificateModel", back_populates="course", cascade="all, delete-orphan")


class CourseChapterModel(Base):
    __tablename__ = "academy_chapters"

    id = Column(String(100), primary_key=True, index=True)  # e.g. "c1-ch1"
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("CourseModel", back_populates="chapters")
    lessons = relationship("CourseLessonModel", back_populates="chapter", cascade="all, delete-orphan", order_by="CourseLessonModel.order_index")
    quiz = relationship("ModuleQuizModel", back_populates="chapter", uselist=False)


class CourseLessonModel(Base):
    __tablename__ = "academy_lessons"

    id = Column(String(100), primary_key=True, index=True)  # e.g. "c1-ch1-l1"
    chapter_id = Column(String(100), ForeignKey("academy_chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), index=True, nullable=False)
    reading_time_min = Column(Integer, default=8)
    difficulty = Column(String(50), default="Beginner")
    
    # Pedagogical structured content
    objectives = Column(JSON, default=list)  # List of string learning objectives
    content_markdown = Column(Text, nullable=False)
    key_takeaways = Column(JSON, default=list)  # List of string takeaways
    clinical_pearls = Column(JSON, default=list)  # List of string clinical pearls
    pmid_references = Column(JSON, default=list)  # Scientific citations & ClinVar links
    
    # Multimedia attachments
    video_title = Column(String(255), nullable=True)
    video_url = Column(String(500), nullable=True)
    video_duration_sec = Column(Integer, default=0)
    video_chapters = Column(JSON, default=list)  # [{timestamp: "00:00", title: "Introduction"}]
    transcript_en = Column(Text, nullable=True)
    transcript_hi = Column(Text, nullable=True)
    subtitles = Column(JSON, default=dict)  # {"en": "vtt_url", "hi": "vtt_url"}
    
    # Audio lesson
    audio_url = Column(String(500), nullable=True)
    audio_duration_sec = Column(Integer, default=0)
    audio_transcript = Column(Text, nullable=True)
    
    # Interactive visual & lab linkage
    animation_type = Column(String(100), nullable=True)  # "dna_helix", "punnett_square", "karyotype", "pedigree"
    virtual_lab_id = Column(String(100), nullable=True)  # Reference to virtual lab
    downloadable_materials = Column(JSON, default=list)  # [{title, format, url, size}]
    
    order_index = Column(Integer, default=1)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("CourseModel", back_populates="lessons")
    chapter = relationship("CourseChapterModel", back_populates="lessons")


class CourseEnrollmentModel(Base):
    __tablename__ = "academy_course_enrollments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="active")  # "active", "completed", "dropped"
    progress_percent = Column(Float, default=0.0)
    completed_lessons_count = Column(Integer, default=0)
    passed_quizzes_count = Column(Integer, default=0)
    final_exam_passed = Column(Boolean, default=False)
    final_exam_score = Column(Float, nullable=True)
    last_lesson_id = Column(String(100), nullable=True)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_accessed_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    course = relationship("CourseModel", back_populates="enrollments")


class LessonProgressModel(Base):
    __tablename__ = "academy_lesson_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(String(100), ForeignKey("academy_lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False)
    time_spent_sec = Column(Integer, default=0)
    bookmarked = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class VirtualLabModel(Base):
    __tablename__ = "academy_virtual_labs"

    id = Column(String(100), primary_key=True, index=True)  # e.g. "lab-01-dna-structure"
    code = Column(String(50), unique=True, index=True, nullable=False)  # "LAB-DNA-01"
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    learning_objectives = Column(JSON, default=list)
    instructions = Column(Text, nullable=False)
    simulation_type = Column(String(100), nullable=False)  # "punnett", "pedigree", "dna_basepair", "karyotype", "variant"
    sample_data = Column(JSON, default=dict)
    order_index = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)


class LabAttemptModel(Base):
    __tablename__ = "academy_lab_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lab_id = Column(String(100), ForeignKey("academy_virtual_labs.id", ondelete="CASCADE"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False)
    result_data = Column(JSON, default=dict)
    time_spent_sec = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)


class ModuleQuizModel(Base):
    __tablename__ = "academy_module_quizzes"

    id = Column(String(100), primary_key=True, index=True)  # e.g. "quiz-c1-ch1"
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(String(100), ForeignKey("academy_chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    passing_score_pct = Column(Float, default=70.0)
    time_limit_min = Column(Integer, default=15)
    is_mandatory = Column(Boolean, default=True)

    course = relationship("CourseModel", back_populates="quizzes")
    chapter = relationship("CourseChapterModel", back_populates="quiz")
    questions = relationship("QuizQuestionModel", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestionModel.order_index")


class QuizQuestionModel(Base):
    __tablename__ = "academy_quiz_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quiz_id = Column(String(100), ForeignKey("academy_module_quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice")  # multiple_choice, true_false, multi_select, pedigree_case
    options = Column(JSON, nullable=False)  # ["Option A", "Option B", ...]
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    clinical_rationale = Column(Text, nullable=True)
    order_index = Column(Integer, default=1)

    quiz = relationship("ModuleQuizModel", back_populates="questions")


class QuizAttemptModel(Base):
    __tablename__ = "academy_quiz_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(String(100), ForeignKey("academy_module_quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    score_pct = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    answers = Column(JSON, default=dict)  # {question_id: selected_answer}
    attempt_number = Column(Integer, default=1)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)


class FinalExamModel(Base):
    __tablename__ = "academy_final_examinations"

    id = Column(String(100), primary_key=True, index=True)  # e.g. "exam-course-01"
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    question_count = Column(Integer, default=20)
    time_limit_min = Column(Integer, default=30)
    passing_score_pct = Column(Float, default=70.0)
    max_attempts = Column(Integer, default=3)
    questions_bank = Column(JSON, default=list)  # Comprehensive question pool


class ExamAttemptModel(Base):
    __tablename__ = "academy_exam_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(String(100), ForeignKey("academy_final_examinations.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    score_pct = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    total_questions = Column(Integer, default=20)
    correct_count = Column(Integer, default=0)
    answers = Column(JSON, default=dict)
    attempt_number = Column(Integer, default=1)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)


class CertificateModel(Base):
    __tablename__ = "academy_certificates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    certificate_id = Column(String(100), unique=True, index=True, nullable=False)  # "GW-CERT-2026-FBN1"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    learner_name = Column(String(255), nullable=False)
    course_title = Column(String(255), nullable=False)
    course_category = Column(String(100), nullable=False)
    completion_date = Column(String(50), nullable=False)
    final_score_pct = Column(Float, default=85.0)
    duration_hours = Column(Float, default=4.0)
    issuer_name = Column(String(255), default="GeneWise AI Learning Academy Board")
    issuer_title = Column(String(255), default="Board of Clinical Geneticists & Educational Governance")
    signature_digest = Column(String(255), nullable=False)  # Cryptographic SHA-256 HMAC
    verification_url = Column(String(500), nullable=False)
    qr_code_data = Column(String(500), nullable=False)
    status = Column(String(50), default="valid")  # "valid", "revoked", "invalid"
    revocation_reason = Column(Text, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("CourseModel", back_populates="certificates")


class CertificateRevocationModel(Base):
    __tablename__ = "academy_certificate_revocations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    certificate_id = Column(String(100), ForeignKey("academy_certificates.certificate_id", ondelete="CASCADE"), nullable=False, index=True)
    revoked_by = Column(String(255), nullable=False)
    revocation_reason = Column(Text, nullable=False)
    audit_hash = Column(String(255), nullable=False)
    revoked_at = Column(DateTime, default=datetime.datetime.utcnow)


class DownloadableMaterialModel(Base):
    __tablename__ = "academy_downloadable_materials"

    id = Column(String(100), primary_key=True, index=True)
    course_id = Column(String(100), ForeignKey("academy_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    format = Column(String(50), default="PDF")
    file_size_mb = Column(Float, default=1.2)
    file_url = Column(String(500), nullable=False)
    category = Column(String(100), default="Study Guide")  # Guide, Worksheet, Checklist, Infographic
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
