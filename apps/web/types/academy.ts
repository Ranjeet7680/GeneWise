// ==============================================================================
// GENEWISE AI — GENETICS LEARNING ACADEMY TYPES & INTERFACES
// ==============================================================================

export type AcademyCategory =
  | "Fundamentals"
  | "Inheritance Models"
  | "Applied Genomics"
  | "Laboratory Classifications"
  | "Pedigree Literacy"
  | "Genetic Counselling & Ethics";

export type AcademyDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface CitationItem {
  id?: string;
  source: string;
  pmid?: string;
  doi?: string;
  clinvar_id?: string;
  title: string;
  year?: number;
}

export interface VideoTimestamp {
  seconds: number;
  label: string;
}

export interface AcademyLessonSummary {
  id: string;
  lesson_number: number;
  title: string;
  slug: string;
  reading_time_min: number;
  is_completed?: boolean;
  order_index?: number;
}

export interface AcademyLessonDetail {
  id: string;
  chapter_id: string;
  course_id: string;
  lesson_number: number;
  title: string;
  slug: string;
  reading_time_min: number;
  objectives: string[];
  content_markdown: string;
  video_url?: string;
  video_duration_sec?: number;
  video_timestamps?: VideoTimestamp[];
  audio_url?: string;
  audio_duration_sec?: number;
  model_3d_identifier?: string;
  interactive_simulation_id?: string;
  key_takeaways: string[];
  clinical_pearls: string[];
  citations: CitationItem[];
  prev_lesson_id?: string;
  next_lesson_id?: string;
  is_completed?: boolean;
  user_time_spent_sec?: number;
  bookmarked?: boolean;
  user_notes?: string;
}

export interface AcademyChapterSummary {
  id: string;
  chapter_number: number;
  title: string;
  description?: string;
  lessons: AcademyLessonSummary[];
  quiz_id?: string;
  quiz_completed?: boolean;
}

export interface AcademyCourseSummary {
  id: string;
  code: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  category: AcademyCategory;
  difficulty: AcademyDifficulty;
  duration_hours: number;
  instructor_name: string;
  instructor_title: string;
  instructor_avatar?: string;
  modules_count: number;
  lessons_count: number;
  acmg_alignment: string;
  order_index?: number;
  is_enrolled?: boolean;
  progress_percent?: number;
  completed_lessons_count?: number;
  status?: "not_started" | "enrolled" | "in_progress" | "completed";
}

export interface AcademyCourseDetail extends AcademyCourseSummary {
  chapters: AcademyChapterSummary[];
  final_exam_passed?: boolean;
  final_exam_score?: number;
  certificate_id?: string;
}

export interface QuizQuestionItem {
  id: number;
  question_text: string;
  question_type?: string;
  options: string[];
  order_index?: number;
}

export interface ModuleQuizDetail {
  id: string;
  course_id: string;
  chapter_id: string;
  title: string;
  description?: string;
  passing_score_pct: number;
  time_limit_min: number;
  questions: QuizQuestionItem[];
  is_mandatory: boolean;
  user_best_score?: number;
  user_passed?: boolean;
}

export interface QuizExplanation {
  question_id: number;
  is_correct: boolean;
  user_answer?: string;
  correct_answer?: string;
  explanation?: string;
  clinical_rationale?: string;
}

export interface QuizSubmitResult {
  quiz_id: string;
  score_pct: number;
  passed: boolean;
  total_questions: number;
  correct_count: number;
  passing_threshold_pct: number;
  explanations: QuizExplanation[];
}

export interface ExamSubmitResult {
  exam_id: string;
  course_id: string;
  score_pct: number;
  passed: boolean;
  total_questions: number;
  correct_count: number;
  passing_threshold_pct: number;
  can_generate_certificate: boolean;
  certificate_id?: string;
  explanations: QuizExplanation[];
}

export interface AcademyCertificate {
  certificate_id: string;
  learner_name: string;
  course_title: string;
  course_category: string;
  completion_date: string;
  final_score_pct: number;
  duration_hours: number;
  issuer_name: string;
  issuer_title: string;
  signature_digest: string;
  verification_url: string;
  qr_code_data: string;
  status: "valid" | "revoked" | "expired";
  revocation_reason?: string;
}

export interface CertificateVerificationResult {
  certificate_id: string;
  status: "valid" | "revoked" | "invalid";
  learner_name?: string;
  course_title?: string;
  completion_date?: string;
  issuer_name?: string;
  verified: boolean;
  message: string;
}

export interface VirtualLab {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  learning_objectives: string[];
  instructions: string;
  simulation_type:
    | "dna_pairing"
    | "punnett"
    | "pedigree"
    | "karyotype"
    | "variant"
    | "testing_triage"
    | "risk_mapper"
    | "bayesian"
    | "prenatal"
    | "privacy_audit";
  sample_data?: Record<string, any>;
  is_completed?: boolean;
}

export interface AcademyDashboard {
  total_enrolled: number;
  in_progress_count: number;
  completed_count: number;
  certificates_count: number;
  total_learning_hours: number;
  average_score_pct: number;
  learning_streak_days: number;
  active_courses: AcademyCourseSummary[];
  featured_courses: AcademyCourseSummary[];
  certificates: AcademyCertificate[];
  virtual_labs: VirtualLab[];
}
