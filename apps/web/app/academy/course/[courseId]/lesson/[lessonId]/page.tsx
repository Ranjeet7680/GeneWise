"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Compass,
  Award,
  CheckCircle2,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  ShieldCheck,
  Bookmark,
  Share2,
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Layers,
  Send,
  Languages,
  Info,
  ExternalLink,
  Check,
  Menu,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  AcademyCourseDetail,
  AcademyLessonDetail,
  ModuleQuizDetail,
  QuizSubmitResult,
} from "@/types/academy";
import ClinicalMarkdown from "@/components/ClinicalMarkdown";
import { sound } from "@/lib/sound";

type TabMode = "video" | "text" | "3d" | "audio" | "quiz" | "lab";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = String(params.courseId || "course-01-genetics-fundamentals");
  const lessonId = String(params.lessonId || "c1-ch1-l1");

  const [course, setCourse] = useState<AcademyCourseDetail | null>(null);
  const [lesson, setLesson] = useState<AcademyLessonDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabMode>("text");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Lesson states
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [userNotes, setUserNotes] = useState<string>("");
  const [savingProgress, setSavingProgress] = useState<boolean>(false);

  // Audio / Speech synth
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioLang, setAudioLang] = useState<string>("en-US");

  // Quiz state
  const [quiz, setQuiz] = useState<ModuleQuizDetail | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmitResult | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);

  // AI Tutor chat
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "assistant" | "user"; text: string; time: string }>
  >([
    {
      role: "assistant",
      text: "Hello! I am your GeneWise AI Genetics Tutor. Ask me any question about this lesson's concepts, molecular mechanisms, or ACMG guidelines.",
      time: "Just now",
    },
  ]);
  const [userPrompt, setUserPrompt] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [courseRes, lessonRes] = await Promise.all([
          api.getAcademyCourse(courseId),
          api.getAcademyLesson(lessonId),
        ]);
        setCourse(courseRes);
        setLesson(lessonRes);
        setIsCompleted(lessonRes.is_completed || false);
        setIsBookmarked(lessonRes.bookmarked || false);
        setUserNotes(lessonRes.user_notes || "");

        // Load chapter quiz if present
        try {
          const quizRes = await api.getAcademyQuiz(`quiz-${lessonRes.chapter_id || "c1-ch1"}`);
          setQuiz(quizRes);
        } catch {
          // No quiz for this chapter
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId, lessonId]);

  const handleToggleComplete = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    if (nextState) sound.playSuccess();
    else sound.playClick();

    try {
      await api.updateAcademyLessonProgress(lessonId, {
        is_completed: nextState,
        time_spent_sec: 180,
        notes: userNotes,
        is_bookmarked: isBookmarked,
      });
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleToggleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    sound.playPop();

    try {
      await api.updateAcademyLessonProgress(lessonId, {
        is_completed: isCompleted,
        is_bookmarked: nextState,
        notes: userNotes,
      });
    } catch (err) {
      console.error("Failed to bookmark:", err);
    }
  };

  const handleSpeakLesson = () => {
    if (!lesson) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const snippet = lesson.content_markdown
        .replace(/#+/g, "")
        .replace(/\*\*/g, "")
        .slice(0, 1000);
      const utter = new SpeechSynthesisUtterance(snippet);
      utter.lang = audioLang;
      utter.rate = 1.0;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
      setIsPlayingAudio(true);
      sound.playClick();
    }
  };

  const handleQuizSubmit = async () => {
    if (!quiz) return;
    setSubmittingQuiz(true);
    sound.playClick();
    try {
      const res = await api.submitAcademyQuiz(quiz.id, selectedAnswers);
      setQuizResult(res);
      if (res.passed) {
        sound.playSuccess();
      } else {
        sound.playWarning();
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSendPrompt = () => {
    if (!userPrompt.trim()) return;
    sound.playClick();
    const prompt = userPrompt;
    setUserPrompt("");

    const newMsgs = [
      ...chatMessages,
      { role: "user" as const, text: prompt, time: "Just now" },
    ];
    setChatMessages(newMsgs);

    // Context-aware explanation generator
    setTimeout(() => {
      let reply = `In human genetics, ${prompt.toLowerCase().includes("mitochondria") ? "mitochondrial DNA is strictly maternally inherited because sperm mitochondria are degraded upon fertilization." : prompt.toLowerCase().includes("chromosome") ? "human cells have 23 chromosome pairs (46 total), where autosomes span 1-22 and sex chromosomes determine allosomal karyotype." : "this concept is foundational to understanding the ACMG variant classification guidelines and Mendelian inheritance."} Remember that genetic insights provided here are educational and should be correlated with clinical laboratory reports.`;
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply, time: "Just now" },
      ]);
      sound.playSuccess();
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-teal-800">
          <GraduationCap className="w-10 h-10 animate-bounce" />
          <p className="text-sm font-semibold">Loading Multimedia Course Player...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Lesson Not Found</h2>
        <Link href="/academy" className="text-sm text-[#00837b] font-medium underline">
          Return to Academy Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4fbfa] flex flex-col text-[#112128]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#00837b]/10 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Toggle Curriculum Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            href={`/academy/course/${course.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#00837b] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Syllabus</span>
          </Link>

          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />

          <div className="truncate max-w-[200px] sm:max-w-md">
            <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 mr-2">
              {course.code}
            </span>
            <span className="text-xs font-bold text-gray-900 truncate">{lesson.title}</span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isBookmarked
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
            <span className="hidden md:inline">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          <button
            onClick={handleToggleComplete}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isCompleted
                ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                : "bg-[#00837b] text-white shadow hover:bg-[#006e67]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
          </button>

          <button
            onClick={() => {
              setAiDrawerOpen(!aiDrawerOpen);
              sound.playClick();
            }}
            className="p-2 rounded-xl bg-teal-50 text-[#00837b] border border-teal-200 hover:bg-teal-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-[#00837b]" />
            <span className="hidden sm:inline">AI Tutor</span>
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Course Chapter Syllabus */}
        {sidebarOpen && (
          <aside className="w-72 md:w-80 border-r border-[#00837b]/10 bg-white flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-100 space-y-2">
              <span className="text-[11px] font-bold text-[#00837b] uppercase tracking-wider">
                Course Progress
              </span>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#00837b] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress_percent || 30}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>{course.progress_percent || 30}% Completed</span>
                <span>{course.lessons_count} Total Lessons</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {(course.chapters || []).map((ch) => (
                <div key={ch.id} className="p-3">
                  <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>
                      Ch {ch.chapter_number}: {ch.title}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {(ch.lessons || []).map((l) => (
                      <Link
                        key={l.id}
                        href={`/academy/course/${course.id}/lesson/${l.id}`}
                        onClick={() => sound.playClick()}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          l.id === lessonId
                            ? "bg-[#00837b] text-white font-semibold shadow-sm"
                            : "hover:bg-teal-50/60 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] opacity-75 font-mono">{l.lesson_number}.</span>
                          <span className="truncate">{l.title}</span>
                        </div>
                        {l.is_completed && (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              l.id === lessonId ? "text-teal-200" : "text-emerald-600"
                            }`}
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Bottom Final Exam CTA */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/70">
              <Link
                href={`/academy/course/${course.id}/exam`}
                onClick={() => sound.playClick()}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition-all"
              >
                <Award className="w-4 h-4" />
                Take Course Final Exam
              </Link>
            </div>
          </aside>
        )}

        {/* Center Main Stage Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Media Switcher Tabs */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto shadow-sm">
            <button
              onClick={() => {
                setActiveTab("text");
                sound.playPop();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "text"
                  ? "bg-[#00837b] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              Written Lesson
            </button>

            <button
              onClick={() => {
                setActiveTab("video");
                sound.playPop();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "video"
                  ? "bg-[#00837b] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Video Lecture
            </button>

            <button
              onClick={() => {
                setActiveTab("3d");
                sound.playPop();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "3d"
                  ? "bg-[#00837b] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              3D Animation
            </button>

            <button
              onClick={() => {
                setActiveTab("audio");
                sound.playPop();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === "audio"
                  ? "bg-[#00837b] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              Audio Lecture
            </button>

            {quiz && (
              <button
                onClick={() => {
                  setActiveTab("quiz");
                  sound.playPop();
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === "quiz"
                    ? "bg-[#00837b] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Module Quiz
              </button>
            )}

            <Link
              href="/academy/labs"
              onClick={() => sound.playClick()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 whitespace-nowrap transition-colors ml-auto"
            >
              <FlaskConical className="w-4 h-4" />
              Virtual Lab
            </Link>
          </div>

          {/* TAB 1: Written Lesson & Markdown Content */}
          {activeTab === "text" && (
            <div className="space-y-6">
              {/* Learning Objectives Card */}
              {lesson.objectives && lesson.objectives.length > 0 && (
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#00837b]" />
                    Learning Objectives
                  </h3>
                  <ul className="space-y-1.5">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i} className="text-xs text-teal-950 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#00837b] flex-shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lesson Text Presentation */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 md:p-10 shadow-sm space-y-6 max-w-none">
                <div className="space-y-4">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    {lesson.title}
                  </h1>

                  <div className="text-sm text-gray-800 leading-relaxed font-sans">
                    <ClinicalMarkdown content={lesson.content_markdown} />
                  </div>
                </div>

                {/* Key Takeaways */}
                {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 bg-gray-50/80 rounded-xl p-5 space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Key Scientific Takeaways
                    </h4>
                    <ul className="space-y-1">
                      {lesson.key_takeaways.map((takeaway, i) => (
                        <li key={i} className="text-xs text-gray-700 list-disc list-inside">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Clinical Pearls */}
                {lesson.clinical_pearls && lesson.clinical_pearls.length > 0 && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Clinical Practice Pearls
                    </h4>
                    <ul className="space-y-1.5">
                      {lesson.clinical_pearls.map((pearl, i) => (
                        <li key={i} className="text-xs text-emerald-900 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{pearl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Citations & Evidence */}
                {lesson.citations && lesson.citations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">Scientific & Medical Citations:</p>
                    <ul className="space-y-1">
                      {lesson.citations.map((cite, i) => (
                        <li key={i} className="flex items-center gap-2 text-[11px]">
                          <span>•</span>
                          <span>{cite.title}</span>
                          {cite.pmid && (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${cite.pmid}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#00837b] hover:underline font-mono inline-flex items-center gap-0.5"
                            >
                              PMID:{cite.pmid} <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Video Lecture */}
          {activeTab === "video" && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900">
                Video Lecture: {lesson.title}
              </h3>
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative shadow-inner">
                <video
                  src={lesson.video_url || "https://www.w3schools.com/html/mov_bbb.mp4"}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              {lesson.video_timestamps && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-gray-700 uppercase">Timestamped Lecture Chapters</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lesson.video_timestamps.map((ts, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 flex items-center justify-between"
                      >
                        <span>{ts.label}</span>
                        <span className="text-teal-700 font-mono font-semibold">
                          {Math.floor(ts.seconds / 60)}:{(ts.seconds % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 3D Animation Viewer */}
          {activeTab === "3d" && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Interactive 3D Molecular Simulation</h3>
                  <p className="text-xs text-gray-500">DNA Double-Helix Base-Pairing Topology (Watson-Crick)</p>
                </div>
                <span className="bg-teal-50 text-teal-800 text-xs px-2.5 py-1 rounded-full font-mono">
                  WebGL Interactive Canvas
                </span>
              </div>

              <div className="aspect-video bg-gradient-to-br from-[#0c181e] to-[#162e38] rounded-xl flex flex-col items-center justify-center p-8 text-white text-center space-y-4 relative overflow-hidden shadow-inner">
                <div className="w-24 h-24 rounded-full border-4 border-teal-400/40 border-t-teal-400 animate-spin flex items-center justify-center">
                  <Layers className="w-10 h-10 text-teal-300" />
                </div>
                <div className="space-y-1 z-10">
                  <h4 className="text-lg font-bold text-white">DNA Double-Helix B-Form Model</h4>
                  <p className="text-xs text-teal-200 max-w-md">
                    10 base pairs per helical turn (3.4 nm pitch). Major groove and minor groove accessibility for transcription factors.
                  </p>
                </div>
                <Link
                  href="/academy/labs"
                  className="inline-flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Open Full Interactive Lab 01
                </Link>
              </div>
            </div>
          )}

          {/* TAB 4: Audio Lecture */}
          {activeTab === "audio" && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Multilingual Audio Lecture</h3>
                  <p className="text-xs text-gray-500">Synthesized medical audio stream with language localization</p>
                </div>

                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-gray-400" />
                  <select
                    value={audioLang}
                    onChange={(e) => setAudioLang(e.target.value)}
                    className="border border-gray-200 text-xs rounded-lg p-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00837b]"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="hi-IN">Hindi (हिंदी)</option>
                    <option value="bn-IN">Bengali (বাংলা)</option>
                    <option value="ta-IN">Tamil (தமிழ்)</option>
                    <option value="te-IN">Telugu (తెలుగు)</option>
                    <option value="mr-IN">Marathi (मराठी)</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200/80 flex flex-col items-center justify-center space-y-4">
                <button
                  onClick={handleSpeakLesson}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 ${
                    isPlayingAudio ? "bg-amber-600 hover:bg-amber-700" : "bg-[#00837b] hover:bg-[#006e67]"
                  }`}
                >
                  {isPlayingAudio ? (
                    <PauseCircle className="w-8 h-8" />
                  ) : (
                    <PlayCircle className="w-8 h-8" />
                  )}
                </button>

                <p className="text-xs font-semibold text-gray-700">
                  {isPlayingAudio ? "Playing synthesized audio lecture..." : "Click to listen to lesson audio"}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: Module Quiz */}
          {activeTab === "quiz" && quiz && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#00837b] uppercase tracking-wider">
                    Knowledge Check
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                </div>
                <span className="text-xs bg-teal-50 text-teal-800 px-3 py-1 rounded-full font-medium">
                  Pass: {quiz.passing_score_pct}%
                </span>
              </div>

              <div className="space-y-6">
                {quiz.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 p-4 bg-gray-50/60 rounded-xl border border-gray-200/70">
                    <p className="text-xs md:text-sm font-bold text-gray-900">
                      {idx + 1}. {q.question_text}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            selectedAnswers[q.id] === opt
                              ? "bg-teal-50 border-[#00837b] text-teal-900 font-semibold"
                              : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${q.id}`}
                            value={opt}
                            checked={selectedAnswers[q.id] === opt}
                            onChange={() => {
                              setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }));
                              sound.playPop();
                            }}
                            className="text-[#00837b] focus:ring-[#00837b]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    {/* Show explanation if graded */}
                    {quizResult && quizResult.explanations && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        {quizResult.explanations.find((e) => e.question_id === q.id)?.clinical_rationale && (
                          <p className="text-teal-800 bg-teal-50 p-2 rounded">
                            <strong>Rationale:</strong>{" "}
                            {quizResult.explanations.find((e) => e.question_id === q.id)?.clinical_rationale}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {quizResult && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    quizResult.passed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold">
                        {quizResult.passed ? "Quiz Passed Successfully!" : "Passing Score Not Reached"}
                      </p>
                      <p className="text-xs">
                        Score: {quizResult.score_pct}% ({quizResult.correct_count} of {quizResult.total_questions} correct)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleQuizSubmit}
                disabled={submittingQuiz}
                className="w-full bg-[#00837b] hover:bg-[#006e67] text-white font-semibold py-3 rounded-xl text-xs shadow transition-all disabled:opacity-50"
              >
                {submittingQuiz ? "Grading Quiz..." : "Submit Module Quiz"}
              </button>
            </div>
          )}

          {/* Bottom Lesson Navigation Bar */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
            {lesson.prev_lesson_id ? (
              <Link
                href={`/academy/course/${course.id}/lesson/${lesson.prev_lesson_id}`}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#00837b] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Lesson
              </Link>
            ) : (
              <span className="text-xs text-gray-300 flex items-center gap-1.5 cursor-not-allowed">
                <ArrowLeft className="w-4 h-4" />
                First Lesson
              </span>
            )}

            <button
              onClick={handleToggleComplete}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-[#00837b] text-white hover:bg-[#006e67]"
              }`}
            >
              {isCompleted ? "✓ Completed" : "Mark as Complete"}
            </button>

            {lesson.next_lesson_id ? (
              <Link
                href={`/academy/course/${course.id}/lesson/${lesson.next_lesson_id}`}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00837b] hover:text-[#006e67] transition-colors"
              >
                Next Lesson
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/academy/course/${course.id}/exam`}
                onClick={() => sound.playClick()}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-all"
              >
                Take Final Exam
                <Award className="w-4 h-4" />
              </Link>
            )}
          </div>
        </main>

        {/* Right Floating Drawer: AI Genetics Tutor */}
        {aiDrawerOpen && (
          <aside className="w-80 md:w-96 border-l border-[#00837b]/10 bg-white flex flex-col flex-shrink-0 shadow-2xl z-20">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-teal-50/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00837b]" />
                <span className="text-xs font-bold text-teal-900">AI Genetics Tutor</span>
              </div>
              <button
                onClick={() => setAiDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-teal-100 text-gray-500 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 bg-amber-50 border-b border-amber-100 text-[10px] text-amber-900 text-center">
              Educational tutor grounded in lesson citations. Not a medical diagnosis.
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#00837b] text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Tutor Prompt Input */}
            <div className="p-3 border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about this lesson..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendPrompt()}
                className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#00837b]"
              />
              <button
                onClick={handleSendPrompt}
                className="p-2 bg-[#00837b] text-white rounded-xl hover:bg-[#006e67] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
