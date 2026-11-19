"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  ChevronRight,
  PlayCircle,
  FileText,
  ShieldCheck,
  Lock,
  ArrowRight,
  Download,
  Users,
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";
import { AcademyCourseDetail } from "@/types/academy";
import { sound } from "@/lib/sound";

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = String(params.courseId || "course-01-genetics-fundamentals");

  const [course, setCourse] = useState<AcademyCourseDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [enrolling, setEnrolling] = useState<boolean>(false);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      try {
        const data = await api.getAcademyCourse(courseId);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    sound.playClick();
    try {
      await api.enrollInAcademyCourse(course.id);
      sound.playSuccess();
      const updated = await api.getAcademyCourse(course.id);
      setCourse(updated);
    } catch (err) {
      console.error("Enrollment failed:", err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-teal-800">
          <GraduationCap className="w-10 h-10 animate-bounce" />
          <p className="text-sm font-semibold">Loading Genetics Course Syllabus...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Course Not Found</h2>
        <Link href="/academy" className="text-sm text-[#00837b] font-medium underline">
          Return to Academy Hub
        </Link>
      </div>
    );
  }

  const firstLessonId = course.chapters?.[0]?.lessons?.[0]?.id || "c1-ch1-l1";

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/academy" className="hover:text-[#00837b] transition-colors">
              Academy
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600 truncate max-w-[200px] md:max-w-md">{course.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              {course.code}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Course Header Banner */}
        <div className="bg-white border border-[#00837b]/15 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#00837b]/10 text-[#00837b] text-xs font-semibold px-3 py-1 rounded-full">
                {course.category}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                {course.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-[#00837b]" />
                {course.duration_hours} Estimated Hours
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-[#00837b]" />
                {course.lessons_count} Comprehensive Lessons
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-base text-gray-600 font-medium">{course.subtitle}</p>
            )}
            <p className="text-sm text-gray-700 leading-relaxed max-w-4xl">{course.description}</p>
          </div>

          {/* Instructor & Framework */}
          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00837b]/10 text-[#00837b] font-bold text-base flex items-center justify-center border border-[#00837b]/20">
                {course.instructor_name.charAt(3) || "I"}
              </div>
              <div>
                <p className="text-xs text-gray-500">Lead Course Instructor</p>
                <p className="text-sm font-bold text-gray-900">{course.instructor_name}</p>
                <p className="text-xs text-gray-600">{course.instructor_title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-teal-50/60 border border-teal-100 rounded-2xl p-4">
              <ShieldCheck className="w-6 h-6 text-[#00837b] flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-teal-900">Clinical Framework Alignment</p>
                <p className="text-xs text-teal-800">{course.acmg_alignment}</p>
              </div>
            </div>
          </div>

          {/* Actions & Progress */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 w-full sm:w-auto">
              <p className="text-xs text-gray-500 font-medium">Accredited Certificate Status</p>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-gray-800">
                  {course.status === "completed"
                    ? "Certificate Issued & Verified"
                    : "Certificate Available (Score ≥ 70% on Final Exam)"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {course.status === "completed" && course.certificate_id && (
                <Link
                  href={`/academy/certificates/${course.certificate_id}`}
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-all"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                </Link>
              )}

              {course.is_enrolled ? (
                <Link
                  href={`/academy/course/${course.id}/lesson/${firstLessonId}`}
                  onClick={() => sound.playClick()}
                  className="inline-flex items-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02]"
                >
                  <PlayCircle className="w-4 h-4" />
                  Continue Course
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  <GraduationCap className="w-4 h-4" />
                  {enrolling ? "Enrolling..." : "Enroll Free in Course"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Chapter Syllabus */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00837b]" />
              Detailed Course Syllabus & Curriculum
            </h2>
            <span className="text-xs text-gray-500">
              {course.chapters?.length || 5} Chapters · {course.lessons_count} Lessons
            </span>
          </div>

          <div className="space-y-4">
            {(course.chapters || []).map((ch, chIdx) => (
              <div
                key={ch.id || chIdx}
                className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="bg-gray-50/70 border-b border-gray-100 p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#00837b] uppercase tracking-wider">
                      Chapter {ch.chapter_number}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{ch.title}</h3>
                    {ch.description && (
                      <p className="text-xs text-gray-500">{ch.description}</p>
                    )}
                  </div>

                  <span className="text-xs text-gray-500 font-medium">
                    {ch.lessons?.length || 0} Lessons
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {(ch.lessons || []).map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/academy/course/${course.id}/lesson/${lesson.id}`}
                      onClick={() => sound.playClick()}
                      className="p-4 px-6 flex items-center justify-between hover:bg-teal-50/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                            lesson.is_completed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600 group-hover:bg-[#00837b]/10 group-hover:text-[#00837b]"
                          }`}
                        >
                          {lesson.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            lesson.lesson_number
                          )}
                        </div>
                        <div>
                          <p className="text-xs md:text-sm font-semibold text-gray-900 group-hover:text-[#00837b] transition-colors">
                            {lesson.title}
                          </p>
                          <span className="text-[11px] text-gray-400">
                            {lesson.reading_time_min} min study time
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00837b] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Exam Section */}
        <div className="bg-gradient-to-br from-[#112128] to-[#1c3845] rounded-3xl p-8 text-white space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Certification Milestone
              </span>
              <h3 className="text-xl md:text-2xl font-bold">Comprehensive Course Final Examination</h3>
              <p className="text-xs md:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
                Take the timed final assessment covering all chapter objectives. Passing threshold is 70%. Achieving a passing score automatically generates your official GeneWise AI Certificate of Completion with verifiable cryptographic signature.
              </p>
            </div>

            <Link
              href={`/academy/course/${course.id}/exam`}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 whitespace-nowrap"
            >
              <Award className="w-5 h-5 text-gray-900" />
              Take Final Examination
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
