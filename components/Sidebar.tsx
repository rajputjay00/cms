"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

// FIXED: Changed Dashboard href from "/" to "/student" to persist the logged-in session context
const navItems = [
  {
    name: "Dashboard", href: "/student", icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    )
  },
  {
    name: "Attendance", href: "/student/attendance", icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    name: "MST Marks", href: "/student/marks", icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    name: "Assignments", href: "/student/assignments", icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  {
    name: "Doubt Forum", href: "/student/forum", icon: (active: boolean) => (
      <svg className={`h-5 w-5 transition-colors ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    )
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // FIXED: Adjusted layout subpath pattern tracking parameters
  const isLinkActive = (href: string) => {
    if (href === "/student") {
      return pathname === "/student";
    }
    return pathname === href;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        <div className="px-2 py-4">
          <div className="flex items-center justify-center bg-white/95 dark:bg-white/95 rounded-xl border border-slate-200/50 dark:border-slate-800/80 p-2 shadow-sm">
            <img
              src="/ips-logo.png"
              alt="IPS Academy Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        <hr className="my-4 border-slate-200/50 dark:border-slate-800/50" />

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border-l-2 ${active
                    ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500 font-semibold shadow-inner shadow-blue-500/5"
                    : "text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
              >
                <span className="mr-3">{item.icon(active)}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4">
        <hr className="mb-4 border-slate-200/50 dark:border-slate-800/50" />
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 border border-transparent hover:border-slate-200/30 dark:hover:border-slate-800/30 cursor-pointer"
          aria-label="Toggle dark mode"
        >
          <div className="flex items-center space-x-3">
            {theme === "dark" ? (
              <>
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m14.071 8.071l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm font-medium">Light Theme</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm font-medium">Dark Theme</span>
              </>
            )}
          </div>
          <div className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-slate-300 dark:bg-slate-700">
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === "dark" ? "translate-x-4" : "translate-x-0"
                }`}
            />
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Bar - FIXED: Added concrete high-level z-index and solid background properties to prevent text bleeding */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-50/90 dark:bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center bg-white/95 dark:bg-white/95 rounded-lg border border-slate-200/50 dark:border-slate-800/80 px-2.5 py-1 shadow-sm">
          <img
            src="/ips-logo.png"
            alt="IPS Academy Logo"
            className="h-6 w-auto object-contain"
          />
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 focus:outline-none cursor-pointer"
        >
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Mobile Navigation Drawer - FIXED: Added absolute solid backdrop panel styles */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-950/98 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 p-6 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop Persistent Sidebar - FIXED: Normalized stacking layers context */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-slate-50/40 dark:bg-slate-900/20 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/40 p-6 m-4 h-[calc(100vh-2rem)] rounded-2xl shadow-sm">
        <SidebarContent />
      </div>
    </>
  );
}