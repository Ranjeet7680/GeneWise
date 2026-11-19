"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { AcademyCourseDetail, ExamSubmitResult } from "@/types/academy";
import { sound } from "@/lib/sound";

export default function CourseExamPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = String(params.courseId || "course-01-genetics-fundamentals");

  const [course, setCourse] = useState<AcademyCourseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<ExamSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Exam questions
  const examQuestions = [
    {
      id: 1,
      text: "What is the approximate nucleotide size of the human nuclear haploid genome?",
      options: [
        "3.2 billion base pairs",
        "16,569 base pairs",
        "46 million base pairs",
        "300,000 base pairs",
      ],
      correctAnswer: "3.2 billion base pairs",
    },
    {
      id: 2,
      text: "In mitochondrial genomics, how is mitochondrial DNA transmitted to subsequent generations?",
      options: [
        "Strictly maternal inheritance",
        "Biparental equal inheritance",
        "Paternal Y-linked transmission",
        "X-inactivation skewing",
      ],
      correctAnswer: "Strictly maternal inheritance",
    },
    {
      id: 3,
      text: "According to ACMG/AMP guidelines, what is the clinical classification of a newly observed variant with insufficient or contradictory evidence?",
      options: [
        "Variant of Uncertain Significance (VUS)",
        "Pathogenic Class 5",
        "Benign Polymorphism",
        "Incomplete Penetrance Marker",
      ],
      correctAnswer: "Variant of Uncertain Significance (VUS)",
    },
    {
      id: 4,
      text: "In an autosomal recessive carrier couple (Aa x Aa), what is the statistical recurrence risk for an affected child in each pregnancy?",
      options: ["25% (1 in 4)", "50% (1 in 2)", "75% (3 in 4)", "0% for females"],
      correctAnswer: "25% (1 in 4)",
    },
    {
      id: 5,
      text: "What does the Genetic Information Nondiscrimination Act (GINA) protect individuals against?",
      options: [
        "Discrimination in health insurance and employment based on genetic information",
        "Life insurance premium denials",
        "Long-term care insurance denial",
        "Military service enlistment restrictions",
      ],
      correctAnswer: "Discrimination in health insurance and employment based on genetic information",
    },
  ];

  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      try {
        const data = await api.getAcademyCourse(courseId);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  // Timer countdown
  useEffect(() => {
    if (examSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [examSubmitted]);

  const handleSubmit = async () => {
    setSubmitting(true);
    sound.playClick();

    // Accurately compute user score based on answers
    const total = examQuestions.length;
    let correct = 0;
    const explanationsList: any[] = [];

    examQuestions.forEach((q) => {
      const userAns = answers[q.id];
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) correct++;
      explanationsList.push({
        question_id: q.id,
        is_correct: isCorrect,
        user_answer: userAns || "No answer selected",
        correct_answer: q.correctAnswer,
        explanation: `Correct answer: ${q.correctAnswer}`,
      });
    });

    const computedScorePct = Math.round((correct / total) * 100);
    const isPassed = computedScorePct >= 70;

    let resultPayload: ExamSubmitResult = {
      exam_id: `exam-${courseId}`,
      course_id: String(courseId),
      score_pct: computedScorePct,
      passed: isPassed,
      total_questions: total,
      correct_count: correct,
      passing_threshold_pct: 70.0,
      can_generate_certificate: isPassed,
      certificate_id: isPassed ? "GW-CERT-2026-MENDEL02" : undefined,
      explanations: explanationsList,
    };

    try {
      const res = await api.submitAcademyExam(courseId, answers, 1200 - timeLeft);
      if (res && typeof res.score_pct === "number") {
        resultPayload = {
          ...resultPayload,
          ...res,
          score_pct: res.score_pct,
          passed: res.passed ?? isPassed,
          correct_count: res.correct_count ?? correct,
          total_questions: res.total_questions ?? total,
        };
      }
    } catch (err) {
      console.warn("Client fallback evaluation for exam:", err);
    } finally {
      setExamResult(resultPayload);
      setExamSubmitted(true);
      setSubmitting(false);
      if (resultPayload.passed) {
        sound.playSuccess();
      } else {
        sound.playWarning();
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <GraduationCap className="w-10 h-10 text-[#00837b] animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24">
      {/* Top Navbar */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href={`/academy/course/${courseId}`} className="hover:text-[#00837b]">
              Course Syllabus
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00837b] font-medium">Final Examination</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>Time Left: {minutes}:{seconds}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Exam Header */}
        <div className="bg-white border border-[#00837b]/15 rounded-3xl p-6 md:p-8 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              Certification Exam
            </span>
            <span className="text-xs text-gray-500 font-mono">{course?.code || "GEN-101"}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Comprehensive Final Examination: {course?.title}
          </h1>

          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Answer all 5 questions covering fundamental human genome architecture, inheritance models, and ACMG standards. Passing threshold is 70%. Achieving 70% or higher generates your cryptographic Certificate of Completion.
          </p>
        </div>

        {/* Results Banner (If Submitted) */}
        {examSubmitted && examResult && (
          <div
            className={`rounded-3xl p-8 border shadow-lg space-y-4 ${
              examResult.passed
                ? "bg-gradient-to-br from-emerald-900 to-[#005f59] text-white border-emerald-400/40"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {examResult.passed ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-300 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-rose-600 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {examResult.passed ? "Congratulations! Exam Passed" : "Passing Threshold Not Reached"}
                  </h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    Final Score: {examResult.score_pct}% ({examResult.correct_count} of {examResult.total_questions} correct) · Passing Threshold: 70%
                  </p>
                </div>
              </div>

              {examResult.passed && examResult.certificate_id ? (
                <Link
                  href={`/academy/certificates/${examResult.certificate_id}`}
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 text-sm"
                >
                  <Award className="w-5 h-5 text-gray-950" />
                  View & Download Official Certificate
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setExamSubmitted(false);
                    setExamResult(null);
                    setTimeLeft(1200);
                    sound.playClick();
                  }}
                  className="inline-flex items-center gap-2 bg-white text-rose-800 border border-rose-300 hover:bg-rose-100 font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all text-xs"
                >
                  <RotateCcw className="w-4 h-4 text-rose-700" />
                  Retake Examination
                </button>
              )}
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {examQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-gray-400 font-mono">Question {idx + 1} of 5</span>
              </div>

              <h4 className="text-sm md:text-base font-bold text-gray-900 leading-snug">
                {q.text}
              </h4>

              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => (
                  <label
                    key={optIdx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      answers[q.id] === opt
                        ? "bg-teal-50/80 border-[#00837b] text-teal-950 font-semibold shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`exam-q-${q.id}`}
                      value={opt}
                      disabled={examSubmitted}
                      checked={answers[q.id] === opt}
                      onChange={() => {
                        setAnswers((prev) => ({ ...prev, [q.id]: opt }));
                        sound.playPop();
                      }}
                      className="text-[#00837b] focus:ring-[#00837b]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        {!examSubmitted && (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {Object.keys(answers).length} of 5 questions answered
            </span>

            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length < 5}
              className="inline-flex items-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Award className="w-5 h-5" />
              {submitting ? "Submitting & Grading..." : "Submit Final Examination"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
