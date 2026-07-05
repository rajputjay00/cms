"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, LayoutDashboard, Award, LogOut } from "lucide-react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isLoginPage = pathname === "/";

  // Dynamically map student/faculty dashboard paths
  const dashboardHref = pathname.startsWith("/faculty") ? "/faculty" : "/student";

  return (
    <>
      {isLoginPage ? (
        <main className="w-full min-h-screen relative flex items-center justify-center bg-slate-950 text-white overflow-hidden z-10 animate-page-entrance">
          {children}
        </main>
      ) : (
        // FIXED: Changed responsive layout target breakpoint context to lg to align perfectly with Sidebar.tsx
        <div className="flex flex-col lg:flex-row min-h-screen relative z-10">

          {/* Desktop Left Sidebar drawer component wrapper container - FIXED: Swapped md:block to lg:block */}
          <div className="hidden lg:block shrink-0 relative z-50">
            <Sidebar />
          </div>

          {/* Main Content Area - FIXED: Changed desktop padding breakpoint offset from md:pl-72 to lg:pl-72 to sit perfectly in line */}
          <main className="flex-1 lg:pl-72 p-4 lg:p-6 pb-20 lg:pb-6 w-full transition-all duration-300 animate-page-entrance">
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
      )}

      {/* Brand New Mobile Bottom Navbar component - FIXED: Visible ONLY below lg breakpoint to match the layout rules */}
      {!isLoginPage && (
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-t border-slate-800/60 p-3 flex justify-around items-center rounded-t-xl shadow-2xl animate-page-entrance select-none">
          {/* Dashboard Anchor */}
          <Link
            href={dashboardHref}
            className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${pathname === dashboardHref
                ? "text-blue-400 scale-105 font-bold"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px]">Dashboard</span>
          </Link>

          {/* Marks Anchor */}
          <Link
            href="/marks"
            className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-200 ${pathname === "/marks"
                ? "text-blue-400 scale-105 font-bold"
                : "text-slate-400 hover:text-slate-200"
              }`}
          >
            <Award className="h-5 w-5" />
            <span className="text-[10px]">Marks</span>
          </Link>

          {/* Logout Anchor */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-rose-500 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px]">Logout</span>
          </Link>
        </div>
      )}

      {/* Floating System Status & Accessibility Control Pill */}
      <div className="fixed bottom-4 right-4 lg:bottom-4 lg:right-4 z-[9999] backdrop-blur-xl bg-slate-900/60 dark:bg-slate-950/60 border border-slate-300/10 dark:border-slate-800/80 p-2 rounded-full flex items-center gap-2.5 shadow-2xl transition-all duration-300 max-lg:hidden">

        {/* Toggle Theme button */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Institutional Light Mode" : "Switch to High-Contrast Dark Mode"}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center shadow-inner border border-slate-300/5 dark:border-slate-800/10"
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-blue-400" />
          )}
        </button>

        {/* Network Status Badge */}
        <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Network: Online</span>
        </div>

      </div>
    </>
  );
}