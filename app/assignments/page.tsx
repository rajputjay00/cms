"use client";

import React, { useState, useEffect, useRef } from "react";
import { mockProfiles, mockCourses } from "@/lib/mockDb";

interface Assignment {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "submitted" | "graded";
  submittedDate?: string;
  fileName?: string;
  score?: number;
  maxScore?: number;
  feedback?: string;
  feedbackAuthor?: string;
}

export default function AssignmentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch Jay Rajput's profile details
  const student = mockProfiles.find((p) => p.role === "student") || mockProfiles[0];

  // ----------------------------------------------------
  // 1. STATE INITIALIZATION (Active & Graded Records)
  // ----------------------------------------------------
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "asg-1",
      courseId: "c-bt104",
      courseCode: "BT-104",
      courseName: "Basic Electrical Engineering",
      title: "Tutorial Sheet 4: DC Network Theorems",
      description: "Solve all 5 questions from Tutorial Sheet 4 regarding superposition and Norton's theorems. Scan your sheets as a single PDF, show detailed node equations, and upload your solution document here.",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 32), // 32 hours from now
      status: "pending"
    },
    {
      id: "asg-2",
      courseId: "c-bt105",
      courseCode: "BT-105",
      courseName: "Applied Chemistry",
      title: "Lab Experiment 3: Spectrophotometric Analysis",
      description: "Compile your experimental findings, calibration curve, and concentration calculation from Experiment 3 (Beer-Lambert's Law). Attach your scanned report sheet in PDF format.",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 58), // 58 hours from now
      status: "pending"
    },
    {
      id: "asg-3",
      courseId: "c-bt104",
      courseCode: "BT-104",
      courseName: "Basic Electrical Engineering",
      title: "Tutorial Sheet 3: Magnetic Circuits & reluctance",
      description: "Submit answers for magnetic circuit equations, including calculation of reluctance and flux. Hand in calculations on double-ruled sheet.",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
      status: "submitted",
      submittedDate: "2026-07-04",
      fileName: "BT104_Tutorial3_Jay_Rajput.pdf"
    },
    {
      id: "asg-4",
      courseId: "c-bt105",
      courseCode: "BT-105",
      courseName: "Applied Chemistry",
      title: "Tutorial Sheet 1: Water Softening & Zeolites",
      description: "Answer standard problems on hardness calculation in ppm units, carbonate/non-carbonate hardness, and details of ion exchange process.",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
      status: "graded",
      submittedDate: "2026-07-01",
      score: 9,
      maxScore: 10,
      feedback: "Excellent calculation accuracy Jay. Good documentation of structural equations. Minor units formatting correction is annotated in your PDF.",
      feedbackAuthor: "Dr. Saroj Raghuvanshi"
    }
  ]);

  // Tab state: "active" (shows pending & submitted) or "history" (shows graded)
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  
  // Selected assignment for the details panel
  const [selectedAsgId, setSelectedAsgId] = useState<string>("asg-1");

  // Get currently selected assignment object
  const selectedAsg = assignments.find((a) => a.id === selectedAsgId) || assignments[0];

  // ----------------------------------------------------
  // 2. COUNTDOWN TIMER LOGIC
  // ----------------------------------------------------
  const [countdowns, setCountdowns] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const calculateCountdowns = () => {
      const remaining: { [key: string]: string } = {};
      assignments.forEach((asg) => {
        if (asg.status !== "pending") return;
        
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
      setCountdowns(remaining);
    };

    calculateCountdowns();
    const interval = setInterval(calculateCountdowns, 60000); // update every minute
    return () => clearInterval(interval);
  }, [assignments]);

  // ----------------------------------------------------
  // 3. FILE UPLOAD SIMULATOR STATE
  // ----------------------------------------------------
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setUploadState("uploading");
      setUploadProgress(0);

      // Simulate upload progress loading bar
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadState("success");
            
            // Wait 1s and then update global assignment card state in the client list
            setTimeout(() => {
              setAssignments((prevAsgs) =>
                prevAsgs.map((a) =>
                  a.id === selectedAsgId
                    ? {
                        ...a,
                        status: "submitted",
                        submittedDate: new Date().toISOString().split("T")[0],
                        fileName: file.name
                      }
                    : a
                )
              );
              setUploadState("idle");
            }, 1000);
            return 100;
          }
          return prev + 25;
        });
      }, 200);
    } else {
      // Gracefully handle cancelled or empty selection dialog paths
      setUploadState("idle");
      setUploadedFileName("");
      setUploadProgress(0);
    }
  };

  const triggerFileUpload = () => {
    setUploadState("idle");
    setUploadedFileName("");
    setUploadProgress(0);
    fileInputRef.current?.click();
  };

  // Filtered list based on active tab
  const tabFilteredAssignments = assignments.filter((asg) => {
    if (activeTab === "active") {
      return asg.status === "pending" || asg.status === "submitted";
    }
    return asg.status === "graded";
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Assignments Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Submit class tutorial sheets, check evaluation results, and view teacher feedback.
        </p>
      </div>

      {/* Tabs Switch Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => {
            setActiveTab("active");
            // Set selection default to first matching item
            const firstActive = assignments.find((a) => a.status === "pending" || a.status === "submitted");
            if (firstActive) setSelectedAsgId(firstActive.id);
          }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 mr-8 bg-transparent border-b-2 px-1 cursor-pointer ${
            activeTab === "active"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          Active Submissions
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            const firstGraded = assignments.find((a) => a.status === "graded");
            if (firstGraded) setSelectedAsgId(firstGraded.id);
          }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 bg-transparent border-b-2 px-1 cursor-pointer ${
            activeTab === "history"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
          }`}
        >
          Grades & History
        </button>
      </div>

      {/* Split screen content: Left is Card Deck, Right is Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Card Deck (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          {tabFilteredAssignments.length === 0 ? (
            <div className="glassmorphic-card p-12 text-center rounded-2xl italic text-xs text-slate-400">
              No assignments found in this section.
            </div>
          ) : (
            <div className="space-y-4">
              {tabFilteredAssignments.map((asg) => {
                const active = selectedAsgId === asg.id;
                const isOverdue = countdowns[asg.id] === "Overdue";

                return (
                  <div
                    key={asg.id}
                    onClick={() => {
                      setSelectedAsgId(asg.id);
                      setUploadState("idle");
                    }}
                    className={`glassmorphic-card p-5 rounded-2xl cursor-pointer transition-all duration-200 border flex justify-between gap-4 items-start ${
                      active
                        ? "border-blue-500/40 shadow-md shadow-blue-500/5 bg-slate-100/50 dark:bg-slate-900/30"
                        : "border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100/30 dark:hover:bg-slate-900/10"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          {asg.courseCode}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          • {asg.courseName.replace(/\(.*?\)/, "").trim()}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1 leading-snug">
                        {asg.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {asg.description}
                      </p>
                    </div>

                    {/* Status Pill Badge Column */}
                    <div className="shrink-0 text-right space-y-2">
                      {asg.status === "pending" && (
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            isOverdue 
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/10" 
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                          }`}>
                            {isOverdue ? "Overdue" : "Pending"}
                          </span>
                          {!isOverdue && (
                            <span className="text-[9px] font-mono text-slate-405 dark:text-slate-500">
                              {countdowns[asg.id] || "Counting..."}
                            </span>
                          )}
                        </div>
                      )}

                      {asg.status === "submitted" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 uppercase tracking-wider">
                          Submitted
                        </span>
                      )}

                      {asg.status === "graded" && (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 uppercase tracking-wider">
                            Graded: {asg.score} / {asg.maxScore}
                          </span>
                          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold">
                            by {asg.feedbackAuthor?.split(' ').slice(-1)[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Details Pane (col-span-2) */}
        <div className="lg:col-span-2">
          {selectedAsg ? (
            <div className="glassmorphic-card p-6 rounded-2xl flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                {/* Course branding tag */}
                <div>
                  <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/10 uppercase tracking-wider">
                    {selectedAsg.courseCode}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mt-3 leading-snug">
                    {selectedAsg.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Course: {selectedAsg.courseName}
                  </p>
                </div>

                <hr className="border-slate-200/50 dark:border-slate-800/50" />

                {/* Instructions body */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Assignment Description
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    {selectedAsg.description}
                  </p>
                </div>

                <hr className="border-slate-200/50 dark:border-slate-800/50" />

                {/* Date info */}
                <div className="flex items-center justify-between text-xs">
                  {selectedAsg.status === "pending" ? (
                    <>
                      <span className="text-slate-500">Submission Due Date:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {selectedAsg.dueDate.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500">Submitted Date:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {new Date(selectedAsg.submittedDate || "").toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* ACTION PANES */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                
                {/* 1. Pending upload state */}
                {selectedAsg.status === "pending" && (
                  <div className="p-4 rounded-xl border border-dashed bg-slate-100/30 dark:bg-slate-900/10 border-slate-300 dark:border-slate-800/80 text-center relative overflow-hidden transition-all duration-300 min-h-[120px] flex items-center justify-center">
                    {uploadState === "idle" && (
                      <div 
                        onClick={triggerFileUpload} 
                        className="cursor-pointer group flex flex-col items-center justify-center space-y-1"
                      >
                        <div className="p-2.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-200">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Click to select assignment file
                        </p>
                        <p className="text-[9px] text-slate-400">
                          Supports PDF or ZIP (Max 5MB)
                        </p>
                      </div>
                    )}

                    {uploadState === "uploading" && (
                      <div className="w-full px-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-slate-500 truncate max-w-[140px]">{uploadedFileName}</span>
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
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full animate-bounce">
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Uploaded Successfully!
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.zip"
                    />
                  </div>
                )}

                {/* 2. Submitted awaiting review state */}
                {selectedAsg.status === "submitted" && (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <svg className="h-4.5 w-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Submitted - Awaiting Review</span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1.5">
                      <p>Your tutorial sheet has been uploaded successfully and is locked for faculty grading.</p>
                      <div className="p-2 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-lg flex items-center justify-between">
                        <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{selectedAsg.fileName}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold shrink-0">Locked PDF</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Graded review state */}
                {selectedAsg.status === "graded" && (
                  <div className="space-y-4">
                    {/* Score block */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-350">
                        Evaluator Score:
                      </div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {selectedAsg.score} <span className="text-xs text-slate-450 dark:text-slate-500 font-normal">/ {selectedAsg.maxScore}</span>
                      </div>
                    </div>
                    
                    {/* Feedback block */}
                    <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Faculty Feedback</span>
                        <span>by {selectedAsg.feedbackAuthor}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed italic">
                        "{selectedAsg.feedback}"
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="glassmorphic-card p-6 rounded-2xl flex items-center justify-center text-xs italic text-slate-400 h-full">
              Select an assignment to view details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
