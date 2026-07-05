"use client";

import React, { useState } from "react";
import { mockProfiles, mockCourses, mockMarks } from "@/lib/mockDb";

interface SubjectBenchmark {
  courseId: string;
  mst1Average: number;
  mst2Average: number;
  assignmentAverage: number;
  classHighest: number;
}

export default function MarksPage() {
  // Fetch Jay Rajput's profile
  const student = mockProfiles.find((p) => p.role === "student") || mockProfiles[0];
  
  // Set up mock class benchmarks for comparison
  const benchmarks: SubjectBenchmark[] = [
    {
      courseId: "c-bt104",
      mst1Average: 14.2,
      mst2Average: 14.8,
      assignmentAverage: 8.1,
      classHighest: 94.5
    },
    {
      courseId: "c-bt105",
      mst1Average: 13.5,
      mst2Average: 13.9,
      assignmentAverage: 7.8,
      classHighest: 91.0
    }
  ];

  // ----------------------------------------------------
  // 1. DATA INGESTION & INTERNALS CALCULATION
  // ----------------------------------------------------
  const studentMarks = mockMarks.filter((m) => m.studentId === student.id);

  // Group marks and calculate internal metrics
  const coursePerformance = mockCourses.map((course) => {
    const marksForCourse = studentMarks.filter((m) => m.courseId === course.id);
    const mst1 = marksForCourse.find((m) => m.assessmentType === "MST-1")?.marksObtained || 0;
    const mst2 = marksForCourse.find((m) => m.assessmentType === "MST-2")?.marksObtained || 0;
    const assignment = marksForCourse.find((m) => m.assessmentType === "Assignment")?.marksObtained || 0;
    const endSem = marksForCourse.find((m) => m.assessmentType === "End-Sem")?.marksObtained || 0;

    // Internals out of 30 = Average MST (scaled out of 20) + Assignment (out of 10)
    const averageMst = (mst1 + mst2) / 2;
    const internalsScore = averageMst + assignment;
    const totalScore = internalsScore + endSem;

    // Find class benchmarks
    const benchmark = benchmarks.find((b) => b.courseId === course.id) || {
      courseId: course.id,
      mst1Average: 14.0,
      mst2Average: 14.0,
      assignmentAverage: 8.0,
      classHighest: 90.0
    };

    return {
      course,
      mst1,
      mst2,
      assignment,
      endSem,
      averageMst,
      internalsScore,
      totalScore,
      benchmark
    };
  });

  // ----------------------------------------------------
  // 2. END-SEM PREDICTIVE TARGET STATE & CALCULATION
  // ----------------------------------------------------
  const [targetSGPA, setTargetSGPA] = useState<number>(8.50);

  // Translate target SGPA to required average marks
  // Target SGPA of 10.0 -> 90 marks, 9.0 -> 80 marks, 8.0 -> 70 marks, 7.0 -> 60 marks...
  // Linear formula: Target Marks = Target SGPA * 10
  const getRequiredMarks = (sgpa: number) => {
    return sgpa * 10;
  };

  const targetMarksNeeded = getRequiredMarks(targetSGPA);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          MST Internal Marks & Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View mid-semester evaluations, class competitive averages, and project final requirements.
        </p>
      </div>

      {/* Main Grid: Left is Comparisons/Benchmarks, Right is Target Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEFT COLUMN: MST Comparisons & Callouts (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Comparison Card List */}
          <div className="glassmorphic-card p-6 rounded-2xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                Mid-Semester Test Comparison (MST-1 vs MST-2)
              </h2>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-0.5">
                Comparison of performance trends between the first and second term tests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coursePerformance.map(({ course, mst1, mst2, benchmark }) => {
                const mst1Diff = mst1 - benchmark.mst1Average;
                const mst2Diff = mst2 - benchmark.mst2Average;
                const trendUp = mst2 >= mst1;

                return (
                  <div 
                    key={course.id} 
                    className="p-5 rounded-xl border bg-slate-100/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/80 space-y-4 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  >
                    {/* Course Title Header */}
                    <div>
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        {course.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                        {course.name.replace(/\(.*?\)/, "").trim()}
                      </h4>
                    </div>

                    {/* Score Bar Graphs */}
                    <div className="space-y-4 pt-2">
                      {/* MST-1 Row */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-slate-500">MST-1 Score</span>
                          <span className="text-slate-800 dark:text-slate-200">{mst1} / 20</span>
                        </div>
                        <div className="relative w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          {/* Class Average marker */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10"
                            style={{ left: `${(benchmark.mst1Average / 20) * 100}%` }}
                            title={`Class Average: ${benchmark.mst1Average}`}
                          />
                          {/* Student score fill */}
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{ width: `${(mst1 / 20) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Class Avg: {benchmark.mst1Average}</span>
                          <span className={mst1Diff >= 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                            {mst1Diff >= 0 ? `+${mst1Diff.toFixed(1)}` : mst1Diff.toFixed(1)} Avg
                          </span>
                        </div>
                      </div>

                      {/* MST-2 Row */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-slate-500">MST-2 Score</span>
                          <span className="text-slate-800 dark:text-slate-200">{mst2} / 20</span>
                        </div>
                        <div className="relative w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          {/* Class Average marker */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 z-10"
                            style={{ left: `${(benchmark.mst2Average / 20) * 100}%` }}
                            title={`Class Average: ${benchmark.mst2Average}`}
                          />
                          {/* Student score fill */}
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{ width: `${(mst2 / 20) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>Class Avg: {benchmark.mst2Average}</span>
                          <span className={mst2Diff >= 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                            {mst2Diff >= 0 ? `+${mst2Diff.toFixed(1)}` : mst2Diff.toFixed(1)} Avg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trend indicators */}
                    <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Performance Shift:</span>
                      <span className={`font-bold flex items-center gap-0.5 ${trendUp ? "text-emerald-500" : "text-rose-500"}`}>
                        {trendUp ? (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Improved (+{mst2 - mst1})
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                            </svg>
                            Declined ({mst2 - mst1})
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Callouts and Benchmark Standings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat Box 1: Best Subject */}
            <div className="glassmorphic-card p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Strongest Subject
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Basic Electrical (BT-104)
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-snug">
                You are scoring <span className="text-emerald-550 font-bold">+3.0 marks</span> above the institutional class average.
              </p>
            </div>

            {/* Stat Box 2: Total Internals */}
            <div className="glassmorphic-card p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Total Internal Marks
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Average 25.0 / 30
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-snug">
                Combined internals across both courses. This provides a strong cushion for final theoretical exams.
              </p>
            </div>

            {/* Stat Box 3: Academic Percentile */}
            <div className="glassmorphic-card p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Competitive Standings
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Top 15% of Branch
              </h4>
              <p className="text-xs text-slate-555 dark:text-slate-400 leading-snug">
                Based on mock results from mid-semester internal databases at IPS Academy.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: End-Sem Target Meter Predictor (col-span-1) */}
        <div className="glassmorphic-card p-6 rounded-2xl flex flex-col justify-between h-full">
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                End-Sem Target Predictor
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Calculate necessary exam marks based on target SGPA.
              </p>
            </div>

            {/* Target SGPA Adjuster Slider */}
            <div className="space-y-3 bg-slate-100/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Target SGPA Goal</span>
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-mono border border-indigo-500/10">
                  {targetSGPA.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="6.50"
                max="9.80"
                step="0.10"
                value={targetSGPA}
                onChange={(e) => setTargetSGPA(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>6.50 (Passable)</span>
                <span>9.80 (Perfect)</span>
              </div>
            </div>

            {/* Target Breakdown Lists */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-widest">
                Required Marks per course
              </h4>
              
              <div className="space-y-3">
                {coursePerformance.map(({ course, internalsScore }) => {
                  // Required marks in this course = targetMarksNeeded
                  // Required in final End-Sem = targetMarksNeeded - internalsScore
                  const rawNeeded = targetMarksNeeded - internalsScore;
                  const finalNeeded = Math.max(0, Math.round(rawNeeded * 10) / 10);
                  const isImpossibleGoal = finalNeeded > 70;
                  const isAlreadySecured = finalNeeded <= 0;

                  return (
                    <div 
                      key={course.id} 
                      className={`p-3.5 rounded-xl border space-y-2 transition-all duration-300 ease-out ${
                        isImpossibleGoal
                          ? "border-red-500/30 bg-red-500/10 text-red-400 animate-pulse"
                          : "bg-slate-50 dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isImpossibleGoal ? "text-red-400 font-mono" : "text-slate-700 dark:text-slate-300 font-mono"}>
                          {course.code}
                        </span>
                        <span className={isImpossibleGoal ? "text-red-400/80 text-[10px] font-normal" : "text-[10px] text-slate-450 font-normal"}>
                          Internals: {internalsScore.toFixed(1)} / 30
                        </span>
                      </div>
                      
                      {/* Visual gauge representation */}
                      <div className="w-full bg-slate-200/50 dark:bg-slate-900/80 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isImpossibleGoal 
                              ? "bg-red-500" 
                              : isAlreadySecured 
                              ? "bg-emerald-500" 
                              : "bg-indigo-500"
                          }`}
                          style={{ width: `${isImpossibleGoal ? 100 : isAlreadySecured ? 0 : (finalNeeded / 70) * 100}%` }}
                        />
                      </div>

                      {/* Descriptive math help */}
                      <div className="flex items-center justify-between text-[11px] font-semibold pt-1">
                        <span className={isImpossibleGoal ? "text-red-400/85" : "text-slate-500"}>
                          Required Exam Score:
                        </span>
                        {isImpossibleGoal ? (
                          <span className="text-red-500 uppercase font-black tracking-wide text-[9px]">
                            Impossible (&gt;70)
                          </span>
                        ) : isAlreadySecured ? (
                          <span className="text-emerald-500 font-black text-[9px] uppercase tracking-wide">
                            Secured (0 / 70)
                          </span>
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                            {finalNeeded.toFixed(1)} / 70 ({Math.round((finalNeeded / 70) * 100)}%)
                          </span>
                        )}
                      </div>

                      {/* Exceeded Marks Helper Caption */}
                      {isImpossibleGoal && (
                        <p className="text-[9px] text-red-400/90 leading-tight mt-1 pt-1 border-t border-red-500/10">
                          *Exceeds maximum achievable theoretical examination marks based on current internal scores.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-500 leading-relaxed text-center">
            * This calculator utilizes a linear scaling model. Individual course grading criteria may vary based on university curve mappings.
          </div>
        </div>

      </div>
    </div>
  );
}
