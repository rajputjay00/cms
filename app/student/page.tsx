"use client";

import React, { useState, useEffect, useRef } from "react";
import { mockProfiles, mockCourses, mockAttendance } from "@/lib/mockDb";

// Interfaces for local state
interface Assignment {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  dueDate: Date;
  status: "pending" | "completed";
}

export default function StudentDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ----------------------------------------------------
  // 1. DATABASE & INITIAL CALCULATIONS
  // ----------------------------------------------------
  // Fetch Jay Rajput's profile
  const student = mockProfiles.find((p) => p.role === "student") || mockProfiles[0];
  
  // Calculate attendance details
  const studentAttendance = mockAttendance.filter((a) => a.studentId === student.id);
  const totalClasses = studentAttendance.length;
  const presentClasses = studentAttendance.filter(
    (a) => a.status === "Present" || a.status === "Late"
  ).length;
  const currentAttendancePercent = totalClasses > 0 
    ? (presentClasses / totalClasses) * 100 
    : 0;

  // Group attendance by course (for side-by-side circular micro-charts)
  const courseAttendance = mockCourses.map((course) => {
    const records = studentAttendance.filter((a) => a.courseId === course.id);
    const total = records.length;
    const present = records.filter(r => r.status === "Present" || r.status === "Late").length;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      ...course,
      total,
      present,
      percent
    };
  });

  // ----------------------------------------------------
  // 2. ATTENDANCE PREDICTOR STATE & MATH
  // ----------------------------------------------------
  const [futureAttended, setFutureAttended] = useState<number>(0);
  
  // Predict simulated attendance percentage
  const simulatedPresent = presentClasses + futureAttended;
  const simulatedTotal = totalClasses + futureAttended;
  const simulatedPercent = simulatedTotal > 0 ? (simulatedPresent / simulatedTotal) * 100 : 0;
  
  // Calculate consecutive classes needed to reach 75%
  const consecutiveNeeded = Math.max(0, 3 * totalClasses - 4 * presentClasses);
  
  // Calculate classes that can be skipped without falling below 75%
  const skippableClasses = Math.max(0, Math.floor((4 * presentClasses - 3 * totalClasses) / 3));

  // ----------------------------------------------------
  // 3. ASSIGNMENT TRACKER STATE & COUNTDOWNS
  // ----------------------------------------------------
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "asg-1",
      courseCode: "BT-104",
      courseName: "Basic Electrical Engineering",
      title: "DC Circuits & Network Theorems",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 32), // 32 hours from now
      status: "pending"
    },
    {
      id: "asg-2",
      courseCode: "BT-105",
      courseName: "Applied Chemistry",
      title: "Polymers and Molecular Weight Determination",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 58), // 58 hours from now
      status: "pending"
    },
    {
      id: "asg-3",
      courseCode: "BT-104",
      courseName: "Basic Electrical Engineering",
      title: "Magnetic Circuits Tutorial",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 48), // Passed
      status: "completed"
    }
  ]);

  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const remaining: { [key: string]: string } = {};
      assignments.forEach((asg) => {
        if (asg.status === "completed") {
          remaining[asg.id] = "Completed";
          return;
        }
        
        const now = new Date();
        const diff = asg.dueDate.getTime() - now.getTime();
        
        if (diff <= 0) {
          remaining[asg.id] = "Overdue";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          remaining[asg.id] = `${days}d ${hours}h ${mins}m`;
        }
      });
      setTimeRemaining(remaining);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000);
    return () => clearInterval(interval);
  }, [assignments]);

  // Upload state
  const [selectedAsgId, setSelectedAsgId] = useState<string>("asg-1");
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      setUploadState("uploading");
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadState("success");
            setTimeout(() => {
              setAssignments(prevAsgs => 
                prevAsgs.map(asg => 
                  asg.id === selectedAsgId ? { ...asg, status: "completed" } : asg
                )
              );
            }, 1000);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    } else {
      setUploadState("idle");
      setUploadedFileName("");
      setUploadProgress(0);
    }
  };

  const triggerFileSelect = (asgId: string) => {
    setSelectedAsgId(asgId);
    setUploadState("idle");
    setFileName("");
    setUploadProgress(0);
    fileInputRef.current?.click();
  };

  const setUploadedFileName = (name: string) => {
    setFileName(name);
  };

  // ----------------------------------------------------
  // 4. CGPA/SGPA TARGET TRACKER STATE & MATH
  // ----------------------------------------------------
  const sem1GPA = 7.40;
  const sem2GPA = 7.80;
  const [targetCGPA, setTargetCGPA] = useState<number>(8.20);
  
  const projectedSemGPA = (4 * targetCGPA - (sem1GPA + sem2GPA)) / 2;
  const isImpossible = projectedSemGPA > 10.0;

  const graphWidth = 420;
  const graphHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const getGraphY = (gpa: number) => {
    const minGpa = 6.0;
    const maxGpa = 10.0;
    const scale = (graphHeight - 2 * paddingY) / (maxGpa - minGpa);
    return graphHeight - paddingY - (gpa - minGpa) * scale;
  };

  const xSem1 = paddingX;
  const xSem2 = paddingX + (graphWidth - 2 * paddingX) / 3;
  const xSem3 = paddingX + 2 * (graphWidth - 2 * paddingX) / 3;
  const xSem4 = graphWidth - paddingX;

  const ySem1 = getGraphY(sem1GPA);
  const ySem2 = getGraphY(sem2GPA);
  const ySem3 = getGraphY(isImpossible ? 10.0 : projectedSemGPA);
  const ySem4 = getGraphY(isImpossible ? 10.0 : projectedSemGPA);

  // Shared 3D elevation hover class suffix
  const cardHoverTokens = "hover:-translate-y-1 hover:scale-[1.01] hover:bg-white/[0.04] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-xl";

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner Header */}
      <div className={`glassmorphic-card p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardHoverTokens}`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2.5 uppercase tracking-wider">
            Student Dashboard
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome Back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{student.name}</span>!
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
            B.Tech CSE Semester III / Student Planning Portal
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 z-10 md:self-start lg:self-center">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Enrollment:</span>
          <span className="text-slate-400 font-mono text-sm">{student.enrollmentNo}</span>
        </div>
      </div>

      {/* Bento Grid Layout - Fluid Device-Aware Stacking */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Attendance Predictor & Course Attendance Logs */}
        <div className="space-y-6 md:col-span-1 lg:col-span-1">
          
          {/* Card 1: Attendance Predictor */}
          <div className={`glassmorphic-card p-6 rounded-2xl flex flex-col justify-between ${cardHoverTokens}`}>
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                  Attendance Predictor
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Simulate your future class attendance.
                </p>
              </div>

              {/* Circular Progress Ring */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="text-slate-200 dark:text-slate-800/80"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className={`transition-all duration-300 ${
                        simulatedPercent < 75 
                          ? "text-rose-500" 
                          : "text-blue-600 dark:text-blue-500"
                      }`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60 * (1 - simulatedPercent / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {Math.round(simulatedPercent)}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                      {futureAttended > 0 ? "Projected" : "Current"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-505 text-[10px]">Attended: {simulatedPresent}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="text-slate-505 text-[10px]">Total: {simulatedTotal}</span>
                  </div>
                </div>
              </div>

              {/* Slider widget */}
              <div className="space-y-2.5 bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Attend Future Classes</span>
                  <span className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md font-mono border border-blue-500/10">
                    +{futureAttended} Lectures
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={futureAttended}
                  onChange={(e) => setFutureAttended(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                  <span>+0 (No change)</span>
                  <span>+25 Lectures</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border text-xs leading-relaxed bg-slate-550 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/80">
                {currentAttendancePercent < 75 ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Below 75% Threshold</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      You must attend at least <span className="font-mono font-black text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/10">{consecutiveNeeded}</span> consecutive classes to recover.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Safe Zone Standing</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      You can safely skip up to <span className="font-mono font-black text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/10">{skippableClasses}</span> classes without penalty.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Course Attendance Logs */}
          <div className={`glassmorphic-card p-6 rounded-2xl flex flex-col justify-between ${cardHoverTokens}`}>
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="h-4.5 w-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                  </svg>
                  Course Attendance Logs
                </h2>
                <p className="text-[10px] text-slate-550 mt-0.5">
                  Individual paper lecture ratios.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {courseAttendance.map((course) => {
                  const isUnderThreshold = course.percent < 75;
                  const radius = 24;
                  const strokeWidth = 5;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference * (1 - course.percent / 100);

                  return (
                    <div 
                      key={course.id} 
                      className="flex flex-col items-center justify-center p-4 bg-slate-100/30 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/80 rounded-xl relative"
                    >
                      <div className="relative flex items-center justify-center">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            className="text-slate-200 dark:text-slate-800/60"
                            strokeWidth={strokeWidth}
                            stroke="currentColor"
                            fill="transparent"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            className={`transition-all duration-550 ${
                              isUnderThreshold ? "text-rose-500" : "text-blue-500"
                            }`}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {course.percent}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-center mt-3 w-full">
                        <span className="block text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {course.code}
                        </span>
                        <span 
                          className="block text-[9px] text-slate-400 mt-0.5 truncate w-full text-center" 
                          title={course.name}
                        >
                          {course.name.replace(/\(.*?\)/, "").trim()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Assignments & CGPA Target Widget */}
        <div className="space-y-6 md:col-span-1 lg:col-span-2">
          
          {/* Card 3: Active Assignments */}
          <div className={`glassmorphic-card p-6 rounded-2xl flex flex-col justify-between space-y-6 ${cardHoverTokens}`}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Active Assignments
                </h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-2 py-1 rounded-md uppercase tracking-wider">
                  Deadlines Pending
                </span>
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5">
                Submit your B.Tech course sheets directly in the upload portal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {assignments.map((asg) => {
                  const isPending = asg.status === "pending";
                  const isOverdue = timeRemaining[asg.id] === "Overdue";
                  return (
                    <div
                      key={asg.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
                        asg.status === "completed"
                          ? "bg-slate-100/30 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-800/30 opacity-70"
                          : "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {asg.courseCode}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              asg.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                                : isOverdue
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/10"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                            }`}
                          >
                            {asg.status === "completed" 
                              ? "Submitted" 
                              : isOverdue 
                              ? "Overdue" 
                              : "Pending"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 line-clamp-1">
                          {asg.title}
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-0.5 truncate">
                          {asg.courseName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
                        <div className="text-[10px]">
                          <span className="text-slate-400">Remaining:</span>{" "}
                          <span
                            className={`font-mono font-bold ${
                              asg.status === "completed"
                                ? "text-emerald-500"
                                : isOverdue
                                ? "text-rose-500"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {timeRemaining[asg.id] || "Calculating..."}
                          </span>
                        </div>
                        {isPending && !isOverdue && (
                          <button
                            onClick={() => triggerFileSelect(asg.id)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
                          >
                            Upload Sheet
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Glassmorphic Upload Zone */}
            <div className="p-5 rounded-xl border border-dashed bg-slate-100/30 dark:bg-slate-900/10 border-slate-300 dark:border-slate-800/80 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300 min-h-[120px]">
              {uploadState === "idle" && (
                <div 
                  onClick={() => triggerFileSelect(selectedAsgId)} 
                  className="cursor-pointer group flex flex-col items-center justify-center space-y-1"
                >
                  <div className="p-3 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Drag and drop files here, or <span className="text-blue-500 hover:underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Uploading files for: <span className="font-mono text-indigo-500">{assignments.find(a => a.id === selectedAsgId)?.courseCode || "Select Course"}</span> (PDF, ZIP max 5MB)
                  </p>
                </div>
              )}

              {uploadState === "uploading" && (
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-650 dark:text-slate-400 truncate max-w-[200px]">Uploading: {fileName}</span>
                    <span className="font-mono text-blue-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadState === "success" && (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-full animate-bounce">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    File Uploaded Successfully!
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {fileName} has been registered to sheet portal.
                  </p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.zip,.doc,.docx"
              />
            </div>
          </div>

          {/* Card 4: CGPA Target */}
          <div className={`glassmorphic-card p-6 rounded-2xl flex flex-col justify-between space-y-6 ${cardHoverTokens}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  CGPA Projection & GPA Target
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Adjust target CGPA to project required GPAs for Semester 3 and Semester 4.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Target CGPA Goal</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                    {targetCGPA.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>Adjust Target CGPA</span>
                    <span className="text-indigo-500 font-mono font-bold">{targetCGPA}</span>
                  </label>
                  <input
                    type="range"
                    min="7.60"
                    max="9.80"
                    step="0.05"
                    value={targetCGPA}
                    onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>7.60 (Current)</span>
                    <span>9.80 (Perfect)</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border text-xs leading-relaxed transition-all duration-300 ${
                  isImpossible
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-450"
                    : "bg-indigo-500/5 border-indigo-500/10 text-slate-600 dark:text-slate-400"
                }`}>
                  {isImpossible ? (
                    <div className="space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Goal Impossible
                      </p>
                      <p className="text-[10px]">
                        Required GPA: <span className="font-bold">{projectedSemGPA.toFixed(2)}</span> per semester. This exceeds 10.0 and is mathematically impossible.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Projection Outlook
                      </p>
                      <p className="text-[10px]">
                        To reach a CGPA of <span className="font-bold text-slate-800 dark:text-slate-200">{targetCGPA.toFixed(2)}</span>, you need an average GPA of <span className="font-bold font-mono text-indigo-500">{projectedSemGPA.toFixed(2)}</span> in both Semesters 3 and 4.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom SVG Line Graph */}
              <div className="md:col-span-8 flex justify-center bg-slate-100/30 dark:bg-slate-900/20 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                <svg width={graphWidth} height={graphHeight} className="overflow-visible select-none max-w-full">
                  <defs>
                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <line x1={paddingX} y1={getGraphY(10.0)} x2={graphWidth - paddingX} y2={getGraphY(10.0)} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800/50" strokeDasharray="3 3" />
                  <line x1={paddingX} y1={getGraphY(8.0)} x2={graphWidth - paddingX} y2={getGraphY(8.0)} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800/50" strokeDasharray="3 3" />
                  <line x1={paddingX} y1={getGraphY(6.0)} x2={graphWidth - paddingX} y2={getGraphY(6.0)} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800/50" strokeDasharray="3 3" />

                  <text x={paddingX - 10} y={getGraphY(10.0) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400 font-medium">10.0</text>
                  <text x={paddingX - 10} y={getGraphY(8.0) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400 font-medium">8.0</text>
                  <text x={paddingX - 10} y={getGraphY(6.0) + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-400 font-medium">6.0</text>

                  <path
                    d={`
                      M ${xSem1} ${graphHeight - paddingY}
                      L ${xSem1} ${ySem1}
                      L ${xSem2} ${ySem2}
                      L ${xSem3} ${ySem3}
                      L ${xSem4} ${ySem4}
                      L ${xSem4} ${graphHeight - paddingY}
                      Z
                    `}
                    fill="url(#area-gradient)"
                    className="transition-all duration-300"
                  />

                  <path
                    d={`M ${xSem1} ${ySem1} L ${xSem2} ${ySem2} L ${xSem3} ${ySem3} L ${xSem4} ${ySem4}`}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />

                  <circle cx={xSem1} cy={ySem1} r="5" className="fill-blue-500 stroke-white dark:stroke-slate-950" strokeWidth="2" />
                  <text x={xSem1} y={ySem1 - 10} textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300">{sem1GPA.toFixed(2)}</text>
                  <text x={xSem1} y={graphHeight - 5} textAnchor="middle" className="text-[9px] font-bold fill-slate-400">Sem 1</text>

                  <circle cx={xSem2} cy={ySem2} r="5" className="fill-blue-500 stroke-white dark:stroke-slate-950" strokeWidth="2" />
                  <text x={xSem2} y={ySem2 - 10} textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-700 dark:fill-slate-300">{sem2GPA.toFixed(2)}</text>
                  <text x={xSem2} y={graphHeight - 5} textAnchor="middle" className="text-[9px] font-bold fill-slate-400">Sem 2</text>

                  <circle cx={xSem3} cy={ySem3} r="5" className="fill-indigo-500 stroke-white dark:stroke-slate-950 transition-all duration-300" strokeWidth="2" />
                  <text x={xSem3} y={ySem3 - 10} textAnchor="middle" className="text-[10px] font-mono font-black fill-indigo-600 dark:fill-indigo-400 transition-all duration-300">{isImpossible ? "N/A" : projectedSemGPA.toFixed(2)}</text>
                  <text x={xSem3} y={graphHeight - 5} textAnchor="middle" className="text-[9px] font-bold fill-slate-400">Sem 3 (Proj)</text>

                  <circle cx={xSem4} cy={ySem4} r="5" className="fill-indigo-500 stroke-white dark:stroke-slate-950 transition-all duration-300" strokeWidth="2" />
                  <text x={xSem4} y={ySem4 - 10} textAnchor="middle" className="text-[10px] font-mono font-black fill-indigo-600 dark:fill-indigo-400 transition-all duration-300">{isImpossible ? "N/A" : projectedSemGPA.toFixed(2)}</text>
                  <text x={xSem4} y={graphHeight - 5} textAnchor="middle" className="text-[9px] font-bold fill-slate-400">Sem 4 (Proj)</text>
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Today's Lecture Timetable and Recent Announcements Sub-Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:col-span-2 lg:col-span-3 mt-2">
          
          {/* Card 5: Today's Lecture Timetable */}
          <div className={`glassmorphic-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-white/[0.04] shadow-xl space-y-4 ${cardHoverTokens}`}>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="h-4.5 w-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Today's Lecture Timetable
              </h2>
              <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-0.5 font-medium">
                Day-wise engineering class scheduler logs.
              </p>
            </div>

            <div className="space-y-3">
              {/* Class 1 */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-450 dark:text-slate-500 block">09:30 AM - 11:00 AM</span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Basic Electrical Engineering</h4>
                  <span className="text-[9px] text-slate-455 dark:text-slate-400 block font-medium">Room 204 | Lecture Hall</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-full select-none">
                  Completed
                </span>
              </div>

              {/* Class 2 */}
              <div className="flex items-start justify-between gap-4 p-3 bg-blue-500/5 dark:bg-blue-600/5 border border-blue-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-blue-500 block">11:15 AM - 12:45 PM</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Applied Chemistry</h4>
                  <span className="text-[9px] text-slate-455 dark:text-slate-400 block font-medium">Chemistry Lab | Practical</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse select-none flex items-center gap-1 font-semibold">
                  <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping" />
                  Live Now
                </span>
              </div>

              {/* Class 3 */}
              <div className="flex items-start justify-between gap-4 p-3 bg-slate-100/30 dark:bg-slate-900/10 border border-slate-200/30 dark:border-slate-800/40 rounded-xl">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-400 block">01:30 PM - 03:00 PM</span>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Engineering Graphics</h4>
                  <span className="text-[9px] text-slate-550 dark:text-slate-400 block font-medium">Drawing Hall | Workshop</span>
                </div>
                <span className="text-[9px] font-black uppercase bg-slate-200/10 dark:bg-slate-800/60 text-slate-400 border border-slate-300/5 dark:border-slate-850 px-2 py-0.5 rounded-full select-none">
                  Upcoming
                </span>
              </div>
            </div>
          </div>

          {/* Card 6: Recent Announcements */}
          <div className={`glassmorphic-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:bg-white/[0.04] shadow-xl space-y-4 ${cardHoverTokens}`}>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="h-4.5 w-4.5 text-indigo-550 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.003 6.003 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Recent Announcements
              </h2>
              <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-0.5 font-medium">
                Official notifications and updates from faculty office.
              </p>
            </div>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-600 dark:text-amber-400">MST-1 Answer Sheet Review</span>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500">Just Now</span>
                </div>
                <p className="text-slate-505 dark:text-slate-400 mt-1 leading-normal text-[11px]">
                  You can review your MST-1 Answer sheet for Applied Chemistry (BT-105) with Dr. Saroj Raghuvanshi on 8th July.
                </p>
              </div>
              
              {/* Alert 2 */}
              <div className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-350">Registration for End-Sem Exams</span>
                  <span className="text-[9px] text-slate-450">2 Days ago</span>
                </div>
                <p className="text-slate-505 dark:text-slate-450 mt-1 leading-normal text-[11px]">
                  Examination registration window for third-semester students opens next week. Keep dues clear.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
