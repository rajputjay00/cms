"use client";

import React, { useState } from "react";
import { mockProfiles, mockCourses, mockAttendance } from "@/lib/mockDb";

interface EnrichedAttendance {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  date: string;
  sessionType: "Lecture" | "Lab";
  status: "Present" | "Absent" | "Medical Leave" | "Duty Leave";
}

export default function AttendancePage() {
  // Fetch Jay Rajput's profile
  const student = mockProfiles.find((p) => p.role === "student") || mockProfiles[0];
  const studentAttendance = mockAttendance.filter((a) => a.studentId === student.id);

  // ----------------------------------------------------
  // 1. DATA ENRICHMENT
  // ----------------------------------------------------
  const logs: EnrichedAttendance[] = studentAttendance.map((log, index) => {
    const course = mockCourses.find((c) => c.id === log.courseId);
    
    // Map index to Lecture or Lab sessions
    const sessionType = index % 3 === 0 ? "Lab" : "Lecture";
    
    // Diversify status (Present, Absent, Medical Leave, Duty Leave)
    let status: "Present" | "Absent" | "Medical Leave" | "Duty Leave" = "Present";
    if (log.status === "Absent") {
      status = "Absent";
    } else if (log.status === "Late") {
      status = index % 2 === 0 ? "Medical Leave" : "Duty Leave";
    }

    return {
      id: log.id,
      courseId: log.courseId,
      courseCode: course?.code || "",
      courseName: course?.name || "",
      date: log.date,
      sessionType,
      status
    };
  });

  // Sort logs by date descending (recent first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ----------------------------------------------------
  // 2. AGGREGATE CALCULATIONS (Lecture vs Lab)
  // ----------------------------------------------------
  const lectureLogs = logs.filter((log) => log.sessionType === "Lecture");
  const totalLectures = lectureLogs.length;
  const attendedLectures = lectureLogs.filter(
    (log) => log.status === "Present" || log.status === "Medical Leave" || log.status === "Duty Leave"
  ).length;
  const lecturePercent = totalLectures > 0 ? Math.round((attendedLectures / totalLectures) * 100) : 0;

  const labLogs = logs.filter((log) => log.sessionType === "Lab");
  const totalLabs = labLogs.length;
  const attendedLabs = labLogs.filter(
    (log) => log.status === "Present" || log.status === "Medical Leave" || log.status === "Duty Leave"
  ).length;
  const labPercent = totalLabs > 0 ? Math.round((attendedLabs / totalLabs) * 100) : 0;

  const overallAttended = attendedLectures + attendedLabs;
  const overallTotal = totalLectures + totalLabs;
  const overallPercent = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0;

  // ----------------------------------------------------
  // 3. FILTER STATE & ACTION LOGIC
  // ----------------------------------------------------
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLogs = sortedLogs.filter((log) => {
    const matchesCourse = courseFilter === "all" || log.courseId === courseFilter;
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "Present") {
        matchesStatus = log.status === "Present";
      } else if (statusFilter === "Absent") {
        matchesStatus = log.status === "Absent";
      } else if (statusFilter === "Leave") {
        matchesStatus = log.status === "Medical Leave" || log.status === "Duty Leave";
      }
    }

    return matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <div className="flex items-center flex-wrap gap-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white inline-block">
            Attendance Logs
          </h1>
          <span className="ml-4 px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full vertical-align-middle inline-flex items-center align-middle">
            {filteredLogs.length} Records
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Detailed historical register of lectures and laboratory sessions.
        </p>
      </div>

      {/* Aggregate Cards: Lecture vs Lab Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Lecture Session aggregate */}
        <div className="glassmorphic-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 uppercase font-black tracking-wider">
              Lecture Attendance
            </span>
            <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/10">
              {lecturePercent}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: `${lecturePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Attended: {attendedLectures} / {totalLectures} lectures</span>
              <span>Req: 75%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Lab Session aggregate */}
        <div className="glassmorphic-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-455 uppercase font-black tracking-wider">
              Laboratory Sessions
            </span>
            <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10">
              {labPercent}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${labPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Attended: {attendedLabs} / {totalLabs} labs</span>
              <span>Req: 75%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Overall Program aggregate */}
        <div className="glassmorphic-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-460 uppercase font-black tracking-wider">
              Total Cumulative Attendance
            </span>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              overallPercent < 75 
                ? "bg-rose-500/10 text-rose-500 border-rose-500/10" 
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
            }`}>
              {overallPercent}%
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-350 ${
                  overallPercent < 75 
                    ? "bg-gradient-to-r from-rose-500 to-red-600" 
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Total Classes: {overallAttended} / {overallTotal}</span>
              {overallPercent < 75 ? (
                <span className="text-rose-500 font-bold animate-pulse">Shortage</span>
              ) : (
                <span className="text-emerald-500 font-bold">Clear</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Filter Toggles */}
      <div className="glassmorphic p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Left Side: Category Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Course filter select */}
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Course Paper</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Courses</option>
              {mockCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} - {c.name.replace(/\(.*?\)/, "").trim()}</option>
              ))}
            </select>
          </div>

          {/* Status filter select */}
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Status Type</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
              <option value="Leave">Duty/Medical Leaves</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabular Historical Ledger */}
      <div className="glassmorphic-card rounded-2xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">
            No attendance records match the selected course or status filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-850 bg-slate-100/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Course Paper</th>
                  <th className="py-3 px-4">Session Type</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-slate-850 text-slate-750 dark:text-slate-300">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-white/[0.02] active:bg-white/[0.04] transition-all duration-200 cursor-pointer border-b border-slate-200/40 dark:border-slate-850"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {new Date(log.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white mr-2">{log.courseCode}</span>
                      <span className="text-slate-400 hidden sm:inline">{log.courseName.replace(/\(.*?\)/, "").trim()}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className={`inline-flex items-center gap-1 text-[11px] ${
                        log.sessionType === "Lab" ? "text-purple-500" : "text-blue-500"
                      }`}>
                        {log.sessionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        log.status === "Present"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                          : log.status === "Absent"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/10"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
