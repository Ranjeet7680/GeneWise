"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  BookOpen,
  Award,
  FlaskConical,
  Search,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  PlayCircle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Users,
  Compass,
  Pencil,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { AcademyCourseSummary, AcademyDashboard, AcademyCategory, AcademyDifficulty } from "@/types/academy";
import { sound } from "@/lib/sound";
import { useOptionalAuth } from "@/lib/auth";

function getInstructorInitials(name: string): string {
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, "").trim();
  const parts = clean.split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (clean[0] || "D").toUpperCase();
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Courses", value: "All" },
  { label: "Fundamentals", value: "Fundamentals" },
  { label: "Inheritance Models", value: "Inheritance Models" },
  { label: "Applied Genomics", value: "Applied Genomics" },
  { label: "Laboratory Classifications", value: "Laboratory Classifications" },
  { label: "Pedigree Literacy", value: "Pedigree Literacy" },
  { label: "Genetic Counselling & Ethics", value: "Genetic Counselling & Ethics" },
];

const DIFFICULTIES: { label: string; value: string }[] = [
  { label: "All Levels", value: "All" },
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
];

export default function AcademyHubPage() {
  const auth = useOptionalAuth();
  const [courses, setCourses] = useState<AcademyCourseSummary[]>([]);
  const [dashboard, setDashboard] = useState<AcademyDashboard | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editingLearnerName, setEditingLearnerName] = useState<boolean>(false);
  const [customNameInput, setCustomNameInput] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [dashRes, coursesRes] = await Promise.all([
          api.getAcademyDashboard(),
          api.getAcademyCourses(),
        ]);
        setDashboard(dashRes);
        setCourses(coursesRes);
      } catch (err) {
        console.error("Failed to load academy data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat =
        selectedCategory === "All" ||
        c.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchDiff =
        selectedDifficulty === "All" ||
        c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchDiff && matchSearch;
    });
  }, [courses, selectedCategory, selectedDifficulty, searchQuery]);

  const activeCourse = useMemo(() => {
    return courses.find((c) => c.status === "in_progress") || courses[0];
  }, [courses]);

  return (
    <div className="min-h-screen bg-[#f4fbfa] text-[#112128] pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-[#00837b]/10 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/dashboard" className="hover:text-[#00837b] transition-colors">
              Workspace
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#00837b] font-medium">Genetics Learning Academy</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/verify-certificate"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00837b] hover:text-[#00605a] bg-[#00837b]/10 hover:bg-[#00837b]/15 px-3 py-1.5 rounded-full transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verify Certificate
            </Link>
            <Link
              href="/academy/labs"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Virtual Labs (10)
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#112128] via-[#162e38] to-[#005f59] p-8 md:p-12 text-white shadow-xl">
          {/* Subtle DNA background texture */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-15 pointer-events-none overflow-hidden">
            <Image
              src="/images/dna-protein.jpg"
              alt="DNA illustration background"
              fill
              className="object-cover object-right"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#112128] via-[#112128]/70 to-transparent" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#00837b]/30 backdrop-blur-sm border border-teal-300/20 px-3 py-1 rounded-full text-xs font-semibold text-teal-200 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-teal-300" />
              GeneWise Clinical Genetics Curriculum v4.0
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Master Human Genomics, Pedigree Analysis & Clinical Classification
            </h1>

            <p className="text-sm md:text-base text-teal-100/90 leading-relaxed max-w-2xl">
              12 comprehensive medical-grade genetics courses, 60 chapters, 180 multimedia lessons, and 10 interactive virtual laboratories aligned with ACMG, NSGC, and ClinVar frameworks. Earn verified certificates of completion.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href={`/academy/course/${activeCourse?.id || "course-01-genetics-fundamentals"}`}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                <PlayCircle className="w-5 h-5 text-gray-900" />
                {activeCourse?.status === "in_progress" ? "Continue Learning" : "Start Course 01"}
              </Link>

              <Link
                href="/academy/my-courses"
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-xl border border-white/20 backdrop-blur-sm transition-all"
              >
                <Award className="w-5 h-5 text-teal-300" />
                My Certificates ({dashboard?.certificates_count || 1})
              </Link>
            </div>
          </div>

          {/* Floating Metrics Ribbons */}
          <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-teal-200">Enrolled Courses</span>
              <p className="text-2xl font-bold text-white mt-1">{dashboard?.total_enrolled || 2}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-teal-200">Completed</span>
              <p className="text-2xl font-bold text-emerald-300 mt-1">{dashboard?.completed_count || 1}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-teal-200">Certificates</span>
              <p className="text-2xl font-bold text-amber-300 mt-1">{dashboard?.certificates_count || 1}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-teal-200">Learning Hours</span>
              <p className="text-2xl font-bold text-white mt-1">{(dashboard?.total_learning_hours || 7.5).toFixed(1)}h</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-200">Streak Days</span>
                <p className="text-2xl font-bold text-orange-300 mt-1">{dashboard?.learning_streak_days || 5}</p>
              </div>
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-xs text-teal-200">Avg Exam Score</span>
              <p className="text-2xl font-bold text-teal-300 mt-1">{(dashboard?.average_score_pct || 94.5).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Continue Learning Active Hero Card (if enrolled) */}
        {activeCourse && (
          <div className="bg-white border border-[#00837b]/15 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#00837b]/10 text-[#00837b] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Resume Active Module
                </span>
                <span className="text-xs text-gray-500 font-mono">{activeCourse.code}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{activeCourse.title}</h3>
              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{activeCourse.description}</p>
              
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>Progress: {activeCourse.progress_percent || 0}% Complete</span>
                  <span>{activeCourse.completed_lessons_count || 0} of {activeCourse.lessons_count} lessons</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#00837b] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${activeCourse.progress_percent || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              href={`/academy/course/${activeCourse.id}/lesson/c1-ch1-l1`}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 bg-[#00837b] hover:bg-[#006e67] text-white px-6 py-3 rounded-xl font-semibold shadow transition-all hover:scale-105 whitespace-nowrap"
            >
              Resume Lesson
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Learner Profile & Credentials Section */}
        {(() => {
          const activeLearnerName = typeof window !== "undefined"
            ? localStorage.getItem("academy_custom_learner_name") || auth?.user?.full_name || "Priya Sharma"
            : auth?.user?.full_name || "Priya Sharma";
          return (
            <div className="bg-white border border-[#00837b]/20 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00837b] to-[#005f59] text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {activeLearnerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{activeLearnerName}</h3>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
                        {auth?.user?.role ? auth.user.role : "Level II Scholar"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {auth?.user?.email || "Enrolled Scholar"} · Clinical Genomics Education Board Credential Candidate
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingLearnerName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customNameInput}
                        onChange={(e) => setCustomNameInput(e.target.value)}
                        placeholder="Enter full name"
                        className="px-3 py-1.5 border border-[#00837b] rounded-xl text-xs font-semibold text-gray-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (customNameInput.trim()) {
                            localStorage.setItem("academy_custom_learner_name", customNameInput.trim());
                            sound.playSuccess();
                          }
                          setEditingLearnerName(false);
                        }}
                        className="px-3.5 py-1.5 bg-[#00837b] hover:bg-[#006e67] text-white rounded-xl text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingLearnerName(false)}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCustomNameInput(activeLearnerName);
                        setEditingLearnerName(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#00837b]" />
                      <span>Edit Profile Name</span>
                    </button>
                  )}

                  <Link
                    href="/settings/profile"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
                  >
                    <span>Full Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-xs">
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/60">
                  <span className="text-[10px] text-teal-800 font-bold block uppercase tracking-wider">Credential Status</span>
                  <span className="font-extrabold text-teal-950 mt-0.5 block">Verified Candidate</span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">Certificates</span>
                  <span className="font-extrabold text-emerald-950 mt-0.5 block">{dashboard?.certificates_count || 1} Issued (GW-CERT)</span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/60">
                  <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">Virtual Labs</span>
                  <span className="font-extrabold text-amber-950 mt-0.5 block">10 Interactive Simulations</span>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/60">
                  <span className="text-[10px] text-purple-800 font-bold block uppercase tracking-wider">Framework</span>
                  <span className="font-extrabold text-purple-950 mt-0.5 block">ACMG / NSGC 2026</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Filter and Search Bar */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by topic, gene loci, ACMG criteria, or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00837b] focus:border-transparent bg-gray-50/50"
              />
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => {
                    setSelectedDifficulty(diff.value);
                    sound.playPop();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedDifficulty === diff.value
                      ? "bg-[#112128] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-gray-100 pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  sound.playPop();
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? "bg-[#00837b] text-white shadow-sm"
                    : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Catalog Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#00837b]" />
              Curriculum Catalog ({filteredCourses.length} Courses)
            </h2>
            <span className="text-xs text-gray-500">Structured 3-Tier Accreditation Pathway</span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-semibold text-gray-700">No matching courses found</h3>
              <p className="text-xs text-gray-500">Try modifying your category filters or search keywords.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSearchQuery("");
                }}
                className="text-xs text-[#00837b] font-medium underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#00837b]/40"
                >
                  {/* Course Banner Cover Image */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900 border-b border-gray-100">
                    <img
                      src={`/images/courses/${course.id}.jpg`}
                      alt={course.title}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes(`${course.code}.jpg`)) {
                          target.src = `/images/courses/${course.code}.jpg`;
                        } else if (!target.src.includes("GEN-101.jpg")) {
                          target.src = "/images/courses/GEN-101.jpg";
                        }
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="text-[11px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/20">
                        {course.code}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
                          course.difficulty === "Beginner"
                            ? "bg-emerald-500/90 text-white"
                            : course.difficulty === "Intermediate"
                            ? "bg-amber-500/90 text-white"
                            : "bg-purple-500/90 text-white"
                        }`}
                      >
                        {course.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Title & Subtitle */}
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#00837b] transition-colors leading-snug">
                        {course.title}
                      </h3>
                      {course.subtitle && (
                        <p className="text-xs text-gray-500 line-clamp-1">{course.subtitle}</p>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Framework Alignment */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00837b]" />
                      <span className="truncate">{course.acmg_alignment}</span>
                    </div>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2.5 pt-1">
                      {course.instructor_avatar ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#00837b]/30 shadow-2xs flex-shrink-0">
                          <Image
                            src={course.instructor_avatar}
                            alt={course.instructor_name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00837b]/20 to-[#00837b]/10 text-[#00837b] font-bold text-xs flex items-center justify-center border border-[#00837b]/30 shadow-2xs flex-shrink-0">
                          {getInstructorInitials(course.instructor_name)}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-900 truncate">{course.instructor_name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{course.instructor_title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Stats & Action */}
                  <div className="bg-gray-50/70 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration_hours}h
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.lessons_count} lessons
                      </span>
                    </div>

                    <Link
                      href={`/academy/course/${course.id}`}
                      onClick={() => sound.playClick()}
                      className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                        course.status === "completed"
                          ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                          : course.status === "in_progress"
                          ? "bg-[#00837b] text-white hover:bg-[#006e67] shadow"
                          : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {course.status === "completed"
                        ? "Completed"
                        : course.status === "in_progress"
                        ? "Continue"
                        : "View Syllabus"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statutory Educational Notice */}
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Statutory Clinical & Educational Transparency
          </div>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            The GeneWise AI Genetics Learning Academy certificates represent educational completion of curated genomics coursework. These certificates do NOT constitute a medical license, board-certified genetic counseling credential (ABGC/ACMG), or accredited university degree. Clinical diagnostic tests and reproductive decisions should always be reviewed with licensed medical geneticists or certified genetic counselors.
          </p>
        </div>
      </div>
    </div>
  );
}
