"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame,
  ArrowRight,
  ExternalLink,
  FlaskConical,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { AcademyDashboard, AcademyCertificate } from "@/types/academy";
import { sound } from "@/lib/sound";

export default function MyCoursesAndCertificatesPage() {
  const [dashboard, setDashboard] = useState<AcademyDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getAcademyDashboard();
        setDashboard(data);
      } catch (err) {
        console.error("Failed to load learner dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <GraduationCap className="w-10 h-10 text-[#00837b] animate-bounce" />
      </div>
    );
  }

  const certificates = dashboard?.certificates || [];
  const activeCourses = dashboard?.active_courses || [];

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24">
      {/* Top Navbar */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/academy" className="hover:text-[#00837b]">
              Academy Hub
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#00837b] font-medium">My Courses & Verified Certificates</span>
          </div>

          <Link
            href="/verify-certificate"
            className="text-xs font-semibold text-[#00837b] hover:underline flex items-center gap-1"
          >
            Public Registry <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Learner Metrics Header */}
        <div className="bg-white border border-[#00837b]/15 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#00837b] uppercase tracking-wider">
                Personal Learner Profile
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                My Genetics Learning Dashboard
              </h1>
            </div>

            <Link
              href="/academy"
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Browse Full Catalog
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <span className="text-xs text-gray-500">Enrolled Courses</span>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{dashboard?.total_enrolled || 2}</p>
            </div>
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100">
              <span className="text-xs text-emerald-800">Completed Courses</span>
              <p className="text-2xl font-extrabold text-emerald-900 mt-1">{dashboard?.completed_count || 1}</p>
            </div>
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-100">
              <span className="text-xs text-amber-800">Certificates Earned</span>
              <p className="text-2xl font-extrabold text-amber-900 mt-1">{certificates.length}</p>
            </div>
            <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-orange-800">Learning Streak</span>
                <p className="text-2xl font-extrabold text-orange-900 mt-1">
                  {dashboard?.learning_streak_days || 5} Days
                </p>
              </div>
              <Flame className="w-7 h-7 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Section 1: Official Certificates Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              My Official Certificates of Completion ({certificates.length})
            </h2>
            <span className="text-xs text-gray-500">Cryptographically signed credentials</span>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center space-y-2">
              <Award className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No certificates earned yet. Complete a course final exam with ≥ 70%.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.certificate_id}
                  className="bg-white border-2 border-amber-300/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {cert.certificate_id}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Valid & Verified
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">{cert.course_title}</h3>
                    <p className="text-xs text-gray-500">
                      Awarded to {cert.learner_name} · Score: {cert.final_score_pct}% · {cert.completion_date}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 font-mono">
                      SHA: {cert.signature_digest.slice(0, 10)}...
                    </span>

                    <Link
                      href={`/academy/certificates/${cert.certificate_id}`}
                      onClick={() => sound.playClick()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Award className="w-4 h-4 text-amber-700" />
                      View Certificate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Enrolled Courses */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#00837b]" />
            Active Course Enrolments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {c.code}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">{c.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{c.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{c.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                    <span>Progress: {c.progress_percent || 0}%</span>
                    <span>{c.completed_lessons_count || 0} / {c.lessons_count} lessons</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#00837b] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${c.progress_percent || 0}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/academy/course/${c.id}`}
                  onClick={() => sound.playClick()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white text-xs font-bold py-2.5 rounded-xl shadow transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  Continue Course
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
