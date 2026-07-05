"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { mockCourses, mockProfiles } from "@/lib/mockDb";

interface FacultyComment {
  id: string;
  authorName: string;
  authorRole: "faculty";
  content: string;
  createdAt: string;
  isVerifiedFaculty: boolean;
}

interface FacultyDoubt {
  id: string;
  title: string;
  content: string;
  courseCode: string;
  authorName: string;
  status: "unresolved" | "resolved";
  comments: FacultyComment[];
}

export default function FacultyCommandWorkspace() {
  const router = useRouter();
  
  // Profile info
  const faculty = mockProfiles.find((p) => p.role === "faculty") || {
    name: "Dr. Saroj Raghuvanshi",
    email: "saroj.raghuvanshi@ipsacademy.org",
    department: "Applied Chemistry"
  };

  // ----------------------------------------------------
  // 1. FORUM FEED STATE & ACTIONS
  // ----------------------------------------------------
  const [doubts, setDoubts] = useState<FacultyDoubt[]>([
    {
      id: "fd-1",
      title: "Preparation topics for Chemistry MST-2 polymers section",
      content: "Can someone share what kinds of polymer questions are expected in MST-2? Are reactions for synthesis of Bakelite and Nylon-6,6 frequently asked, or is it mostly theoretical classification?",
      courseCode: "BT-105",
      authorName: "Sumit Sharma",
      status: "unresolved",
      comments: []
    },
    {
      id: "fd-2",
      title: "Sign conventions in AC Circuits nodal analysis",
      content: "I am consistently getting wrong signs when doing mesh analysis on inductive/capacitive impedances. Do we treat phasor voltages as polar or rectangular coordinates while formulating the KVL loop equations?",
      courseCode: "BT-104",
      authorName: "Jay Rajput",
      status: "unresolved",
      comments: []
    }
  ]);

  const [selectedDoubtId, setSelectedDoubtId] = useState<string>("fd-1");
  const [replyText, setReplyText] = useState("");

  const handlePostResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newComment: FacultyComment = {
      id: `fc-${Date.now()}`,
      authorName: faculty.name,
      authorRole: "faculty",
      content: replyText,
      createdAt: new Date().toISOString(),
      isVerifiedFaculty: true
    };

    setDoubts(prevDoubts => 
      prevDoubts.map(d => 
        d.id === selectedDoubtId 
          ? {
              ...d,
              status: "resolved",
              comments: [...d.comments, newComment]
            }
          : d
      )
    );

    setReplyText("");
  };

  // ----------------------------------------------------
  // 2. MANAGEMENT ACTIONS LEDGER STATE
  // ----------------------------------------------------
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<"attendance" | "marks" | null>(null);
  
  // Ledger forms inputs
  const [mstMarks, setMstMarks] = useState({ studentName: "Jay Rajput", score: "18" });
  const [attendanceSheet, setAttendanceSheet] = useState({
    jayPresent: true,
    sumitPresent: true,
    poojaPresent: false
  });
  
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(`Internal marks successfully registered for ${mstMarks.studentName} in ${activeCourse}!`);
    setTimeout(() => {
      setSuccessMessage("");
      setActiveAction(null);
      setActiveCourse(null);
    }, 3000);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(`Attendance sheet submitted successfully for ${activeCourse}!`);
    setTimeout(() => {
      setSuccessMessage("");
      setActiveAction(null);
      setActiveCourse(null);
    }, 3000);
  };

  // ----------------------------------------------------
  // 3. ACTIVE LECTURE DISPATCHER STATE
  // ----------------------------------------------------
  const [lectureSchedule, setLectureSchedule] = useState({
    id: "lec-1",
    subject: "Applied Chemistry",
    time: "11:15 AM",
    status: "scheduled" as "scheduled" | "rescheduled" | "cancelled"
  });

  const [rescheduleToast, setRescheduleToast] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelAlert, setCancelAlert] = useState("");

  const handleReschedule = () => {
    setLectureSchedule(prev => ({
      ...prev,
      status: "rescheduled",
      time: "11:45 AM"
    }));
    setRescheduleToast("Lecture adjustment broadcasted to Section A students.");
    setTimeout(() => setRescheduleToast(""), 3500);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setLectureSchedule(prev => ({
      ...prev,
      status: "cancelled"
    }));
    setShowCancelModal(false);
    setCancelAlert("Session cancel alert broadcasted to department registry.");
    setTimeout(() => setCancelAlert(""), 3500);
  };

  // Shared styling classes
  const cardHoverTokens = "hover:-translate-y-1 hover:scale-[1.01] hover:bg-white/[0.04] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-xl";
  const circularRadius = 28;
  const circularCircumference = 2 * Math.PI * circularRadius;
  const circularOffset = circularCircumference * (1 - 78.4 / 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 relative overflow-hidden space-y-8 select-none">
      
      {/* Background glowing radial gradient canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04),transparent_60%)] pointer-events-none z-0 animate-glow-pulse" />

      {/* Router Return Safeguard Absolute floating signout anchor */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-8 right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/25 transition-all duration-200 cursor-pointer shadow-md shadow-rose-500/5 z-50 animate-glow-pulse"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign Out
      </button>

      {/* Top Header Block */}
      <div className="border-b border-slate-800/80 pb-5 z-10 relative">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Faculty Command Workspace
        </h1>
        <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.02] border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{faculty.name}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 font-medium">Senior Professor</span>
        </div>
      </div>

      {/* Executive Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">
        
        {/* Analytics Card 1: Enrolled Students */}
        <div className={`backdrop-blur-xl bg-white/[0.02] border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between ${cardHoverTokens}`}>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-widest block">
              Total Enrolled Students
            </span>
            <h3 className="text-2xl font-black text-white">
              124 Students
            </h3>
            <p className="text-[10px] text-slate-550">
              Across Group A & Group B Sections
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Analytics Card 2: Average Attendance */}
        <div className={`backdrop-blur-xl bg-white/[0.02] border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between ${cardHoverTokens}`}>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-widest block">
              Average Class Attendance
            </span>
            <h3 className="text-2xl font-black text-white">
              78.4%
            </h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Above 75% Safety Threshold
            </p>
          </div>
          
          {/* Circular Emerald ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={circularRadius}
                className="text-slate-850"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={circularRadius}
                className="text-emerald-500"
                strokeWidth="5"
                strokeDasharray={circularCircumference}
                strokeDashoffset={circularOffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-[10px] font-mono font-bold text-slate-200">
              78%
            </div>
          </div>
        </div>

        {/* Analytics Card 3: Pending Evaluation */}
        <div className={`backdrop-blur-xl bg-white/[0.02] border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between ${cardHoverTokens}`}>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-widest block">
              Pending Submissions
            </span>
            <h3 className="text-2xl font-black text-rose-500 animate-pulse">
              42 Assignments
            </h3>
            <p className="text-[10px] text-slate-550">
              Requires Grading Review
            </p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

      </div>

      {/* Main Grid: Left is actions ledger & dispatcher, Right is resolved forum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 z-10 relative">
        
        {/* LEFT COLUMN: Ledger and Dispatcher */}
        <div className="space-y-6">
          
          {/* Ledger block */}
          <div className={`backdrop-blur-xl bg-white/[0.02] border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-6 ${cardHoverTokens}`}>
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Active Courses & Actions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Select a course group below to log attendance sheets or record MST marks.
                </p>
              </div>

              {/* Course actions ledger table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Course Code</th>
                      <th className="pb-3">Subject Name</th>
                      <th className="pb-3 text-right">Management Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {mockCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.01]">
                        <td className="py-4 font-mono font-bold text-white">{c.code}</td>
                        <td className="py-4 truncate max-w-[150px]" title={c.name}>
                          {c.name.replace(/\(.*?\)/, "").trim()}
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setActiveCourse(c.code);
                              setActiveAction("attendance");
                              setSuccessMessage("");
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold rounded bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 transition-colors duration-150 cursor-pointer"
                          >
                            [ Mark Attendance ]
                          </button>
                          <button
                            onClick={() => {
                              setActiveCourse(c.code);
                              setActiveAction("marks");
                              setSuccessMessage("");
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 transition-colors duration-150 cursor-pointer"
                          >
                            [ Post Internal Marks ]
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Success toast notification inside card */}
              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-semibold leading-relaxed animate-pulse">
                  {successMessage}
                </div>
              )}

              {/* Interactive Inline Actions Forms */}
              {activeAction === "attendance" && activeCourse && (
                <form onSubmit={handleSaveAttendance} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4 animate-page-entrance">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-blue-400">Mark Attendance: {activeCourse}</h4>
                    <button type="button" onClick={() => { setActiveAction(null); setActiveCourse(null); }} className="text-slate-500 hover:text-slate-300">✕</button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Jay Rajput (0808CI251117)</span>
                      <input 
                        type="checkbox" 
                        checked={attendanceSheet.jayPresent} 
                        onChange={(e) => setAttendanceSheet({ ...attendanceSheet, jayPresent: e.target.checked })}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Sumit Sharma (0808CI251118)</span>
                      <input 
                        type="checkbox" 
                        checked={attendanceSheet.sumitPresent} 
                        onChange={(e) => setAttendanceSheet({ ...attendanceSheet, sumitPresent: e.target.checked })}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>Pooja Pathak (0808CI251119)</span>
                      <input 
                        type="checkbox" 
                        checked={attendanceSheet.poojaPresent} 
                        onChange={(e) => setAttendanceSheet({ ...attendanceSheet, poojaPresent: e.target.checked })}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Submit Attendance Sheet
                  </button>
                </form>
              )}

              {activeAction === "marks" && activeCourse && (
                <form onSubmit={handleSaveMarks} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-4 animate-page-entrance">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-indigo-400">Post Marks: {activeCourse}</h4>
                    <button type="button" onClick={() => { setActiveAction(null); setActiveCourse(null); }} className="text-slate-500 hover:text-slate-300">✕</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-slate-450">Student</label>
                      <select
                        value={mstMarks.studentName}
                        onChange={(e) => setMstMarks({ ...mstMarks, studentName: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs outline-none"
                      >
                        <option value="Jay Rajput">Jay Rajput</option>
                        <option value="Sumit Sharma">Sumit Sharma</option>
                        <option value="Pooja Pathak">Pooja Pathak</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-slate-450">MST Score (20)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="20"
                        value={mstMarks.score} 
                        onChange={(e) => setMstMarks({ ...mstMarks, score: e.target.value })}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs outline-none font-mono text-center"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Save Internal Marks
                  </button>
                </form>
              )}

            </div>
          </div>

          {/* Active Lecture Dispatcher card */}
          <div className={`backdrop-blur-xl bg-white/[0.02] border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 ${cardHoverTokens}`}>
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Active Lecture Dispatcher
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Dispatch instant timetable adjustments or cancel lecture slots dynamically.
                </p>
              </div>

              {/* Lecture list items */}
              <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-3.5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wide bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">
                      BT-105 • Practical
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5">
                      {lectureSchedule.subject}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                      Scheduled Time: <span className="font-bold text-slate-200">{lectureSchedule.time}</span>
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    {lectureSchedule.status !== "cancelled" ? (
                      <>
                        <button
                          onClick={handleReschedule}
                          className="px-2.5 py-1 text-[10px] font-bold rounded bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 transition-all duration-150 cursor-pointer"
                        >
                          [ Reschedule 30m ]
                        </button>
                        <button
                          onClick={handleCancelClick}
                          className="px-2.5 py-1 text-[10px] font-bold rounded border border-red-500/30 hover:bg-red-500/10 text-red-400 transition-all duration-150 cursor-pointer"
                        >
                          [ Cancel Session ]
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full select-none">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Confirm Cancel Simulator Drawer */}
                {showCancelModal && (
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-xs space-y-2 animate-page-entrance">
                    <p className="font-semibold text-red-400">
                      Are you sure you want to cancel the Chemistry practical session today?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={confirmCancel}
                        className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-500 transition cursor-pointer"
                      >
                        Yes, Cancel Session
                      </button>
                      <button
                        onClick={() => setShowCancelModal(false)}
                        className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] font-bold hover:bg-slate-700 transition cursor-pointer"
                      >
                        Keep Session
                      </button>
                    </div>
                  </div>
                )}

                {/* Toasts and confirmation messages inside card */}
                {rescheduleToast && (
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-bold leading-normal animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span>{rescheduleToast}</span>
                  </div>
                )}

                {cancelAlert && (
                  <div className="p-2.5 bg-red-500/15 border border-red-500/20 rounded text-[10px] text-red-400 font-bold leading-normal animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>{cancelAlert}</span>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

        {/* DOUBT FORUM RESOLUTION FEED (Bottom Right) */}
        <div className={`backdrop-blur-xl bg-white/[0.02] border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-4 ${cardHoverTokens}`}>
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Outstanding Doubt Forum Feed
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide verified expert resolutions directly to student queries.
              </p>
            </div>

            {/* List of outstanding doubts */}
            <div className="space-y-2">
              {doubts.map((d) => {
                const isSelected = selectedDoubtId === d.id;
                const isResolved = d.status === "resolved";

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDoubtId(d.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/30 text-white"
                        : "bg-slate-900/40 border-slate-850 hover:bg-slate-900/80 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10 uppercase">
                        {d.courseCode}
                      </span>
                      {isResolved ? (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10 flex items-center gap-0.5">
                          ✓ Resolved
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/10 animate-pulse">
                          Unresolved
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold mt-2 truncate">{d.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{d.content}</p>
                    <span className="text-[9px] text-slate-500 mt-2 block font-semibold">Posted by: {d.authorName}</span>
                  </div>
                );
              })}
            </div>

            {/* Response Form */}
            {selectedDoubtId && (
              <form onSubmit={handlePostResponse} className="space-y-3 pt-2 border-t border-slate-850">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Verify & Answer: {doubts.find(d => d.id === selectedDoubtId)?.title}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter the official faculty verified solution..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-2.5 bg-slate-900/60 border border-slate-800 focus:border-blue-500/50 rounded-lg text-xs focus:outline-none text-slate-200 placeholder-slate-550 resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  [ Post Faculty Verification Response ]
                </button>
              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
