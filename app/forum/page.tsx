"use client";

import React, { useState } from "react";
import { mockProfiles, mockCourses } from "@/lib/mockDb";

interface Comment {
  id: string;
  authorName: string;
  authorRole: "student" | "faculty";
  content: string;
  createdAt: string;
  isVerifiedFaculty: boolean;
}

interface Doubt {
  id: string;
  title: string;
  content: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  authorName: string;
  authorRole: "student" | "faculty";
  createdAt: string;
  status: "unresolved" | "resolved";
  comments: Comment[];
}

export default function DoubtForum() {
  // Fetch logged in student details
  const student = mockProfiles.find((p) => p.role === "student") || mockProfiles[0];
  
  // ----------------------------------------------------
  // 1. INITIAL FORUM POSTS STATE
  // ----------------------------------------------------
  const [doubts, setDoubts] = useState<Doubt[]>([
    {
      id: "doubt-1",
      title: "Confusion regarding Norton's Equivalent resistance (Rn) derivation",
      content: "When determining Norton's equivalent resistance (Rn), do we open circuit all the independent current sources and short circuit independent voltage sources, just like Thevenin's? The textbook diagrams seem a bit ambiguous. Can anyone clarify the exact step-by-step procedure?",
      courseId: "c-bt104",
      courseCode: "BT-104",
      courseName: "Basic Electrical Engineering",
      authorName: "Jay Rajput",
      authorRole: "student",
      createdAt: "2026-07-04T10:30:00Z",
      status: "resolved",
      comments: [
        {
          id: "c-1",
          authorName: "Dr. Saroj Raghuvanshi",
          authorRole: "faculty",
          content: "Yes Jay, you are absolutely correct. The method for finding Norton's resistance (Rn) is identical to finding Thevenin's resistance (Rth). You must deactivate all independent sources: short-circuit independent voltage sources (0V) and open-circuit independent current sources (0A), then calculate the equivalent resistance looking into the load terminals.",
          createdAt: "2026-07-04T14:15:00Z",
          isVerifiedFaculty: true
        },
        {
          id: "c-2",
          authorName: "Jay Rajput",
          authorRole: "student",
          content: "Thank you Dr. Saroj, that completely clears up my confusion. I was able to solve Tutorial Sheet 3 using this instruction.",
          createdAt: "2026-07-04T16:00:00Z",
          isVerifiedFaculty: false
        }
      ]
    },
    {
      id: "doubt-2",
      title: "Preparation topics for Chemistry MST-2 polymers section",
      content: "Can someone share what kinds of polymer questions are expected in MST-2? Are reactions for synthesis of Bakelite and Nylon-6,6 frequently asked, or is it mostly theoretical classification?",
      courseId: "c-bt105",
      courseCode: "BT-105",
      courseName: "Applied Chemistry",
      authorName: "Sumit Sharma",
      authorRole: "student",
      createdAt: "2026-07-05T09:20:00Z",
      status: "unresolved",
      comments: [
        {
          id: "c-3",
          authorName: "Pooja Pathak",
          authorRole: "student",
          content: "Synthesis of Bakelite is highly important. Our faculty mentioned that the mechanism of phenol-formaldehyde condensation polymerization is a core question almost every year.",
          createdAt: "2026-07-05T11:45:00Z",
          isVerifiedFaculty: false
        }
      ]
    },
    {
      id: "doubt-3",
      title: "Sign conventions in AC Circuits nodal analysis",
      content: "I am consistently getting wrong signs when doing mesh analysis on inductive/capacitive impedances. Do we treat phasor voltages as polar or rectangular coordinates while formulating the KVL loop equations?",
      courseId: "c-bt104",
      courseCode: "BT-104",
      courseName: "Basic Electrical Engineering",
      authorName: "Jay Rajput",
      authorRole: "student",
      createdAt: "2026-07-05T18:00:00Z",
      status: "unresolved",
      comments: []
    }
  ]);

  // ----------------------------------------------------
  // 2. SEARCH & FILTER STATE
  // ----------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  
  // ----------------------------------------------------
  // 3. ASK A DOUBT MODAL STATE
  // ----------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCourseId, setNewCourseId] = useState(mockCourses[0]?.id || "");

  // ----------------------------------------------------
  // 4. EXPANDABLE COMMENTS & NEW REPLY STATE
  // ----------------------------------------------------
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>("doubt-1");
  const [newReplyContent, setNewReplyContent] = useState("");

  // Filter doubts list dynamically
  const filteredDoubts = doubts.filter((doubt) => {
    const matchesSearch = 
      doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doubt.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = 
      selectedCourseFilter === "all" || doubt.courseId === selectedCourseFilter;

    return matchesSearch && matchesCourse;
  });

  // Handle post new doubt
  const handleAskDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const course = mockCourses.find((c) => c.id === newCourseId);
    if (!course) return;

    const newDoubt: Doubt = {
      id: `doubt-${Date.now()}`,
      title: newTitle,
      content: newContent,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      authorName: student.name,
      authorRole: "student",
      createdAt: new Date().toISOString(),
      status: "unresolved",
      comments: []
    };

    setDoubts([newDoubt, ...doubts]);
    
    // Clear forms and close modal
    setNewTitle("");
    setNewContent("");
    setIsModalOpen(false);
    
    // Expand the newly created doubt
    setExpandedDoubtId(newDoubt.id);
  };

  // Handle post comment reply
  const handleReplySubmit = (e: React.FormEvent, doubtId: string) => {
    e.preventDefault();
    if (!newReplyContent.trim()) return;

    const isFacultyUser = false; // Mocking reply as student user
    
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorName: student.name,
      authorRole: "student",
      content: newReplyContent,
      createdAt: new Date().toISOString(),
      isVerifiedFaculty: isFacultyUser
    };

    setDoubts((prevDoubts) =>
      prevDoubts.map((doubt) => {
        if (doubt.id === doubtId) {
          return {
            ...doubt,
            comments: [...doubt.comments, newComment]
          };
        }
        return doubt;
      })
    );

    setNewReplyContent("");
  };

  // Toggle unresolved/resolved status (Faculty simulate or Student self-mark)
  const toggleDoubtStatus = (doubtId: string) => {
    setDoubts((prevDoubts) =>
      prevDoubts.map((doubt) => {
        if (doubt.id === doubtId) {
          return {
            ...doubt,
            status: doubt.status === "resolved" ? "unresolved" : "resolved"
          };
        }
        return doubt;
      })
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Peer-to-Peer Doubt Forum
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask questions, help classmates, and get verified faculty feedback.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <svg className="h-4.5 w-4.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ask a Doubt
        </button>
      </div>

      {/* Main Forum Grid (Sidebar + List) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDEBAR: Course filters (col-span-1) */}
        <div className="glassmorphic-card p-5 rounded-2xl space-y-6 lg:sticky lg:top-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Course Categories
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Filter forum by academic papers.
            </p>
          </div>

          <div className="flex flex-col space-y-1.5">
            {/* All Courses filter */}
            <button
              onClick={() => setSelectedCourseFilter("all")}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-left ${
                selectedCourseFilter === "all"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 border border-transparent"
              }`}
            >
              <span>All Courses</span>
              <span className="text-[10px] font-mono opacity-60">({doubts.length})</span>
            </button>

            {/* Mocked course filters */}
            {mockCourses.map((course) => {
              const count = doubts.filter((d) => d.courseId === course.id).length;
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseFilter(course.id)}
                  className={`flex flex-col px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-left border ${
                    selectedCourseFilter === course.id
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[10px]">{course.code}</span>
                    <span className="text-[9px] font-mono opacity-50">({count})</span>
                  </div>
                  <span className="text-[10px] mt-1 line-clamp-1 opacity-80">
                    {course.name.replace(/\(.*?\)/, "").trim()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-indigo-500 dark:text-indigo-400 block mb-0.5">Forum Guidelines</span>
              Keep questions related to lectures, tutorials, and practical lab assignments. Be supportive and helpful!
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Doubt Search + Thread List (col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search doubts by title, question keywords or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80 text-sm outline-none focus:border-blue-500/50 transition-colors duration-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Doubts Thread list */}
          {filteredDoubts.length === 0 ? (
            <div className="glassmorphic-card p-12 text-center rounded-2xl space-y-2">
              <div className="flex justify-center text-slate-400 dark:text-slate-600">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8v4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No doubts found</h3>
              <p className="text-xs text-slate-400">
                Try adjusting your search keywords or course category filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoubts.map((doubt) => {
                const isExpanded = expandedDoubtId === doubt.id;
                const isResolved = doubt.status === "resolved";
                return (
                  <div
                    key={doubt.id}
                    className={`glassmorphic-card rounded-2xl overflow-hidden transition-all duration-300 border ${
                      isResolved
                        ? "border-blue-500/30 dark:border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                        : isExpanded
                        ? "border-blue-500/20 shadow-lg shadow-blue-500/2"
                        : "border-slate-200/60 dark:border-slate-850"
                    }`}
                  >
                    {/* Doubt Header details (always visible) */}
                    <div
                      onClick={() => setExpandedDoubtId(isExpanded ? null : doubt.id)}
                      className="p-5 cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-900/10 flex items-start gap-4 justify-between"
                    >
                      <div className="space-y-2">
                        {/* Tags row */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 uppercase">
                            {doubt.courseCode}
                          </span>
                          <span className="text-slate-400">• Posted by {doubt.authorName} ({doubt.authorRole})</span>
                          <span className="text-slate-400 font-normal">• {formatDate(doubt.createdAt)}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-snug">
                          {doubt.title}
                        </h3>
                        
                        {/* Brief content description (truncated if collapsed) */}
                        {!isExpanded && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {doubt.content}
                          </p>
                        )}
                      </div>

                      {/* Status Badges & Comments count */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {isResolved ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 uppercase tracking-wide">
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 uppercase tracking-wide">
                            Unresolved
                          </span>
                        )}
                        <span className="inline-flex items-center text-[10px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-2 py-0.5 rounded-md">
                          <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {doubt.comments.length}
                        </span>
                      </div>
                    </div>

                    {/* Extended Drawer contents */}
                    {isExpanded && (
                      <div className="border-t border-slate-200/50 dark:border-slate-800/80 p-5 bg-slate-100/20 dark:bg-slate-950/15 space-y-6">
                        {/* Full question body */}
                        <div className="space-y-3">
                          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {doubt.content}
                          </p>
                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="text-slate-400">Course: {doubt.courseName}</span>
                            <button
                              onClick={() => toggleDoubtStatus(doubt.id)}
                              className="text-blue-500 hover:underline bg-transparent border-0 outline-none cursor-pointer font-semibold"
                            >
                              Mark as {isResolved ? "Unresolved" : "Faculty Resolved"}
                            </button>
                          </div>
                        </div>

                        {/* Comments / Replies Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Replies & Discussions ({doubt.comments.length})
                          </h4>
                          
                          {doubt.comments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No replies posted yet. Share your inputs below!</p>
                          ) : (
                            <div className="space-y-3">
                              {doubt.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                                    comment.isVerifiedFaculty
                                      ? "bg-emerald-500/5 border-emerald-500/20"
                                      : "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/80"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-xs">
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{comment.authorName}</span>
                                      <span className="text-[10px] text-slate-400">({comment.authorRole})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {comment.isVerifiedFaculty && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 uppercase">
                                          Verified Instructor
                                        </span>
                                      )}
                                      <span className="text-[9px] text-slate-400">{formatDate(comment.createdAt)}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Inline Reply Form */}
                        <form onSubmit={(e) => handleReplySubmit(e, doubt.id)} className="space-y-3 pt-2">
                          <textarea
                            placeholder="Write your input or answer to this doubt..."
                            rows={3}
                            value={newReplyContent}
                            onChange={(e) => setNewReplyContent(e.target.value)}
                            className="w-full p-3 text-xs rounded-xl border bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80 outline-none focus:border-blue-500/50 transition-colors"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 transition-all cursor-pointer"
                            >
                              Post Reply
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ASK A DOUBT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity">
          {/* Modal Card container */}
          <div className="w-full max-w-xl glassmorphic-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between bg-slate-100/20 dark:bg-slate-950/20">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Ask a Doubt
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Post your academic question to the portal.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAskDoubtSubmit} className="p-6 space-y-4">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Course Category
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 outline-none focus:border-blue-500/50 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  {mockCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name.replace(/\(.*?\)/, "").trim()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question Title / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g., Confusion in the integration steps of Schrodinger's equation"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80 outline-none focus:border-blue-500/50 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Content textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question Details / Descriptions
                </label>
                <textarea
                  placeholder="Describe your doubt here. Include any formulas or steps you solved so far so peers and faculty can assist you accurately..."
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80 outline-none focus:border-blue-500/50 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
